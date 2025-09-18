// -- standard library imports

use std::{
    sync::Arc,
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

use mongodb::{
    bson::{
        doc,
        oid::ObjectId
    },
    options::{
        ClientOptions,
        ServerApi,
        ServerApiVersion
    },
    Client
};

pub type ClientIdType = i32;
pub type CanvasIdType = i32;
pub type CanvasObjectIdType = i32;
pub type WhiteboardIdType = String;

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

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserSummary {
    pub user_id: String,
    pub username: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanvasClientView {
    pub id: CanvasIdType,
    pub width: u64,
    pub height: u64,
    pub name: String,
    pub shapes: HashMap<CanvasObjectIdType, ShapeModel>,
    pub allowed_users: Vec<ObjectId>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WhiteboardClientView {
    pub id: WhiteboardIdType,
    pub name: String,
    pub canvases: Vec<CanvasClientView>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum ServerSocketMessage {
    InitClient { client_id: ClientIdType, whiteboard: WhiteboardClientView },
    ActiveUsers { users: Vec<UserSummary>},
    CreateShapes { client_id: ClientIdType, canvas_id: CanvasIdType, shapes: HashMap<CanvasObjectIdType, ShapeModel> },
    UpdateShapes { client_id: ClientIdType, canvas_id: CanvasIdType, shapes: HashMap<String, ShapeModel> },
    CreateCanvas { client_id: ClientIdType, canvas_id: CanvasIdType, width: u64, height: u64, name: String, allowed_users: Vec<ObjectId> },
    DeleteCanvases { client_id: ClientIdType, canvas_ids: Vec<CanvasIdType> },
    IndividualError { client_id: ClientIdType, message: String },
    BroadcastError { message: String },
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum ClientSocketMessage {
    CreateShapes { canvas_id: CanvasIdType, shapes: Vec<ShapeModel> },
    UpdateShapes { canvas_id: CanvasIdType, shapes: HashMap<String, ShapeModel> },
    CreateCanvas { width: u64, height: u64, name: String },
    DeleteCanvases { canvas_ids: Vec<CanvasIdType> },
    Login { user_id: String, username: String },
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Canvas {
    pub id: CanvasIdType,
    pub width: u64,
    pub height: u64,
    pub name: String,
    pub shapes: HashMap<CanvasObjectIdType, ShapeModel>,
    pub next_shape_id: CanvasObjectIdType,
    pub allowed_users: Option<HashSet<ObjectId>>, // None = open to all
}

impl Canvas {
    pub fn to_client_view(&self) -> CanvasClientView {
        // At the moment, the client view is identical to the Canvas type itself, but this may not
        // always be the case.
        CanvasClientView {
            id: self.id,
            width: self.width,
            height: self.height,
            name: self.name.clone(),
            shapes: self.shapes.clone(),
            allowed_users: match &self.allowed_users {
                Some(set) => set.iter().copied().collect(),
                None => vec![], // empty array means open to all
            },
        }
    }// end pub fn to_client_view(&self) -> CanvasClientView
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Whiteboard {
    pub id: WhiteboardIdType,
    pub name: String,
    pub canvases: HashMap<CanvasIdType, Canvas>,
    pub owner_id: String,
    pub shared_user_ids: Vec<String>,
}

impl Whiteboard {
    pub fn to_client_view(&self) -> WhiteboardClientView {
        // At the moment, the client view is identical to the Canvas type itself, but this may not
        // always be the case.
        WhiteboardClientView {
            id: self.id.clone(),
            name: self.name.clone(),
            canvases: self.canvases.iter()
                .map(|(_, c)| c.to_client_view())
                .collect()
        }
    }// end pub fn to_client_view(&self) -> CanvasClientView
}

// === SharedWhiteboardEntry ======================================================================
//
// Contains a Whiteboard's data plus necessary objects for managing user connections to the
// whiteboard, including the Sender.
//
// ================================================================================================
#[derive(Clone)]
pub struct SharedWhiteboardEntry {
    pub whiteboard_ref: Arc<Mutex<Whiteboard>>,
    pub broadcaster: broadcast::Sender<ServerSocketMessage>,
    pub active_clients: Arc<Mutex<HashMap<ClientIdType, UserSummary>>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CanvasMongoDBView {
    pub width: u64,
    pub height: u64,
    pub name: String,
    pub shapes: HashMap<String, ShapeModel>,
    pub allowed_users: Option<Vec<ObjectId>>
}

impl CanvasMongoDBView {
    pub fn to_canvas(&self, id: CanvasIdType) -> Canvas {
        let mut next_shape_id : CanvasObjectIdType = CanvasObjectIdType::MIN;
        let shapes : HashMap<CanvasObjectIdType, ShapeModel> = self.shapes.iter()
            .map(|(key, shape)| {
                match key.parse::<CanvasObjectIdType>() {
                    Err(_) => None,
                    Ok(key) => {
                        next_shape_id = CanvasObjectIdType::max(next_shape_id, key);

                        Some((key, shape.clone()))
                    }
                }
            })
            .filter(|val| val.is_some())
            .map(|val| val.unwrap())
            .collect();

        Canvas {
            id: id,
            width: self.width,
            height: self.height,
            name: self.name.clone(),
            shapes: shapes,
            next_shape_id: next_shape_id,
            allowed_users: match &self.allowed_users {
                None => None,
                Some(users) => Some(users.iter().map(|uid| uid.clone()).collect())
            }
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum UserPermissionEnum {
    Own,
    Edit,
    View,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum UserPermission {
    #[serde(rename = "id")]
    Id {
        user_id: ObjectId,
        permission: UserPermissionEnum,
    },
    #[serde(rename = "email")]
    Email {
        email: String,
        permission: UserPermissionEnum,
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WhiteboardMongoDBView {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub canvases: Vec<CanvasMongoDBView>,
    #[serde(rename = "owner")]
    pub owner_id: ObjectId,
    #[serde(rename = "shared_users")]
    pub shared_user_ids: Vec<UserPermission>
}

impl WhiteboardMongoDBView {
    pub fn to_whiteboard(&self) -> Whiteboard {
        Whiteboard {
            id: self.id.to_string(),
            name: self.name.clone(),
            canvases: self.canvases.iter()
                .enumerate()
                .map(|(idx, db_view)| {
                    let canvas_id: CanvasIdType = idx.try_into().unwrap();
                    (canvas_id, db_view.to_canvas(canvas_id))
                })
                .collect(),
            owner_id: self.owner_id.to_string(),
            shared_user_ids: self.shared_user_ids.iter().map(|perm| match perm {
                UserPermission::Id { user_id, .. } => user_id.to_string(),
                UserPermission::Email { email, .. } => email.clone(),
            }).collect(),
        }
    }
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
    pub whiteboards: Mutex<HashMap<WhiteboardIdType, SharedWhiteboardEntry>>,
}

// === ClientState ================================================================================
//
// Encapsulate all state a thread needs to handle a single client.
//
// ================================================================================================
pub struct ClientState {
    pub client_id: ClientIdType,
    pub whiteboard_ref: Arc<Mutex<Whiteboard>>,
    pub active_clients: Arc<Mutex<HashMap<ClientIdType, UserSummary>>>,
}

// === Connection State ===========================================================================
//
// Holds program state plus data necessary for broadcasting to clients and managing connections.
//
// ================================================================================================
pub struct ConnectionState {
    pub mongo_client: Client,
    pub next_client_id: Mutex<ClientIdType>,
    pub program_state: ProgramState,
}

// Handle raw messages from clients.
// Input parameter is a string to enable testing on all possible inputs.
// @param program_state         -- Current program state
// @param current_client_id     -- ID of sending client
// @param client_msg_s          -- Content of client message
// @return                      -- (Optional) Message to send to clients, if any
pub async fn handle_client_message(client_state: &ClientState, client_msg_s: &str) -> Option<ServerSocketMessage> {
    match serde_json::from_str::<ClientSocketMessage>(client_msg_s) {
        Ok(client_msg) => {
            println!("Received message from client {}", client_state.client_id);
            
            match client_msg {
                ClientSocketMessage::Login { user_id, username } => {
                    let mut clients = client_state.active_clients.lock().await;
                    clients.insert(
                        client_state.client_id,
                        UserSummary {
                            user_id: user_id.clone(),
                            username: username.clone(),
                        },
                    );

                    // Deduplicate by user_id
                    let mut seen = HashSet::new();
                    let users: Vec<UserSummary> = clients
                        .values()
                        .filter(|u| seen.insert(u.user_id.clone())) // only first occurences
                        .cloned() // turn &UserSummary into UserSummary
                        .collect();

                    Some(ServerSocketMessage::ActiveUsers { users })
                },
                ClientSocketMessage::CreateShapes{ canvas_id, ref shapes } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;
                    println!("Creating shape on canvas {} ...", canvas_id);

                    match whiteboard.canvases.get_mut(&canvas_id) {
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
                                client_id: client_state.client_id,
                                canvas_id: canvas_id,
                                shapes: new_shapes
                            })
                        }
                    }
                },
                ClientSocketMessage::UpdateShapes{ canvas_id, ref shapes } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;
                    println!("Creating shape on canvas {} ...", canvas_id);

                    match whiteboard.canvases.get_mut(&canvas_id) {
                        None => {
                            // TODO: send an error handling message
                            todo!()
                        },
                        Some(canvas) => {
                            let mut new_shapes = shapes.clone();

                            for (obj_id_s, shape) in shapes.iter() {
                                match obj_id_s.parse::<CanvasObjectIdType>() {
                                    Ok(obj_id) => {
                                        if ! canvas.shapes.contains_key(&obj_id) {
                                            new_shapes.remove(obj_id_s);
                                        } else {
                                            canvas.shapes.insert(obj_id, shape.clone());
                                        }
                                    },
                                    Err(e) => {
                                        println!("Could not parse \"{}\" into object id: {}", obj_id_s, e);
                                    }
                                };
                            }// end for (&obj_id, &shape) in shapes.iter_mut()

                            Some(ServerSocketMessage::UpdateShapes{
                                client_id: client_state.client_id,
                                canvas_id: canvas_id,
                                shapes: new_shapes
                            })
                        }
                    }
                },
                ClientSocketMessage::CreateCanvas { width, height, name } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;
                    let new_canvas_id = whiteboard.canvases.len() as CanvasIdType;
                    let mut allowed = HashSet::<ObjectId>::new();

                    // Initialize new canvas with only current user allowed to edit
                    // TODO: actually fetch user's id from database
                    allowed.insert(ObjectId::new());

                    let allowed_users_vec = allowed.iter().copied().collect::<Vec<_>>();
                    
                    whiteboard.canvases.insert(
                        new_canvas_id,
                        Canvas{
                            id: new_canvas_id,
                            width: width,
                            height: height,
                            name: name.clone(),
                            shapes: HashMap::<CanvasObjectIdType, ShapeModel>::new(),
                            next_shape_id: 0,
                            allowed_users: Some(allowed),
                        }
                    );

                    Some(ServerSocketMessage::CreateCanvas{
                        client_id: client_state.client_id,
                        canvas_id: new_canvas_id,
                        width: width,
                        height: height,
                        name: name.clone(),
                        allowed_users: allowed_users_vec,
                    })
                },
                ClientSocketMessage::DeleteCanvases { canvas_ids } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;

                    // delete canvases identified by the given ids
                    for id in &canvas_ids {
                        whiteboard.canvases.remove(&id);
                    }// end for id in canvas_ids

                    Some(ServerSocketMessage::DeleteCanvases{
                        client_id: client_state.client_id,
                        canvas_ids: canvas_ids
                    })
                },
            }
        },
        Err(e) => {
            println!("ERROR: invalid client message: {}", client_msg_s);
            println!("Reason: {}", e);

            Some(ServerSocketMessage::IndividualError{
                client_id: client_state.client_id,
                message: String::from("invalid client message")
            })
        }
    }
}// end handle_client_message

pub async fn connect_mongodb(uri: &str) -> mongodb::error::Result<Client> {
    // Replace the placeholder with your Atlas connection string
    let mut client_options = ClientOptions::parse(uri).await?;

    // Set the server_api field of the client_options object to Stable API version 1
    let server_api = ServerApi::builder().version(ServerApiVersion::V1).build();
    client_options.server_api = Some(server_api);

    // Create a new client and connect to the server
    let client = Client::with_options(client_options)?;

    // Send a ping to confirm a successful connection
    client.database("admin").run_command(doc! { "ping": 1 }).await?;
    println!("Pinged your deployment. You successfully connected to MongoDB!");

    Ok(client)
}// end connect_mongodb

// -- Begin tests
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn handle_invalid_client_message() {
        // not even valid json
        let test_client_id = 0;
        let client_msg_s = "This is not valid json";
        let client_state = ClientState {
            client_id: test_client_id,
            whiteboard_ref: Arc::new(Mutex::new(Whiteboard {
                id: String::from("abcd"),
                name: String::from("Test"),
                canvases: HashMap::new(),
                owner_id: String::from("aaaa"),
                shared_user_ids: vec![],
            })),
            active_clients: Arc::new(Mutex::new(HashMap::new())),
        };

        let resp = handle_client_message(&client_state, client_msg_s).await;

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
