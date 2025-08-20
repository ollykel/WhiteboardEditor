// -- standard library imports

use std::{
    collections::HashSet,
};

use futures::{
    lock::Mutex,
};

// -- third party imports

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
pub struct CanvasClientView {
    pub id: CanvasIdType,
    pub width: u64,
    pub height: u64,
    pub shapes: Vec<ShapeModel>,
    pub allowedUsers: Vec<ClientIdType>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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
    CreateCanvas { client_id: ClientIdType, canvas_id: CanvasIdType, width: u64, height: u64, allowedUsers: Vec<ClientIdType> },
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
pub enum ClientSocketMessage {
    CreateShapes { canvas_id: CanvasIdType, shapes: Vec<ShapeModel> },
    CreateCanvas { width: u64, height: u64 }
}

#[derive(Clone)]
pub struct Canvas {
    pub id: CanvasIdType,
    pub width: u64,
    pub height: u64,
    pub shapes: Vec<ShapeModel>,
    pub allowedUsers: Option<HashSet<ClientIdType>>, // None = open to all
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
            allowedUsers: match &self.allowedUsers {
                Some(set) => set.iter().copied().collect(),
                None => vec![], // empty array means open to all
            },
        }
    }// end pub fn to_client_view(&self) -> CanvasClientView
}

#[derive(Clone)]
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
    pub tx: broadcast::Sender<ServerSocketMessage>,
    pub next_client_id: Mutex<ClientIdType>,
    pub whiteboard: Mutex<Whiteboard>,
    pub active_clients: Mutex<HashSet<ClientIdType>>
}

