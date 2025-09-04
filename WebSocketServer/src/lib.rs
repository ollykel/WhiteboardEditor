// -- standard library imports

use std::{
    collections::{
        HashSet,
        HashMap,
    }
};

// -- third party imports

use futures::{
    lock::Mutex,
};

use tokio::sync::broadcast;
use serde::{Deserialize, Serialize};

pub type ClientIdType = i32;
pub type CanvasIdType = i32;
pub type CanvasObjectIdType = i32;
pub type WhiteboardIdType = i32;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
pub enum ShapeModel {
    Rect {
        x: f64,
        y: f64,
        width: f64,
        height: f64,
        stroke_width: f64,
        stroke_color: String,
        fill_color: String
    },
    Ellipse {
        id: Option<CanvasObjectIdType>,
        x: f64,
        y: f64,
        radius_x: f64,
        radius_y: f64,
        stroke_width: f64,
        stroke_color: String,
        fill_color: String
    },
    Vector {
        id: Option<CanvasObjectIdType>,
        points: Vec<f64>,
        stroke_width: f64,
        stroke_color: String
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanvasClientView {
    pub id: CanvasIdType,
    pub width: u64,
    pub height: u64,
    pub shapes: HashMap<CanvasObjectIdType, ShapeModel>,
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
    CreateShapes { client_id: ClientIdType, canvas_id: CanvasIdType, shapes: HashMap<CanvasObjectIdType, ShapeModel> },
    UpdateShapes { client_id: ClientIdType, canvas_id: CanvasIdType, shapes: HashMap<CanvasObjectIdType, ShapeModel> },
    CreateCanvas { client_id: ClientIdType, canvas_id: CanvasIdType, width: u64, height: u64, allowed_users: Vec<ClientIdType> },
    IndividualError { client_id: ClientIdType, message: String },
    BroadcastError { message: String },
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
pub enum ClientSocketMessage {
    CreateShapes { canvas_id: CanvasIdType, shapes: Vec<ShapeModel> },
    UpdateShapes { canvas_id: CanvasIdType, shapes: HashMap<CanvasObjectIdType, ShapeModel> },
    CreateCanvas { width: u64, height: u64 }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Canvas {
    pub id: CanvasIdType,
    pub width: u64,
    pub height: u64,
    pub shapes: HashMap<CanvasObjectIdType, ShapeModel>,
    pub next_shape_id: CanvasObjectIdType,
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
// @param program_state         -- Current program state
// @param current_client_id     -- ID of sending client
// @param client_msg_s          -- Content of client message
// @return                      -- (Optional) Message to send to clients, if any
pub async fn handle_client_message(program_state: &ProgramState, current_client_id: ClientIdType, client_msg_s: &str) -> Option<ServerSocketMessage> {
    if let Ok(client_msg) = serde_json::from_str::<ClientSocketMessage>(client_msg_s) {
        println!("Received message from client {}", current_client_id);
        
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
                        let mut new_shapes = HashMap::<CanvasObjectIdType, ShapeModel>::new();

                        for shape in shapes.iter() {
                            let obj_id = canvas.next_shape_id;

                            new_shapes.insert(obj_id, shape.clone());
                            canvas.shapes.insert(obj_id, shape.clone());
                            canvas.next_shape_id += 1;
                        }// end for (idx, &mut shape) in new_shapes.iter_mut().enumerate()

                        Some(ServerSocketMessage::CreateShapes{
                            client_id: current_client_id,
                            canvas_id: canvas_id,
                            shapes: new_shapes
                        })
                    }
                }
            },
            ClientSocketMessage::UpdateShapes{ canvas_id, ref shapes } => {
                let mut whiteboard = program_state.whiteboard.lock().await;
                println!("Creating shape on canvas {} ...", canvas_id);

                match whiteboard.canvases.get_mut(canvas_id as usize) {
                    None => {
                        // TODO: send an error handling message
                        todo!()
                    },
                    Some(canvas) => {
                        let mut new_shapes = shapes.clone();

                        for (obj_id, shape) in shapes.iter() {
                            if ! canvas.shapes.contains_key(obj_id) {
                                new_shapes.remove(obj_id);
                            } else {
                                canvas.shapes.insert(*obj_id, shape.clone());
                            }
                        }// end for (&obj_id, &shape) in shapes.iter_mut()

                        Some(ServerSocketMessage::UpdateShapes{
                            client_id: current_client_id,
                            canvas_id: canvas_id,
                            shapes: new_shapes
                        })
                    }
                }
            },
            ClientSocketMessage::CreateCanvas { width, height } => {
                let mut whiteboard = program_state.whiteboard.lock().await;
                let new_canvas_id = whiteboard.canvases.len() as CanvasIdType;
                let mut allowed = HashSet::new();

                // Initialize new canvas with only current user allowed to edit
                allowed.insert(current_client_id);

                let allowed_users_vec = allowed.iter().copied().collect::<Vec<_>>();
                
                whiteboard.canvases.push(Canvas{
                    id: new_canvas_id,
                    width: width,
                    height: height,
                    shapes: HashMap::<CanvasObjectIdType, ShapeModel>::new(),
                    next_shape_id: 0,
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
