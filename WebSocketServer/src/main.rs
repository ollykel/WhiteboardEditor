// -- standard library imports

use std::{
    env,
    process,
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

use mongodb::{
    bson::{
        doc,
        oid::ObjectId,
        DateTime
    },
    Collection
};

// -- local imports

use web_socket_server::*;

#[tokio::main]
async fn main() -> process::ExitCode {
    let port = 3000u16;
    let mongo_uri = match env::var("MONGO_URI") {
        Err(e) => {
            eprintln!("Could not find $MONGO_URI: {}", e);
            return process::ExitCode::FAILURE;
        },
        Ok(uri) => uri
    };
    let mongo_client = match connect_mongodb(mongo_uri.as_str()).await {
        Err(e) => {
            eprintln!("Could not connect to mongodb at {}: {}", &mongo_uri, e);
            return process::ExitCode::FAILURE;
        },
        Ok(client) => client
    };
    // broadcaster for initial whiteboard

    let connection_state_ref = Arc::new(ConnectionState{
        next_client_id: Mutex::new(0),
        mongo_client: mongo_client,
        program_state: ProgramState{
            whiteboards: Mutex::new(HashMap::new()),
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

    process::ExitCode::SUCCESS
}// end async fn main()

async fn handle_connection(ws: WebSocket, whiteboard_id: WhiteboardIdType, connection_state_ref: Arc<ConnectionState>) {
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();

    let current_client_id = {
        let mut next_client_id = connection_state_ref.next_client_id.lock().await;
        let client_id = *next_client_id;
        *next_client_id += 1;
        client_id
    };

    println!("New client: {}", current_client_id);

    // -- generate object id for whiteboard
    let oid: ObjectId = match ObjectId::parse_str(&whiteboard_id) {
        Err(e) => {
            eprintln!("Couldn't parse ObjectId from {}: {}", whiteboard_id, e);

            let err_msg = ServerSocketMessage::IndividualError {
                client_id: current_client_id,
                message: format!("Error fetching whiteboard {}", whiteboard_id)
            };
            
            let _ = user_ws_tx.send(Message::text(serde_json::to_string(&err_msg).unwrap())).await;

            return;
        },
        Ok(oid) => oid
    };

    let shared_whiteboard_entry : SharedWhiteboardEntry = {
        // - Fetch whiteboard identified by id from program state
        // - TODO: If not present, try to fetch from the database
        // - If no such whiteboard, send an individual error message and disconnect
        let mut whiteboards_by_id = connection_state_ref.program_state.whiteboards.lock().await;
        let whiteboard_res = whiteboards_by_id.get(&whiteboard_id);

        match &whiteboard_res {
            &None => {
                // Try to fetch whiteboard from the database.
                // If present, load into cache.
                // Otherwise, return (disconnect) early.
                let whiteboard_coll: Collection<WhiteboardMongoDBView> = match connection_state_ref
                    .mongo_client
                    .default_database() {
                        None => {
                            // No database specified in mongo uri
                            // Print error and disconnect early
                            eprintln!("Database connection error; could not fetch whiteboard - no default database defined in mongo uri");
                            let err_msg = ServerSocketMessage::IndividualError {
                                client_id: current_client_id,
                                message: format!("Error fetching whiteboard {}", whiteboard_id)
                            };
                            
                            let _ = user_ws_tx.send(Message::text(serde_json::to_string(&err_msg).unwrap())).await;

                            return;
                        },
                        Some(db) => db.collection::<WhiteboardMongoDBView>("whiteboards")
                };

                match whiteboard_coll.find_one(doc! { "_id": oid }).await {
                    Err(e) => {
                        // connection error: print and disconnect
                        eprintln!("Connection error; could not fetch whiteboard: {}", e);

                        let err_msg = ServerSocketMessage::IndividualError {
                            client_id: current_client_id,
                            message: format!("Error fetching whiteboard {}", whiteboard_id)
                        };
                        
                        let _ = user_ws_tx.send(Message::text(serde_json::to_string(&err_msg).unwrap())).await;

                        return;
                    },
                    Ok(res) => match &res {
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
                        Some(whiteboard_db_view) => {
                            // Create new reference to whiteboard
                            let whiteboard = whiteboard_db_view.to_whiteboard();
                            let whiteboard_id = whiteboard.id.clone();
                            let whiteboard_ref = Arc::new(Mutex::new(whiteboard));

                            // sender
                            // TODO: replace 100 with value from a config
                            let (tx, _rx) = broadcast::channel::<ServerSocketMessage>(100);
                            let shared_whiteboard_entry = SharedWhiteboardEntry {
                                whiteboard_ref: Arc::clone(&whiteboard_ref),
                                whiteboard_id: oid.clone(),
                                broadcaster: tx.clone(),
                                active_clients: Arc::new(Mutex::new(HashMap::new())),
                                diffs: Arc::new(Mutex::new(Vec::new())),
                            };

                            // insert whiteboard into cache
                            whiteboards_by_id.insert(whiteboard_id, shared_whiteboard_entry.clone());

                            // return new shared whiteboard entry
                            shared_whiteboard_entry.clone()
                        }
                    }
                }
            },
            &Some(shared_whiteboard_entry) => shared_whiteboard_entry.clone()
        }
    };

    // -- subscribe to broadcaster
    let tx = shared_whiteboard_entry.broadcaster.clone();
    let mut rx = tx.subscribe();

    // -- create client state
    let client_state_ref = Arc::new(ClientState {
        client_id: current_client_id,
        whiteboard_ref: Arc::clone(&shared_whiteboard_entry.whiteboard_ref),
        active_clients: Arc::clone(&shared_whiteboard_entry.active_clients),
        diffs: Arc::clone(&shared_whiteboard_entry.diffs)
    });

    // Send init message immediately
    {
        let whiteboard = shared_whiteboard_entry.whiteboard_ref.lock().await;
        let init_msg = ServerSocketMessage::InitClient {
            client_id: current_client_id,
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
        let tx = tx.clone();
        let client_state_ref = Arc::clone(&client_state_ref);
        let whiteboard_coll: Collection<WhiteboardMongoDBView> = match connection_state_ref
            .mongo_client
            .default_database() {
                None => {
                    // No database specified in mongo uri
                    // Print error and disconnect early
                    eprintln!("Database connection error; could not fetch whiteboard - no default database defined in mongo uri");
                    let err_msg = ServerSocketMessage::IndividualError {
                        client_id: current_client_id,
                        message: format!("Error fetching whiteboard {}", whiteboard_id)
                    };
                    
                    let _ = tx.send(err_msg);

                    return;
                },
                Some(db) => db.collection::<WhiteboardMongoDBView>("whiteboards")
        };
        let whiteboard_filter = doc! { "_id": oid };

        async move {
            while let Some(Ok(msg)) = user_ws_rx.next().await {
                println!("Client {} sent message ...", current_client_id);
                if let Ok(msg_s) = msg.to_str() {
                    println!("Raw message: {}", msg_s);

                    let resp = handle_client_message(
                        &client_state_ref,
                        msg_s
                    ).await;

                    // -- update database, if there are diffs
                    {
                        let mut diffs = client_state_ref.diffs.lock().await;

                        if ! diffs.is_empty() {
                            for diff in diffs.iter() {
                                match diff {
                                    WhiteboardDiff::CreateCanvas { width, height } => {
                                        let now = DateTime::now();
                                        let update_res = whiteboard_coll.update_one(
                                            whiteboard_filter.clone(),
                                            doc! {
                                                "$push": {
                                                    "canvases": {
                                                        "width": width,
                                                        "height": height,
                                                        "time_created": now,
                                                        "time_last_modified": now,
                                                        "allowed_users":  Vec::<i32>::new(),
                                                        "shapes": {}
                                                    }
                                                }
                                            }
                                        ).await;

                                        match update_res {
                                            Err(e) => {
                                                eprintln!("CreateCanvas update failed: {}", e);
                                            },
                                            Ok(update) => {
                                                eprintln!("CreateCanvas matched count: {}", update.matched_count);
                                                eprintln!("CreateCanvas modified count: {}", update.modified_count);
                                            }
                                        };
                                    },
                                    WhiteboardDiff::CreateShapes { canvas_id: _canvas_id , shapes: _shapes } => {
                                        // TODO: implement
                                    },
                                    WhiteboardDiff::UpdateShapes { canvas_id: _canvas_id , shapes: _shapes } => {
                                        // TODO: implement
                                    }
                                }
                            }// -- end for &diff in diffs

                            // -- clear diffs
                            diffs.clear();
                        }
                    }

                    // -- send response to clients, if requested
                    if let Some(resp) = resp {
                        tx.send(resp).ok();
                    }
                }
            }
        }
    });

    tokio::select! {
        _ = send_task => {},
        _ = recv_task => {},
    }

    // Cleanup when client disconnects
    {
        let mut clients = shared_whiteboard_entry.active_clients.lock().await;
        clients.remove(&current_client_id);

        // Deduplicate by user_id
        let mut seen = HashSet::new();
        let users: Vec<UserSummary> = clients
            .values()
            .filter(|u| seen.insert(u.user_id.clone())) // only first occurences
            .cloned() // turn &UserSummary into UserSummary
            .collect();

        tx.send(ServerSocketMessage::ActiveUsers { users }).ok();
    }

    println!("Client {} disconnected", current_client_id);
}
