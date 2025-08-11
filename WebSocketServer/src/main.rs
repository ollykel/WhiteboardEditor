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
    width: usize,
    height: usize,
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

fn main() {
    println!("Hello, world!");
}
