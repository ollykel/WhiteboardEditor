// -- standard library imports

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

// -- third party imports

use tokio::sync::broadcast;
use serde::{Deserialize, Serialize};
use warp::ws::{Message, WebSocket};
use warp::Filter;

// -- local imports

use WebSocketServer::*;

#[tokio::main]
async fn main() {
    let port = 3000u16;
    let (tx, _rx) = broadcast::channel::<ServerSocketMessage>(100);

    let program_state_ref = Arc::new(ProgramState{
        tx: tx.clone(),
        next_client_id: Mutex::new(0),
        whiteboard: Mutex::new(Whiteboard{
            id: 0,
            name: String::from("First Shared Whiteboard"),
            canvases: vec![
                Canvas{
                    id: 0,
                    width: 512,
                    height: 512,
                    shapes: Vec::<ShapeModel>::new(),
                    allowedUsers: None, // None means open to all users
                }
            ]
        }),
        active_clients: Mutex::new(HashSet::<ClientIdType>::new())
    });

    let program_state_ref_filter = warp::any().map({
        let program_state_ref = Arc::clone(&program_state_ref);
        move || Arc::clone(&program_state_ref)
    });

    let ws_route = warp::path!("ws")
        .and(warp::ws())
        .and(program_state_ref_filter)
        .map(|ws: warp::ws::Ws, program_state_ref| {
            ws.on_upgrade(move |socket| handle_connection(socket, program_state_ref))
        });

    let addr: SocketAddr = ([0, 0, 0, 0], port).into();
    println!("Rust WebSocket server running at ws://{}", addr);
    warp::serve(ws_route).run(addr).await;
}// end async fn main()

async fn handle_connection(ws: WebSocket, program_state_ref: Arc<ProgramState>) {
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();
    let mut rx = program_state_ref.tx.subscribe();
    let current_client_id = {
        let mut next_client_id = program_state_ref.next_client_id.lock().await;
        let client_id = *next_client_id;

        *next_client_id += 1;

        client_id
    };

    println!("New client: {}", current_client_id);

    {
        // Add new client to active clients, notify other users that they have logged in
        let mut active_clients = program_state_ref.active_clients.lock().await;

        active_clients.insert(current_client_id);
        program_state_ref.tx.send(ServerSocketMessage::ClientLogin{
            client_id: current_client_id
        }).ok();
    }

    {
        // Send new client initialization message
        let whiteboard = program_state_ref.whiteboard.lock().await;
        let active_clients = program_state_ref.active_clients.lock().await;

        let init_msg = ServerSocketMessage::InitClient {
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
        let program_state_ref = Arc::clone(&program_state_ref);

        async move {
            while let Some(Ok(msg)) = user_ws_rx.next().await {
                println!("Client {} sent message ...", current_client_id);
                if let Ok(text_str) = msg.to_str() {
                    println!("Raw message: {}", text_str);

                    if let Ok(client_msg) = serde_json::from_str::<ClientSocketMessage>(text_str) {
                        println!("Received message from client {}", current_client_id);
                        
                        match client_msg {
                            ClientSocketMessage::CreateShapes{ canvas_id, ref shapes } => {
                                let mut whiteboard = program_state_ref.whiteboard.lock().await;
                                println!("Creating shape on canvas {} ...", canvas_id);

                                match whiteboard.canvases.get_mut(canvas_id as usize) {
                                    None => {
                                        // TODO: send an error handling message
                                        todo!()
                                    },
                                    Some(canvas) => {
                                        canvas.shapes.extend_from_slice(shapes.as_slice());

                                        // broadcast to all clients
                                        program_state_ref.tx.send(ServerSocketMessage::CreateShapes{
                                            client_id: current_client_id,
                                            canvas_id: canvas_id,
                                            shapes: shapes.clone()
                                        }).ok();
                                    }
                                };
                            },
                            ClientSocketMessage::CreateCanvas { width, height } => {
                                let mut whiteboard = program_state_ref.whiteboard.lock().await;
                                let new_canvas_id = whiteboard.canvases.len() as CanvasIdType;
                                let mut allowed = HashSet::new();

                                // Initialize new canvas with only current user allowed to edit
                                allowed.insert(current_client_id);

                                let allowedUsersVec = allowed.iter().copied().collect::<Vec<_>>();
                                
                                whiteboard.canvases.push(Canvas{
                                    id: new_canvas_id,
                                    width: width,
                                    height: height,
                                    shapes: Vec::<ShapeModel>::new(),
                                    allowedUsers: Some(allowed),
                                });

                                // broadcast to all clients
                                program_state_ref.tx.send(ServerSocketMessage::CreateCanvas{
                                    client_id: current_client_id,
                                    canvas_id: new_canvas_id,
                                    width: width,
                                    height: height,
                                    allowedUsers: allowedUsersVec,
                                }).ok();
                            },
                            // do nothing for all other messages
                            // _ => {}
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
        let mut active_clients = program_state_ref.active_clients.lock().await;

        active_clients.remove(&current_client_id);
        program_state_ref.tx.send(ServerSocketMessage::ClientLogout{ client_id: current_client_id }).ok();
    }

    println!("Client {} disconnected", current_client_id);
}// end handle_connection
