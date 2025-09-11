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
            whiteboard: Mutex::new(Whiteboard{
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
            }),
            active_clients: Mutex::new(HashMap::<ClientIdType, (String, String)>::new()),
        }
    });

    let connection_state_ref_filter = warp::any().map({
        let connection_state_ref = Arc::clone(&connection_state_ref);
        move || Arc::clone(&connection_state_ref)
    });

    let ws_route = warp::path!("ws")
        .and(warp::ws())
        .and(connection_state_ref_filter)
        .map(|ws: warp::ws::Ws, connection_state_ref| {
            ws.on_upgrade(move |socket| handle_connection(socket, connection_state_ref))
        });

    let addr: SocketAddr = ([0, 0, 0, 0], port).into();
    println!("Rust WebSocket server running at ws://{}", addr);
    warp::serve(ws_route).run(addr).await;
}// end async fn main()

async fn handle_connection(ws: WebSocket, connection_state_ref: Arc<ConnectionState>) {
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();
    let mut rx = connection_state_ref.tx.subscribe();
    let current_client_id = {
        let mut next_client_id = connection_state_ref.next_client_id.lock().await;
        let client_id = *next_client_id;

        *next_client_id += 1;

        client_id
    };

    let first_msg = user_ws_rx.next().await();
    if let Some(Ok(msg)) = first_msg {
        if let Ok(msg_s) = msg.to_str() {
            if let Ok(ClientSocketMessage::Login { user_id, username }) = serde_json::from_str(msg_s) {
                // Add to active_clients
                {
                    let mut clients = connection_state_ref.program_state.active_clients.lock().await;
                    clients.insert(current_client_id, (user_id.clone(), username.clone()));
                }
                // Broadcast the full active users list, deduplicating users
                let users = {
                    let clients = connection_state_ref.program_state.active_clients.lock().await;
                    let mut seen = HashSet::new();
                    clients.values()
                        .filter(|(uid, )| seen.insert(uid.clone()))
                        .map(|(uid, uname)| UserSummary { user_id: uid.clone(), username: uname.clone() })
                        .collect::<Vec<_>>()
                };

                connection_state_ref.tx.send(ServerSocketMessage::ClientLogin { users }).ok();
            }
        }
    }

    println!("New client: {}", current_client_id);

    // {
    //     // Add new client to active clients, notify other users that they have logged in
    //     let mut active_clients = connection_state_ref
    //         .program_state
    //         .active_clients.lock().await;

    //     active_clients.insert(current_client_id);
    //     connection_state_ref.tx.send(ServerSocketMessage::ClientLogin{
    //         client_id: current_client_id
    //     }).ok();
    // }

    {
        // Send new client initialization message
        let whiteboard = connection_state_ref
            .program_state
            .whiteboard.lock().await;
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
        let connection_state_ref = Arc::clone(&connection_state_ref);

        async move {
            while let Some(Ok(msg)) = user_ws_rx.next().await {
                println!("Client {} sent message ...", current_client_id);
                if let Ok(msg_s) = msg.to_str() {
                    println!("Raw message: {}", msg_s);

                    let resp = handle_client_message(
                        &connection_state_ref.program_state,
                        current_client_id,
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
