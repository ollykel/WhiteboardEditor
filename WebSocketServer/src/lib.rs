// -- standard library imports

use std::{
    sync::Arc,
    collections::{
        HashSet,
        HashMap,
    },
};

// -- third party imports

use futures::{
    lock::Mutex,
    TryStreamExt,
};

use tokio::sync::broadcast;
use serde::{Deserialize, Serialize};

use mongodb::{
    options::{
        ClientOptions,
        ServerApi,
        ServerApiVersion,
    },
    bson::{
        self,
        doc,
        oid::ObjectId,
    },
    Client,
    Database,
};

use chrono::{
    self,
    Utc,
};

// -- from unit_tests.rs
#[cfg(test)]
mod unit_tests;

pub type ClientIdType = i32;
pub type CanvasIdType = ObjectId;
pub type CanvasObjectIdType = ObjectId;
pub type WhiteboardIdType = ObjectId;
pub type UserIdType = ObjectId;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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
        x: f64,
        y: f64,
        radius_x: f64,
        radius_y: f64,
        stroke_width: f64,
        stroke_color: String,
        fill_color: String
    },
    Vector {
        points: Vec<f64>,
        stroke_width: f64,
        stroke_color: String
    },
    Text {
        font_size: i32,
        color: String,
        x: f64,
        y: f64,
        width: f64,
        height: f64,
    }
}

#[derive(Debug, Clone)]
pub struct CanvasObject {
    pub id: CanvasObjectIdType,
    pub shape: ShapeModel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct CanvasObjectMongoDBView {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub canvas_id: ObjectId,
    #[serde(flatten)]
    pub shape: ShapeModel,
}

impl CanvasObjectMongoDBView {
    pub fn to_canvas_object(&self) -> CanvasObject {
        CanvasObject {
            id: self.id.clone(),
            shape: self.shape.clone()
        }
    }
    
    pub fn from_canvas_object(obj: &CanvasObject, canvas_id: &CanvasIdType) -> Self {
        Self {
            id: obj.id,
            canvas_id: canvas_id.clone(),
            shape: obj.shape.clone(),
        }
    }
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
    pub id: String,
    pub width: i32,
    pub height: i32,
    pub name: String,
    pub time_created: String,           // rfc3339-encoded datetime
    pub time_last_modified: String,     // rfc3339-encoded datetime
    pub shapes: HashMap<String, ShapeModel>,
    pub allowed_users: Vec<String>,     // cast ObjectId to string for proper client-side parsing
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WhiteboardClientView {
    pub id: String,
    pub name: String,
    pub canvases: Vec<CanvasClientView>,
}

// === WhiteboardDiff =============================================================================
//
// Defines an atomic change to be made to the state of the Whiteboard. Used to indicate changes
// that should be written to the database.
//
// Largely overlaps with the ServerSocketMessage and ClientSocketMessage enums defined below.
//
// TODO: refactor ServerSocketMessage and ClientSocketMessage to incorporate WhiteboardDiff,
// instead of duplicating the given fields.
//
// ================================================================================================
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields="camelCase")]
pub enum WhiteboardDiff {
    CreateCanvas { name: String, width: i32, height: i32 },
    DeleteCanvases { canvas_ids: Vec<CanvasIdType> },
    CreateShapes { canvas_id: CanvasIdType, shapes: HashMap<CanvasObjectIdType, ShapeModel> },
    UpdateShapes { canvas_id: CanvasIdType, shapes: HashMap<CanvasObjectIdType, ShapeModel> },
    UpdateCanvasAllowedUsers { canvas_id: CanvasIdType, allowed_users: Vec<ObjectId> },
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum ServerSocketMessage {
    InitClient { client_id: ClientIdType, whiteboard: WhiteboardClientView },
    ActiveUsers { users: Vec<UserSummary>},
    // TODO: replace HashMaps with Vectors, so object ids don't need to be cast to strings
    CreateShapes { client_id: ClientIdType, canvas_id: String, shapes: HashMap<String, ShapeModel> },
    UpdateShapes { client_id: ClientIdType, canvas_id: String, shapes: HashMap<String, ShapeModel> },
    // TODO: replace with flattened CanvasClientView
    CreateCanvas {
        client_id: ClientIdType,
        canvas: CanvasClientView,
    },
    DeleteCanvases { client_id: ClientIdType, canvas_ids: Vec<String> },
    IndividualError { client_id: ClientIdType, message: String },
    BroadcastError { message: String },
    UpdateCanvasAllowedUsers { client_id: ClientIdType, canvas_id: String, allowed_users: Vec<String>},
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum ClientSocketMessage {
    CreateShapes { canvas_id: CanvasIdType, shapes: Vec<ShapeModel> },
    UpdateShapes { canvas_id: CanvasIdType, shapes: HashMap<String, ShapeModel> },
    CreateCanvas { width: i32, height: i32, name: String, allowed_users: HashSet::<ObjectId> },
    DeleteCanvases { canvas_ids: Vec<CanvasIdType> },
    Login { user_id: String, username: String },
    UpdateCanvasAllowedUsers { canvas_id: CanvasIdType, allowed_users: HashSet<ObjectId>}
}

#[derive(Clone, Debug)]
pub struct Canvas {
    pub id: CanvasIdType,
    pub next_shape_id_base: u64,
    pub width: i32,
    pub height: i32,
    pub name: String,
    pub time_created: chrono::DateTime<Utc>,
    pub time_last_modified: chrono::DateTime<Utc>,
    pub shapes: HashMap<CanvasObjectIdType, ShapeModel>,
    pub allowed_users: Option<HashSet<ObjectId>>, // None = open to all
}

impl Canvas {
    pub fn to_client_view(&self) -> CanvasClientView {
        // At the moment, the client view is identical to the Canvas type itself, but this may not
        // always be the case.
        CanvasClientView {
            id: self.id.to_string(),
            width: self.width,
            height: self.height,
            name: self.name.clone(),
            // shapes: self.shapes.clone(),
            shapes: self.shapes.iter()
                .map(|(obj_id, shape)| (obj_id.to_string(), shape.clone()))
                .collect(),
            time_created: self.time_created.to_rfc3339(),
            time_last_modified: self.time_last_modified.to_rfc3339(),
            allowed_users: match &self.allowed_users {
                Some(set) => set.iter()
                    .map(|oid| oid.to_string())
                    .collect(),
                None => vec![], // empty array means open to all
            },
        }
    }// end pub fn to_client_view(&self) -> CanvasClientView
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "permission", rename_all = "camelCase")]
pub enum WhiteboardPermissionEnum {
    View,
    Edit,
    Own,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase", rename_all_fields = "snake_case")]
pub enum WhiteboardPermissionType {
    User { user: ObjectId },
    Email { email: String },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct WhiteboardPermission {
    #[serde(flatten)]
    permission_type: WhiteboardPermissionType,
    #[serde(flatten)]
    permission: WhiteboardPermissionEnum,
}

pub type WhiteboardPermissionMongoDBView = WhiteboardPermission;

#[derive(Clone, Debug)]
pub struct Whiteboard {
    pub id: WhiteboardIdType,
    pub name: String,
    pub canvases: HashMap<CanvasIdType, Canvas>,
    pub owner_id: UserIdType,
    pub shared_users: Vec<WhiteboardPermission>,
}

impl Whiteboard {
    pub fn to_client_view(&self) -> WhiteboardClientView {
        // At the moment, the client view is identical to the Canvas type itself, but this may not
        // always be the case.
        WhiteboardClientView {
            id: self.id.to_string(),
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
    pub whiteboard_id: WhiteboardIdType,
    pub broadcaster: broadcast::Sender<ServerSocketMessage>,
    pub active_clients: Arc<Mutex<HashMap<ClientIdType, UserSummary>>>,
    pub diffs: Arc<Mutex<Vec<WhiteboardDiff>>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CanvasMongoDBView {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub whiteboard_id: ObjectId,
    pub width: i32,
    pub height: i32,
    pub name: String,
    pub time_created: bson::DateTime,
    pub time_last_modified: bson::DateTime,
    pub allowed_users: Option<Vec<ObjectId>>
}

impl CanvasMongoDBView {
    pub fn to_canvas(&self, canvas_objects: &[CanvasObject]) -> Canvas {
        let shapes : HashMap<CanvasObjectIdType, ShapeModel> = canvas_objects.iter()
            .map(|obj| (obj.id, obj.shape.clone()))
            .collect();

        Canvas {
            id: self.id.clone(),
            next_shape_id_base: 0,
            width: self.width,
            height: self.height,
            name: self.name.clone(),
            time_created: dt_bson_to_chrono_utc(&self.time_created),
            time_last_modified: dt_bson_to_chrono_utc(&self.time_last_modified),
            shapes: shapes,
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
    #[serde(rename = "owner")]
    pub owner_id: ObjectId,
    #[serde(rename = "shared_users")]
    pub shared_users: Vec<WhiteboardPermissionMongoDBView>,
}

impl WhiteboardMongoDBView {
    pub fn to_whiteboard(&self, canvases: &[Canvas]) -> Whiteboard {
        Whiteboard {
            id: self.id.clone(),
            name: self.name.clone(),
            canvases: canvases.iter()
                .map(|canvas| (canvas.id.clone(), canvas.clone()))
                .collect(),
            owner_id: self.owner_id.clone(),
            shared_users: self.shared_users.clone(),
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
    pub diffs: Arc<Mutex<Vec<WhiteboardDiff>>>,
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

// === misc. utils ================================================================================
//
// ================================================================================================

pub fn dt_bson_to_chrono_utc(dt: &bson::DateTime) -> chrono::DateTime::<Utc> {
    match chrono::DateTime::<Utc>::from_timestamp_millis(dt.timestamp_millis()) {
        Some(dt) => dt,
        None => {
            panic!("Could not parse bson datetime {} into chrono datetime", dt);
        }
    }
}

pub fn dt_chrono_utc_to_bson(dt: &chrono::DateTime<Utc>) -> bson::DateTime {
    bson::DateTime::from_millis(dt.timestamp_millis())
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
                                let obj_id = ObjectId::new();

                                new_shapes.insert(obj_id.clone(), shape.clone());
                                canvas.shapes.insert(obj_id.clone(), shape.clone());
                            }// end for (idx, &mut shape) in new_shapes.iter_mut().enumerate()

                            // valid input: add to diffs
                            {
                                let mut diffs = client_state.diffs.lock().await;
                            
                                diffs.push(WhiteboardDiff::CreateShapes{
                                    canvas_id: canvas_id,
                                    shapes: new_shapes.clone()
                                });
                            }

                            Some(ServerSocketMessage::CreateShapes{
                                client_id: client_state.client_id,
                                canvas_id: canvas_id.to_string(),
                                shapes: new_shapes.iter()
                                    .map(|(obj_id, shape)| (obj_id.to_string(), shape.clone()))
                                    .collect()
                            })
                        }
                    }
                },
                ClientSocketMessage::UpdateShapes{ canvas_id, ref shapes } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;
                    println!("Updating shapes on canvas {} ...", canvas_id);

                    match whiteboard.canvases.get_mut(&canvas_id) {
                        None => {
                            // TODO: send an error handling message
                            todo!()
                        },
                        Some(canvas) => {
                            let new_shapes = HashMap::<CanvasObjectIdType, ShapeModel>::new();

                            for (obj_id_s, shape) in shapes.iter() {
                                match obj_id_s.parse::<CanvasObjectIdType>() {
                                    Ok(obj_id) => {
                                        if canvas.shapes.contains_key(&obj_id) {
                                            canvas.shapes.insert(obj_id, shape.clone());
                                        }
                                    },
                                    Err(e) => {
                                        println!("Could not parse \"{}\" into object id: {}", obj_id_s, e);
                                    }
                                };
                            }// end for (&obj_id, &shape) in shapes.iter_mut()

                            // valid input: add to diffs
                            {
                                let mut diffs = client_state.diffs.lock().await;
                            
                                diffs.push(WhiteboardDiff::UpdateShapes{
                                    canvas_id: canvas_id,
                                    shapes: new_shapes.clone()
                                });
                            }

                            Some(ServerSocketMessage::UpdateShapes{
                                client_id: client_state.client_id,
                                canvas_id: canvas_id.to_string(),
                                shapes: new_shapes.iter()
                                    .map(|(obj_id, shape)| (obj_id.to_string(), shape.clone()))
                                    .collect()
                            })
                        }
                    }
                },
                ClientSocketMessage::CreateCanvas { width, height, name, allowed_users } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;
                    let new_canvas_id = ObjectId::new();

                    // -- allowed_users passed in as parameter from AllowedUsersPopover
                    // let mut allowed = HashSet::<ObjectId>::new();

                    // Initialize new canvas with only current user allowed to edit
                    // TODO: actually fetch user's id from database
                    // allowed_users.insert(ObjectId::new());

                    // valid input: add to diffs
                    {
                        let mut diffs = client_state.diffs.lock().await;
                    
                        diffs.push(WhiteboardDiff::CreateCanvas{
                            name: name.clone(),
                            width: width,
                            height: height,
                        });
                    }

                    // instantiate new canvas
                    let canvas = Canvas {
                        id: new_canvas_id,
                        next_shape_id_base: 0,
                        width: width,
                        height: height,
                        name: name.clone(),
                        time_created: Utc::now(),
                        time_last_modified: Utc::now(),
                        shapes: HashMap::<CanvasObjectIdType, ShapeModel>::new(),
                        allowed_users: Some(allowed_users),
                    };
                    
                    whiteboard.canvases.insert(
                        new_canvas_id,
                        canvas.clone()
                    );

                    Some(ServerSocketMessage::CreateCanvas{
                        client_id: client_state.client_id,
                        canvas: canvas.to_client_view(),
                    })
                },
                ClientSocketMessage::DeleteCanvases { canvas_ids } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;

                    // delete canvases identified by the given ids
                    for id in &canvas_ids {
                        whiteboard.canvases.remove(&id);
                    }// end for id in canvas_ids

                    // valid message: add to diffs
                    {
                        let mut diffs = client_state.diffs.lock().await;
                    
                        diffs.push(WhiteboardDiff::DeleteCanvases {
                            canvas_ids: canvas_ids.clone()
                        });
                    }

                    Some(ServerSocketMessage::DeleteCanvases{
                        client_id: client_state.client_id,
                        canvas_ids: canvas_ids.iter()
                            .map(|id| id.to_string())
                            .collect()
                    })
                },
                ClientSocketMessage::UpdateCanvasAllowedUsers { canvas_id, allowed_users } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;

                    match whiteboard.canvases.get_mut(&canvas_id) {
                        None => {
                            // canvas doesn't exist
                            return Some(ServerSocketMessage::IndividualError {
                                client_id: client_state.client_id,
                                message: format!("Canvas {} not found", canvas_id),
                            });
                        },
                        Some(canvas) => {
                            // update allowed users
                            canvas.allowed_users = Some(allowed_users.clone());

                            // record a diff so changes get written back to database
                            {
                                let mut diffs = client_state.diffs.lock().await;

                                diffs.push(WhiteboardDiff::UpdateCanvasAllowedUsers{
                                    canvas_id: canvas_id, 
                                    allowed_users: allowed_users.iter()
                                        .map(|oid| *oid)
                                        .collect(), 
                                });
                            }

                            // broadcast to all users
                            Some(ServerSocketMessage::UpdateCanvasAllowedUsers { 
                                client_id: client_state.client_id, 
                                canvas_id: canvas_id.to_string(), 
                                allowed_users: allowed_users.iter()
                                    .map(|oid| oid.to_string())
                                    .collect(), 
                            })
                        }
                    }
                }
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

pub async fn get_whiteboard_by_id(db: &Database, wid: &WhiteboardIdType) -> Result<Option<Whiteboard>, mongodb::error::Error> {
    let whiteboard_coll = db.collection::<WhiteboardMongoDBView>("whiteboards");
    let canvas_coll = db.collection::<CanvasMongoDBView>("canvases");
    let shape_coll = db.collection::<CanvasObjectMongoDBView>("shapes");

    let whiteboard_view = match whiteboard_coll.find_one(doc! { "_id": wid.clone() }).await? {
        None => { return Ok(None); },
        Some(wb) => wb
    };

    let canvas_cursor = canvas_coll.find(doc! { "whiteboard_id": wid.clone() }).await?;
    let canvas_views : Vec<CanvasMongoDBView> = canvas_cursor.try_collect().await?;
    let mut canvases = Vec::<Canvas>::new();

    for canvas_view in canvas_views.iter() {
        let object_views_cursor = shape_coll.find(doc! { "canvas_id": canvas_view.id }).await?;
        let object_views : Vec<CanvasObjectMongoDBView> = object_views_cursor.try_collect().await?;
        let canvas_objects : Vec<CanvasObject> = object_views.iter()
            .map(|obj_view| obj_view.to_canvas_object())
            .collect();

        canvases.push(canvas_view.to_canvas(canvas_objects.as_slice()));
    }// end for canvas_view in canvas_views.iter()

    Ok(Some(whiteboard_view.to_whiteboard(canvases.as_slice())))
}// -- end fn get_whiteboard_by_id

