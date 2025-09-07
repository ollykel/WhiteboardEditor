// -- standard library imports

use std::{
    sync::Arc,
    net::SocketAddr,
    collections::HashSet,
    collections::HashMap,
};

use futures::{
    lock::Mutex,
    SinkExt,
    StreamExt,
};

// -- third party imports

use tokio::sync::broadcast;
use warp::ws::{Message, WebSocket};
use warp::Filter;

// -- local imports

use web_socket_server::*;

#[tokio::main]
async fn main() {
    let port = 3000u16;
    let (tx, _rx) = broadcast::channel::<ServerSocketMessage>(100);

    let connection_state_ref = Arc::new(ConnectionState{
        tx: tx.clone(),
        next_client_id: Mutex::new(0),
        program_state: ProgramState{
            whiteboards: Mutex::new(HashMap::from([
                (0, Arc::new(Mutex::new(Whiteboard {
                    id: 0,
                    name: String::from("First Shared Whiteboard"),
                    canvases: vec![
                        Canvas{
                            id: 0,
                            width: 512,
                            height: 512,
                            shapes: HashMap::<CanvasObjectIdType, ShapeModel>::new(),
                            next_shape_id: 0,
                            allowed_users: None, // None means open to all users
                        }
                    ]
                })))
            ])),
            active_clients: Mutex::new(HashSet::<ClientIdType>::new())
        }
    });

    let connection_state_ref_filter = warp::any().map({
        let connection_state_ref = Arc::clone(&connection_state_ref);
        move || Arc::clone(&connection_state_ref)
    });

    let ws_route = warp::path!("ws" / WhiteboardIdType)
        .and(warp::ws())
        .and(connection_state_ref_filter)
        .map(|wid: WhiteboardIdType, ws: warp::ws::Ws, connection_state_ref| {
            ws.on_upgrade(move |socket| handle_connection(socket, wid, connection_state_ref))
        });

    let addr: SocketAddr = ([0, 0, 0, 0], port).into();
    println!("Rust WebSocket server running at ws://{}", addr);
    warp::serve(ws_route).run(addr).await;
}// end async fn main()

async fn handle_connection(ws: WebSocket, whiteboard_id: WhiteboardIdType, connection_state_ref: Arc<ConnectionState>) {
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();
    let mut rx = connection_state_ref.tx.subscribe();
    let current_client_id = {
        let mut next_client_id = connection_state_ref.next_client_id.lock().await;
        let client_id = *next_client_id;

        *next_client_id += 1;

        client_id
    };

    println!("New client: {}", current_client_id);

    let client_state_ref = {
        // - Fetch whiteboard identified by id from program state
        // - TODO: If not present, try to fetch from the database
        // - If no such whiteboard, send an individual error message and disconnect
        let whiteboards_by_id = connection_state_ref.program_state.whiteboards.lock().await;

        match whiteboards_by_id.get(&whiteboard_id) {
            None => {
                // No such whiteboard; send individual error and disconnect
                // IndividualError { client_id: ClientIdType, message: String },
                let err_msg = ServerSocketMessage::IndividualError {
                    client_id: current_client_id,
                    message: format!("Whiteboard {} not found", whiteboard_id)
                };
                
                let _ = user_ws_tx.send(Message::text(serde_json::to_string(&err_msg).unwrap())).await;

                // trigger early disconnect
                return;
            },
            Some(whiteboard_ref) => Arc::new(ClientState {
                client_id: current_client_id,
                whiteboard_ref: Arc::clone(whiteboard_ref)
            })
        }
    };

    {
        // Add new client to active clients, notify other users that they have logged in
        let mut active_clients = connection_state_ref
            .program_state
            .active_clients.lock().await;

        active_clients.insert(current_client_id);
        connection_state_ref.tx.send(ServerSocketMessage::ClientLogin{
            client_id: current_client_id
        }).ok();
    }

    {
        // Send new client initialization message
        let whiteboard = client_state_ref.whiteboard_ref.lock().await;

        let active_clients = connection_state_ref
            .program_state
            .active_clients.lock().await;

        let init_msg = ServerSocketMessage::InitClient {
            client_id: current_client_id,
            active_clients: active_clients.iter().map(|&val| val).collect(),
            whiteboard: whiteboard.to_client_view()
        };

        let _ = user_ws_tx.send(Message::text(serde_json::to_string(&init_msg).unwrap())).await;
    }

    let send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if let ServerSocketMessage::IndividualError { client_id, .. } = msg {
                if client_id == current_client_id {
                    let json = serde_json::to_string(&msg).unwrap();
                    if user_ws_tx.send(Message::text(json)).await.is_err() {
                        break;
                    }
                }
            } else {
                let json = serde_json::to_string(&msg).unwrap();
                if user_ws_tx.send(Message::text(json)).await.is_err() {
                    break;
                }
            }
        }
    });

    let recv_task = tokio::spawn({
        let client_state_ref = Arc::clone(&client_state_ref);
        let connection_state_ref = Arc::clone(&connection_state_ref);

        async move {
            while let Some(Ok(msg)) = user_ws_rx.next().await {
                println!("Client {} sent message ...", current_client_id);
                if let Ok(msg_s) = msg.to_str() {
                    println!("Raw message: {}", msg_s);

                    let resp = handle_client_message(
                        &client_state_ref,
                        msg_s
                    ).await;

                    if let Some(resp) = resp {
                        connection_state_ref.tx.send(resp).ok();
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
        let mut active_clients = connection_state_ref
            .program_state
            .active_clients.lock().await;

        active_clients.remove(&current_client_id);
        connection_state_ref.tx.send(ServerSocketMessage::ClientLogout{ client_id: current_client_id }).ok();
    }

    println!("Client {} disconnected", current_client_id);
}// end handle_connection
