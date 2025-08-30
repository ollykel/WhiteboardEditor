// -- standard library imports

use std::{
    sync::Arc,
    net::SocketAddr,
    collections::{HashSet, HashMap},
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
                        shapes: Vec::<ShapeModel>::new(),
                        allowed_users: None, // None means open to all users
                    }
                ]
            }),
            active_users: Mutex::new(HashSet::new()),
            client_usernames: Mutex::new(HashMap::new()),
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

    // === 1. Wait for Register message ===
    let username: String = loop {
        if let Some(Ok(msg)) = user_ws_rx.next().await {
            if let Ok(msg_s) = msg.to_str() {
                if let Ok(client_msg) = serde_json::from_str::<ClientSocketMessage>(msg_s) {
                    if let ClientSocketMessage::Register { username } = client_msg {
                        break username;
                    }
                }
            }
        } else {
            // Connection closed before registration
            return;
        }
    };

    println!("New client: {} (username: {})", current_client_id, username);

    // === 2. Store username in state ===
    {
        let mut client_usernames = connection_state_ref.program_state.client_usernames.lock().await;
        client_usernames.insert(current_client_id, username.clone());
    }
    {
        let mut active_users = connection_state_ref.program_state.active_users.lock().await;
        active_users.insert(username.clone());
    }

    // === 3. Broadcast login ===
    connection_state_ref.tx.send(ServerSocketMessage::ClientLogin {
        username: username.clone(),
    }).ok();
    // Broadcast full active user list
    {
        let active_users = connection_state_ref.program_state.active_users.lock().await;
        connection_state_ref.tx.send(ServerSocketMessage::ActiveUsersUpdate {
            active_users: active_users.iter().cloned().collect(),
        }).ok();
    }

    // === 4. Send InitClient message ===
    {
        let whiteboard = connection_state_ref.program_state.whiteboard.lock().await;
        let active_users = connection_state_ref.program_state.active_users.lock().await;
        let init_msg = ServerSocketMessage::InitClient {
            username: username.clone(),
            active_users: active_users.iter().cloned().collect(),
            whiteboard: whiteboard.to_client_view(),
        };
        let _ = user_ws_tx.send(Message::text(serde_json::to_string(&init_msg).unwrap())).await;
    }

    // === 5. Spawn send/receive tasks ===
    let username_send = username.clone();
    let send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            // Only send IndividualError if for this username
            if let ServerSocketMessage::IndividualError { ref username, .. } = msg {
                if username == &username_send {
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
        let username = username.clone();
        async move {
            while let Some(Ok(msg)) = user_ws_rx.next().await {
                if let Ok(msg_s) = msg.to_str() {
                    // Ignore Register messages after the first
                    if let Ok(ClientSocketMessage::Register { .. }) = serde_json::from_str::<ClientSocketMessage>(msg_s) {
                        continue;
                    }
                    let client_usernames = connection_state_ref.program_state.client_usernames.lock().await;
                    let client_id = client_usernames.iter().find_map(|(id, name)| if name == &username { Some(*id) } else { None });
                    drop(client_usernames);
                    if let Some(client_id) = client_id {
                        let resp = handle_client_message(
                            &connection_state_ref.program_state,
                            client_id,
                            msg_s
                        ).await;
                        if let Some(resp) = resp {
                            connection_state_ref.tx.send(resp).ok();
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

    // === 6. Remove user from state and broadcast logout ===
    {
        let mut active_users = connection_state_ref.program_state.active_users.lock().await;
        active_users.remove(&username);
    }
    {
        let mut client_usernames = connection_state_ref.program_state.client_usernames.lock().await;
        client_usernames.retain(|_, name| name != &username);
    }
    connection_state_ref.tx.send(ServerSocketMessage::ClientLogout { username: username.clone() }).ok();
    // Broadcast full active user list after logout
    {
        let active_users = connection_state_ref.program_state.active_users.lock().await;
        connection_state_ref.tx.send(ServerSocketMessage::ActiveUsersUpdate {
            active_users: active_users.iter().cloned().collect(),
        }).ok();
    }
    println!("Client {} (username: {}) disconnected", current_client_id, username);
}
