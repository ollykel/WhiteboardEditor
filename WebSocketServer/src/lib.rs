// -- standard library imports

use std::{
    sync::Arc,
    collections::HashSet,
};

// -- third party imports

use futures::{
    lock::Mutex,
};

use tokio::sync::broadcast;
use serde::{Deserialize, Serialize};

pub type ClientIdType = i32;
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
    pub allowed_users: Vec<ClientIdType>,
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
    InitClient { client_id: ClientIdType, active_clients: Vec<ClientIdType>, whiteboard: WhiteboardClientView },
    ClientLogin { client_id: ClientIdType },
    ClientLogout { client_id: ClientIdType },
    CreateShapes { client_id: ClientIdType, canvas_id: CanvasIdType, shapes: Vec<ShapeModel> },
    CreateCanvas { client_id: ClientIdType, canvas_id: CanvasIdType, width: u64, height: u64, allowed_users: Vec<ClientIdType> },
    IndividualError { client_id: ClientIdType, message: String },
    BroadcastError { message: String },
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
pub enum ClientSocketMessage {
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
    pub allowed_users: Option<HashSet<ClientIdType>>, // None = open to all
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
            allowed_users: match &self.allowed_users {
                Some(set) => set.iter().copied().collect(),
                None => vec![], // empty array means open to all
            },
        }
    }// end pub fn to_client_view(&self) -> CanvasClientView
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
pub struct ProgramState {
    pub whiteboard: Mutex<Whiteboard>,
    pub active_clients: Mutex<HashSet<ClientIdType>>
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
// @param connection_state_ref     -- Arc reference to current program state
// @param current_client_id     -- ID of sending client
// @param client_msg_s          -- Content of client message
// @return                      -- (Optional) Message to send to clients, if any
pub async fn handle_client_message(connection_state_ref: Arc<ConnectionState>, current_client_id: ClientIdType, client_msg_s: &str) -> Option<ServerSocketMessage> {
    if let Ok(client_msg) = serde_json::from_str::<ClientSocketMessage>(client_msg_s) {
        println!("Received message from client {}", current_client_id);
        
        match client_msg {
            ClientSocketMessage::CreateShapes{ canvas_id, ref shapes } => {
                let mut whiteboard = connection_state_ref
                    .program_state
                    .whiteboard.lock().await;
                println!("Creating shape on canvas {} ...", canvas_id);

                match whiteboard.canvases.get_mut(canvas_id as usize) {
                    None => {
                        // TODO: send an error handling message
                        todo!()
                    },
                    Some(canvas) => {
                        canvas.shapes.extend_from_slice(shapes.as_slice());

                        Some(ServerSocketMessage::CreateShapes{
                            client_id: current_client_id,
                            canvas_id: canvas_id,
                            shapes: shapes.clone()
                        })
                    }
                }
            },
            ClientSocketMessage::CreateCanvas { width, height } => {
                let mut whiteboard = connection_state_ref
                    .program_state
                    .whiteboard.lock().await;
                let new_canvas_id = whiteboard.canvases.len() as CanvasIdType;
                let mut allowed = HashSet::new();

                // Initialize new canvas with only current user allowed to edit
                allowed.insert(current_client_id);

                let allowed_users_vec = allowed.iter().copied().collect::<Vec<_>>();
                
                whiteboard.canvases.push(Canvas{
                    id: new_canvas_id,
                    width: width,
                    height: height,
                    shapes: Vec::<ShapeModel>::new(),
                    allowed_users: Some(allowed),
                });

                Some(ServerSocketMessage::CreateCanvas{
                    client_id: current_client_id,
                    canvas_id: new_canvas_id,
                    width: width,
                    height: height,
                    allowed_users: allowed_users_vec,
                })
            },
        }
    } else {
        println!("ERROR: invalid client message: {}", client_msg_s);

        Some(ServerSocketMessage::IndividualError{
            client_id: current_client_id,
            message: String::from("invalid client message")
        })
    }
}// end handle_client_message
