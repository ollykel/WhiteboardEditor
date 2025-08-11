use serde::{Deserialize, Serialize};

type ClientIdType = i32;
type CanvasIdType = i32;
type WhiteboardIdType = i32;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum ShapeModel {
    Rect { x: u64, y: u64, width: u64, height: u64 },
    Ellipse { x: u64, y: u64, radiusX: u64, radiusY: u64 },
    Vector { points: Vec<u64> },
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
    CreateCanvas { client_id: ClientIdType, width: u64, height: u64 },
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

fn main() {
    println!("Hello, world!");
}
