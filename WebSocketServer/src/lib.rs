// -- standard library imports

use std::{
    collections::HashSet,
};

// -- third party imports

use futures::{
    lock::Mutex,
};

use tokio::sync::broadcast;
use serde::{Deserialize, Serialize};

pub type ClientIdType = i32; // Still used for internal tracking, but not exposed to client
pub type Username = String;
pub type CanvasIdType = i32;
pub type WhiteboardIdType = i32;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
pub enum ShapeModel {
    Rect { x: f64, y: f64, width: f64, height: f64 },
    Ellipse { x: f64, y: f64, radius_x: f64, radius_y: f64 },
    Vector { points: Vec<f64> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanvasClientView {
    pub id: CanvasIdType,
    pub width: u64,
    pub height: u64,
    pub shapes: Vec<ShapeModel>,
    pub allowed_users: Vec<Username>, // usernames instead of client IDs
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WhiteboardClientView {
    pub id: WhiteboardIdType,
    pub name: String,
    pub canvases: Vec<CanvasClientView>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
pub enum ServerSocketMessage {
    InitClient { username: Username, active_users: Vec<Username>, whiteboard: WhiteboardClientView },
    ClientLogin { username: Username },
    ClientLogout { username: Username },
    ActiveUsersUpdate { active_users: Vec<Username> },
    CreateShapes { username: Username, canvas_id: CanvasIdType, shapes: Vec<ShapeModel> },
    CreateCanvas { username: Username, canvas_id: CanvasIdType, width: u64, height: u64, allowed_users: Vec<Username> },
    IndividualError { username: Username, message: String },
    BroadcastError { message: String },
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
pub enum ClientSocketMessage {
    // First message sent by client after connecting
    Register { username: Username },
    CreateShapes { canvas_id: CanvasIdType, shapes: Vec<ShapeModel> },
    CreateCanvas { width: u64, height: u64 }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Canvas {
    pub id: CanvasIdType,
    pub width: u64,
    pub height: u64,
    pub shapes: Vec<ShapeModel>,
    pub allowed_users: Option<HashSet<Username>>, // None = open to all
}

impl Canvas {
    pub fn to_client_view(&self) -> CanvasClientView {
        CanvasClientView {
            id: self.id,
            width: self.width,
            height: self.height,
            shapes: self.shapes.clone(),
            allowed_users: match &self.allowed_users {
                Some(set) => set.iter().cloned().collect(),
                None => vec![],
            },
        }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Whiteboard {
    pub id: WhiteboardIdType,
    pub name: String,
    pub canvases: Vec<Canvas>,
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

// === Program State ============================================================================== 
//
// Holds all program state that a web socket connection may need to manipulate.
//
// Encapsulating all program state in a single thread-safe object allows for efficient testing and
// passing of state between threads.
//
// ================================================================================================
use std::collections::HashMap;
pub struct ProgramState {
    pub whiteboard: Mutex<Whiteboard>,
    pub active_users: Mutex<HashSet<Username>>, // Set of usernames
    pub client_usernames: Mutex<HashMap<ClientIdType, Username>>, // Map client ID to username
}

// === Connection State ===========================================================================
//
// Holds program state plus data necessary for broadcasting to clients and managing connections.
//
// ================================================================================================
pub struct ConnectionState {
    pub tx: broadcast::Sender<ServerSocketMessage>,
    pub next_client_id: Mutex<ClientIdType>,
    pub program_state: ProgramState,
}

// Handle raw messages from clients.
// Input parameter is a string to enable testing on all possible inputs.
// @param program_state         -- Current program state
// @param current_client_id     -- ID of sending client
// @param client_msg_s          -- Content of client message
// @return                      -- (Optional) Message to send to clients, if any
pub async fn handle_client_message(program_state: &ProgramState, current_client_id: ClientIdType, client_msg_s: &str) -> Option<ServerSocketMessage> {
    use std::collections::HashSet;
    use serde_json::Value;
    // Look up username for this client
    let username = {
        let client_usernames = program_state.client_usernames.lock().await;
        client_usernames.get(&current_client_id).cloned().unwrap_or_else(|| "unknown".to_string())
    };
    if let Ok(client_msg) = serde_json::from_str::<ClientSocketMessage>(client_msg_s) {
        println!("Received message from client {} (username: {})", current_client_id, username);
        match client_msg {
            ClientSocketMessage::CreateShapes{ canvas_id, ref shapes } => {
                let mut whiteboard = program_state.whiteboard.lock().await;
                println!("Creating shape on canvas {} ...", canvas_id);
                match whiteboard.canvases.get_mut(canvas_id as usize) {
                    None => {
                        // TODO: send an error handling message
                        todo!()
                    },
                    Some(canvas) => {
                        canvas.shapes.extend_from_slice(shapes.as_slice());
                        Some(ServerSocketMessage::CreateShapes{
                            username: username.clone(),
                            canvas_id: canvas_id,
                            shapes: shapes.clone()
                        })
                    }
                }
            },
            ClientSocketMessage::CreateCanvas { width, height } => {
                let mut whiteboard = program_state.whiteboard.lock().await;
                let new_canvas_id = whiteboard.canvases.len() as CanvasIdType;
                let mut allowed = HashSet::new();
                allowed.insert(username.clone());
                let allowed_users_vec = allowed.iter().cloned().collect::<Vec<_>>();
                whiteboard.canvases.push(Canvas{
                    id: new_canvas_id,
                    width: width,
                    height: height,
                    shapes: Vec::<ShapeModel>::new(),
                    allowed_users: Some(allowed),
                });
                Some(ServerSocketMessage::CreateCanvas{
                    username: username.clone(),
                    canvas_id: new_canvas_id,
                    width: width,
                    height: height,
                    allowed_users: allowed_users_vec,
                })
            },
            ClientSocketMessage::Register { .. } => {
                // Registration is handled in connection setup, ignore here
                None
            }
        }
    } else {
        println!("ERROR: invalid client message: {}", client_msg_s);
        Some(ServerSocketMessage::IndividualError{
            username: username,
            message: String::from("invalid client message")
        })
    }
}// end handle_client_message

// -- Begin tests
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn handle_invalid_client_message() {
        // not even valid json
        let program_state = ProgramState{
            whiteboard: Mutex::new(Whiteboard{
                id: 0,
                name: String::from("Test"),
                canvases: vec![]
            }),
            active_clients: Mutex::new(HashSet::new())
        };
        let test_client_id = 0;
        let client_msg_s = "This is not valid json";

        let resp = handle_client_message(&program_state, test_client_id, client_msg_s).await;

        match resp {
            None => panic!("Expected some client message, got None"),
            Some(server_msg) => match server_msg {
                ServerSocketMessage::IndividualError { client_id, .. } => {
                    if client_id != test_client_id {
                        panic!("Expected client_id = {}; got {}", test_client_id, client_id);
                    } else {
                        // success
                    }
                },
                _ => panic!("Expected ServerSocketMessage::IndividualError, got {:?}", server_msg)
            }
        };
    }
}
