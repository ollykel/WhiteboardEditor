use std::{
    sync::Arc,
    net::SocketAddr,
    collections::HashSet,
};

use futures::{
    lock::Mutex,
    SinkExt,
    StreamExt,
};

use tokio::sync::broadcast;
use serde::{Deserialize, Serialize};
use warp::ws::{Message, WebSocket};
use warp::Filter;

type ClientIdType = i32;
type CanvasIdType = i32;
type WhiteboardIdType = i32;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
enum ShapeModel {
    Rect { x: f64, y: f64, width: f64, height: f64 },
    Ellipse { x: f64, y: f64, radius_x: f64, radius_y: f64 },
    Vector { points: Vec<f64> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CanvasClientView {
    id: CanvasIdType,
    width: u64,
    height: u64,
    shapes: Vec<ShapeModel>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct WhiteboardClientView {
    id: WhiteboardIdType,
    name: String,
    canvases: Vec<CanvasClientView>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
enum WebSocketMessage {
    InitClient { client_id: ClientIdType, active_clients: Vec<ClientIdType>, whiteboard: WhiteboardClientView },
    ClientLogin { client_id: ClientIdType },
    ClientLogout { client_id: ClientIdType },
    CreateShape { client_id: ClientIdType, canvas_id: CanvasIdType, shape: ShapeModel },
    CreateCanvas { client_id: ClientIdType, canvas_id: CanvasIdType, width: u64, height: u64 },
}

#[derive(Clone)]
struct Canvas {
    id: CanvasIdType,
    width: u64,
    height: u64,
    shapes: Vec<ShapeModel>,
}

impl Canvas {
    pub fn to_client_view(&self) -> CanvasClientView {
        // At the moment, the client view is identical to the Canvas type itself, but this may not
        // always be the case.
        CanvasClientView {
            id: self.id,
            width: self.width,
            height: self.height,
            shapes: self.shapes.clone(),
        }
    }// end pub fn to_client_view(&self) -> CanvasClientView
}

#[derive(Clone)]
struct Whiteboard {
    id: WhiteboardIdType,
    name: String,
    canvases: Vec<Canvas>,
}

impl Whiteboard {
    pub fn to_client_view(&self) -> WhiteboardClientView {
        // At the moment, the client view is identical to the Canvas type itself, but this may not
        // always be the case.
        WhiteboardClientView {
            id: self.id,
            name: self.name.clone(),
            canvases: self.canvases.iter()
                .map(|c| c.to_client_view())
                .collect()
        }
    }// end pub fn to_client_view(&self) -> CanvasClientView
}

#[tokio::main]
async fn main() {
    let port = 3000u16;
    let next_client_id: Arc<Mutex<ClientIdType>> = Arc::new(Mutex::new(0));

    // start with a simple whiteboard with one blank canvas
    let shared_whiteboard = Arc::new(Mutex::new(Whiteboard{
        id: 0,
        name: String::from("First Shared Whiteboard"),
        canvases: vec![
            Canvas{
                id: 0,
                width: 512,
                height: 512,
                shapes: Vec::<ShapeModel>::new()
            }
        ]
    }));

    let active_clients = Arc::new(Mutex::new(HashSet::<ClientIdType>::new()));

    let (tx, _rx) = broadcast::channel::<WebSocketMessage>(100);

    let tx_filter = warp::any().map({
        let tx = tx.clone();
        move || tx.clone()
    });

    let next_client_id_filter = warp::any().map({
        let next_client_id = Arc::clone(&next_client_id);
        move || Arc::clone(&next_client_id)
    });

    let shared_whiteboard_filter = warp::any().map({
        let shared_whiteboard = Arc::clone(&shared_whiteboard);
        move || Arc::clone(&shared_whiteboard)
    });

    let active_clients_filter = warp::any().map({
        let active_clients = Arc::clone(&active_clients);
        move || Arc::clone(&active_clients)
    });

    let ws_route = warp::path!("ws")
        .and(warp::ws())
        .and(tx_filter)
        .and(next_client_id_filter)
        .and(shared_whiteboard_filter)
        .and(active_clients_filter)
        .map(|ws: warp::ws::Ws, tx, next_client_id, shared_whiteboard, active_clients| {
            ws.on_upgrade(move |socket| handle_connection(socket, tx, next_client_id, shared_whiteboard, active_clients))
        });

    let addr: SocketAddr = ([0, 0, 0, 0], port).into();
    println!("Rust WebSocket server running at ws://{}", addr);
    warp::serve(ws_route).run(addr).await;
}// end async fn main()

async fn handle_connection(ws: WebSocket, tx: broadcast::Sender<WebSocketMessage>, next_client_id: Arc<Mutex<ClientIdType>>, shared_whiteboard: Arc<Mutex<Whiteboard>>, active_clients: Arc<Mutex<HashSet<ClientIdType>>>) {
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();
    let mut rx = tx.subscribe();
    let current_client_id = {
        let mut next_client_id = next_client_id.lock().await;
        let client_id = *next_client_id;

        *next_client_id += 1;

        client_id
    };

    println!("New client: {}", current_client_id);

    {
        // Add new client to active clients, notify other users that they have logged in
        let mut active_clients = active_clients.lock().await;

        active_clients.insert(current_client_id);
        tx.send(WebSocketMessage::ClientLogin{ client_id: current_client_id }).ok();
    }

    {
        // Send new client initialization message
        let whiteboard = shared_whiteboard.lock().await;
        let active_clients = active_clients.lock().await;

        let init_msg = WebSocketMessage::InitClient {
            client_id: current_client_id,
            active_clients: active_clients.iter().map(|&val| val).collect(),
            whiteboard: whiteboard.to_client_view()
        };

        let _ = user_ws_tx.send(Message::text(serde_json::to_string(&init_msg).unwrap())).await;
    }

    let send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            let json = serde_json::to_string(&msg).unwrap();
            if user_ws_tx.send(Message::text(json)).await.is_err() {
                break;
            }
        }
    });

    let recv_task = tokio::spawn({
        let whiteboard_ref = Arc::clone(&shared_whiteboard);
        let tx = tx.clone();

        async move {
            while let Some(Ok(msg)) = user_ws_rx.next().await {
                println!("Client {} sent message ...", current_client_id);
                if let Ok(text_str) = msg.to_str() {
                    println!("Raw message: {}", text_str);

                    if let Ok(mut client_msg) = serde_json::from_str::<WebSocketMessage>(text_str) {
                        println!("Received message from client {}", current_client_id);

                        match client_msg {
                            WebSocketMessage::CreateShape { ref mut client_id, canvas_id, ref shape } => {
                                let mut whiteboard = whiteboard_ref.lock().await;
                                println!("Creating shape on canvas {} ...", canvas_id);

                                match whiteboard.canvases.get_mut(canvas_id as usize) {
                                    None => {
                                        // TODO: send an error handling message
                                        todo!()
                                    },
                                    Some(canvas) => {
                                        canvas.shapes.push(shape.clone());

                                        // broadcast to all clients
                                        *client_id = current_client_id;
                                        tx.send(client_msg).ok();
                                    }
                                };
                            },
                            WebSocketMessage::CreateCanvas { ref mut client_id, ref mut canvas_id, width, height } => {
                                let mut whiteboard = whiteboard_ref.lock().await;
                                let new_canvas_id = whiteboard.canvases.len() as CanvasIdType;

                                whiteboard.canvases.push(Canvas{
                                    id: new_canvas_id,
                                    width: width,
                                    height: height,
                                    shapes: Vec::<ShapeModel>::new()
                                });

                                // broadcast to all clients
                                *client_id = current_client_id;
                                *canvas_id = new_canvas_id;
                                tx.send(client_msg).ok();
                            },
                            // do nothing for all other messages
                            _ => {}
                        }
                    }
                }
            }
        }
    });

    tokio::select! {
        _ = send_task => {},
        _ = recv_task => {},
    }

    // Remove client from active clients, notify other clients of logout
    {
        // Add new client to active clients, notify other users that they have logged in
        let mut active_clients = active_clients.lock().await;

        active_clients.remove(&current_client_id);
        tx.send(WebSocketMessage::ClientLogout{ client_id: current_client_id }).ok();
    }

    println!("Client {} disconnected", current_client_id);
}// end handle_connection
