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
    Collection,
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

#[derive(Debug, Clone)]
pub struct User {
    pub id: UserIdType,
    pub username: String,
    pub email: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserClientView {
    pub id: String,
    pub username: String,
    pub email: String,
}

impl UserClientView {
    pub fn from_user(user: &User) -> Self {
        Self {
            id: user.id.to_string(),
            username: user.username.clone(),
            email: user.email.clone(),
        }
    }// end from_user

    pub fn to_user(&self) -> Result<User, mongodb::bson::oid::Error> {
        Ok(User {
            id: ObjectId::parse_str(&self.id)?,
            username: self.username.clone(),
            email: self.email.clone(),
        })
    }// end to_user
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct UserMongoDBView {
    #[serde(rename = "_id")]
    id: ObjectId,
    username: String,
    email: String,
}

impl UserMongoDBView {
    pub fn from_user(user: &User) -> Self {
        Self {
            id: user.id.clone(),
            username: user.username.clone(),
            email: user.email.clone(),
        }
    }// end from_user

    pub fn to_user(&self) -> User {
        User {
            id: self.id.clone(),
            username: self.username.clone(),
            email: self.email.clone(),
        }
    }// end to_user
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

// === ClientError ================================================================================
//
// Enumerates types of errors the server can send to the client. Sent within both the
// IndividualError and BroadcastError messages.
//
// ================================================================================================
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum ClientError {
    // -- previous message from client was invalid in some form (invalid json, non-existent message
    // type, invalid message format, etc.)
    InvalidMessage {
        client_message_raw: String,
    },
    // -- client did not send an auth token
    NotAuthenticated,
    // -- client not authorized to view this whiteboard at all
    Unauthorized,
    // -- client already authorized (cannot re-authenticate within the same connection)
    AlreadyAuthorized,
    // -- client's auth token is somehow malformed
    InvalidAuth,
    // -- client's auth token has expired
    AuthTokenExpired,
    // -- Client attempted to sign in as or access user that doesn't exist
    UserNotFound {
        user_id: String,
    },
    // -- Client attempted to access whiteboard that doesn't exist
    WhiteboardNotFound {
        whiteboard_id: String,
    },
    // -- Client attempted to access canvas that doesn't exist
    CanvasNotFound {
        canvas_id: String,
    },
    // -- client doesn't have permission to perform a given action
    ActionForbidden {
        // -- description of the forbidden action that was attempted
        action: String,
    },
    // -- misc. errors not neatly handled by the above common cases
    Other {
        // -- descriptive message to send to client
        // -- make sure it excludes sensitive information
        message: String,
    },
}// -- end ClientError

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum ServerSocketMessage {
    InitClient {
        client_id: ClientIdType,
        whiteboard: WhiteboardClientView,
    },
    ActiveUsers {
        users: Vec<UserSummary>,
    },
    // TODO: replace HashMaps with Vectors, so object ids don't need to be cast to strings
    CreateShapes {
        client_id: ClientIdType,
        canvas_id: String,
        shapes: HashMap<String,
        ShapeModel>,
    },
    UpdateShapes {
        client_id: ClientIdType,
        canvas_id: String,
        shapes: HashMap<String,
        ShapeModel>,
    },
    // TODO: replace with flattened CanvasClientView
    CreateCanvas {
        client_id: ClientIdType,
        canvas: CanvasClientView,
    },
    DeleteCanvases {
        client_id: ClientIdType,
        canvas_ids: Vec<String>,
    },
    UpdateCanvasAllowedUsers {
        client_id: ClientIdType,
        canvas_id: String,
        allowed_users: Vec<String>,
    },
    IndividualError {
        client_id: ClientIdType,
        error: ClientError,
    },
    BroadcastError {
        error: ClientError,
    },
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum ClientSocketMessage {
    CreateShapes {
        canvas_id: CanvasIdType,
        shapes: Vec<ShapeModel>,
    },
    UpdateShapes {
        canvas_id: CanvasIdType,
        shapes: HashMap<String,
        ShapeModel>,
    },
    CreateCanvas {
        width: i32,
        height: i32,
        name: String,
        allowed_users: HashSet::<ObjectId>,
    },
    DeleteCanvases {
        canvas_ids: Vec<CanvasIdType>,
    },
    Login {
        jwt: String,
    },
    UpdateCanvasAllowedUsers {
        canvas_id: CanvasIdType,
        allowed_users: HashSet<ObjectId>,
    },
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

#[derive(Copy, Clone, Debug, Serialize, Deserialize)]
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
    // For permissions attached to an existing account, index by user id, to enable faster
    // retrieval when users log in.
    pub permissions_by_user_id: HashMap<String, WhiteboardPermissionEnum>,
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
            permissions_by_user_id: self.shared_users.iter()
                .map(|wb_perm| match wb_perm.permission_type {
                    WhiteboardPermissionType::User { ref user} => Some((user.to_string(), wb_perm.permission)),
                    _ => None
                })
                .filter(|x| x.is_some())
                .map(|x| x.unwrap())
                .collect(),
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
    pub jwt_secret: String,
    // The permission (view/edit/own) the user has on the current whiteboard
    pub user_whiteboard_permission: Mutex<Option<WhiteboardPermissionEnum>>,
    pub active_clients: Arc<Mutex<HashMap<ClientIdType, UserSummary>>>,
    pub diffs: Arc<Mutex<Vec<WhiteboardDiff>>>,
}

// === Connection State ===========================================================================
//
// Holds program state plus data necessary for broadcasting to clients and managing connections.
//
// ================================================================================================
pub struct ConnectionState {
    pub jwt_secret: String,
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

// -- utilify struct for handle_authenticated_client_message, for inspectint raw client messages
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ClientMessageInspector {
    #[serde(rename = "type")]
    type_tag: String,
}// -- end ClientMessageInspector

// === UserStore ==================================================================================
//
// Trait that defines a way for fetching users by ID. Depending on this trait rather than directly
// on a database client allows the implementation of unit tests without using a database client.
//
// Read-only: does not implement setting, updating, or deleting users.
//
// ================================================================================================
pub trait UserStore {
    async fn get_user_by_id(&self, user_id: &UserIdType) -> Result<Option<User>, Box<dyn std::error::Error + Send + Sync>>;
}// -- end trait UserStore

// === MongoDBUserStore ===========================================================================
//
// Interface for fetching users from the MongoDB database, by user id.
//
// ================================================================================================
pub struct MongoDBUserStore {
    user_collection: Collection<UserMongoDBView>,
}// -- end MongoDBUserStore

impl MongoDBUserStore {
    pub fn new(coll: &Collection<UserMongoDBView>) -> Self {
        Self {
            user_collection: coll.clone(),
        }
    }// -- end fn new(coll: &Collection<UserMongoDBView>) -> Self
}// -- end impl MongoDBUserStore

impl UserStore for MongoDBUserStore {
    async fn get_user_by_id(&self, user_id: &UserIdType) -> Result<Option<User>, Box<dyn std::error::Error + Send + Sync>> {
        match self.user_collection.find_one(doc! { "_id": user_id.clone() }).await? {
            Some(user_view) => Ok(Some(user_view.to_user())),
            None => Ok(None),
        }// -- end match self.user_collection.find_one(doc! { "_id": user_id.clone() }).await
    }
}

// Handle raw messages from clients. Assume client has already authenticated.
// Input parameter is a string to enable testing on all possible inputs.
// @param client_state          -- Current client state
// @param client_msg_s          -- Content of client message
// @return                      -- (Optional) Message to send to clients, if any
pub async fn handle_authenticated_client_message(
    client_state: &ClientState,
    client_msg_s: &str
) -> Option<ServerSocketMessage> {
    use ClientSocketMessage::*;

    match serde_json::from_str::<ClientSocketMessage>(client_msg_s) {
        Ok(client_msg) => {
            println!("Received message from client {}", client_state.client_id);

            // All actions below require at least edit permission, since they all involve
            // mutating state in some way. Hence, we check permissions first, and send back an
            // error message if the user only has view permission.
            let user_whiteboard_permission = {
                let perm = client_state.user_whiteboard_permission.lock().await;

                perm.clone()
            };

            match user_whiteboard_permission {
                None | Some(WhiteboardPermissionEnum::View) => {
                    let inspector = serde_json::from_str::<ClientMessageInspector>(client_msg_s)
                        .expect("Expected to find \"type\" tag in client message.");

                    return Some(ServerSocketMessage::IndividualError {
                        client_id: client_state.client_id,
                        error: ClientError::ActionForbidden {
                            action: inspector.type_tag,
                        },
                    });
                },
                // Proceed to next step.
                // Don't just use _ here to accept all other permissions: if we add a new
                // permission type, we want to make sure we handle it uniquely, in case it involves
                // more unique logic.
                Some(WhiteboardPermissionEnum::Edit) | Some(WhiteboardPermissionEnum::Own) => {},
            };
            
            match client_msg {
                // -- User already authenticated; return error
                Login { .. } => Some(ServerSocketMessage::IndividualError {
                    client_id: client_state.client_id,
                    error: ClientError::AlreadyAuthorized,
                }),
                CreateShapes{ canvas_id, ref shapes } => {
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
                UpdateShapes{ canvas_id, ref shapes } => {
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
                CreateCanvas { width, height, name, allowed_users } => {
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
                DeleteCanvases { canvas_ids } => {
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
                UpdateCanvasAllowedUsers { canvas_id, allowed_users } => {
                    let mut whiteboard = client_state.whiteboard_ref.lock().await;

                    // -- ensure all allowed users are valid users who have edit or own permission
                    for user_id in allowed_users.iter() {
                        match whiteboard.permissions_by_user_id.get(&user_id.to_string()) {
                            None => {
                                return Some(ServerSocketMessage::IndividualError {
                                    client_id: client_state.client_id,
                                    error: ClientError::Other {
                                        message: format!("User {} not found", user_id),
                                    }
                                });
                            },
                            Some(perm) => match perm {
                                WhiteboardPermissionEnum::View => {
                                    return Some(ServerSocketMessage::IndividualError {
                                        client_id: client_state.client_id,
                                        error: ClientError::Other {
                                            message: format!("User {} does not have edit permission", user_id),
                                        }
                                    });
                                },
                                WhiteboardPermissionEnum::Edit | WhiteboardPermissionEnum::Own => {},
                            },
                        };
                    }// -- end for user_id in allowed_users.iter()

                    match whiteboard.canvases.get_mut(&canvas_id) {
                        None => {
                            // canvas doesn't exist
                            return Some(ServerSocketMessage::IndividualError {
                                client_id: client_state.client_id,
                                error: ClientError::CanvasNotFound {
                                    canvas_id: canvas_id.to_string(),
                                },
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
                error: ClientError::InvalidMessage {
                    client_message_raw: String::from(client_msg_s),
                },
            })
        }
    }
}// end handle_authenticated_client_message

// Handle raw messages from clients. Assume client has not been authenticated.
// Input parameter is a string to enable testing on all possible inputs.
// @param client_state          -- Current client state
// @param client_msg_s          -- Content of client message
// @return                      -- (Optional) Message to send to clients, if any
pub async fn handle_unauthenticated_client_message<UserStoreType: UserStore>(
    client_state: &ClientState,
    user_store: &UserStoreType,
    client_msg_s: &str
) -> Option<ServerSocketMessage> {
    match serde_json::from_str::<ClientSocketMessage>(client_msg_s) {
        Ok(client_msg) => {
            println!("Received message from client {}", client_state.client_id);
            
            match client_msg {
                // -- This is the only valid message an unathenticated client can send and expect a
                // non-error response from.
                ClientSocketMessage::Login { jwt } => {
                    // TODO: authenticate user using jwt, fetching their permission from the
                    // database if successful
                    let user_id = match get_user_id_from_jwt(jwt.as_str(), client_state.jwt_secret.as_str()) {
                        Err(e) => {
                            println!("Error parsing user_id from jwt: {}", e);

                            return Some(ServerSocketMessage::IndividualError {
                                client_id: client_state.client_id,
                                error: ClientError::UserNotFound {
                                    user_id: client_state.client_id.to_string(),
                                },
                            });
                        },
                        Ok(user_id) => user_id,
                    };

                    let user = match user_store.get_user_by_id(&user_id).await {
                        Err(e) => {
                            println!("Error fetching user {}: {}", user_id, e);

                            return Some(ServerSocketMessage::IndividualError {
                                client_id: client_state.client_id,
                                error: ClientError::Other {
                                    message: format!("Error fetching user {}", user_id),
                                },
                            })
                        },
                        Ok(None) => {
                            return Some(ServerSocketMessage::IndividualError {
                                client_id: client_state.client_id,
                                error: ClientError::UserNotFound {
                                    user_id: user_id.to_string(),
                                },
                            })
                        },
                        Ok(Some(user)) => user,
                    };

                    let permission : Option<WhiteboardPermissionEnum> = {
                        let whiteboard = client_state.whiteboard_ref.lock().await;

                        whiteboard.permissions_by_user_id.get(&user_id.to_string()).copied()
                    };

                    if let Some(permission) = permission {
                        // User has a valid permission
                        {
                            let mut clients = client_state.active_clients.lock().await;
                            clients.insert(
                                client_state.client_id,
                                UserSummary {
                                    user_id: user_id.to_string(),
                                    username: user.username.clone(),
                                },
                            );
                        }

                        {
                            let mut user_perm = client_state.user_whiteboard_permission.lock().await;

                            *user_perm = Some(permission);
                        }

                        // -- initialize client
                        Some(ServerSocketMessage::InitClient {
                            client_id: client_state.client_id,
                            whiteboard: client_state.whiteboard_ref.lock().await.to_client_view(),
                        })
                    } else {
                        // User has no valid permission; send back an error message
                        Some(ServerSocketMessage::IndividualError {
                            client_id: client_state.client_id,
                            error: ClientError::Unauthorized,
                        })
                    }
                },
                // -- All other messages should be responded to with an individual error
                _ => Some(ServerSocketMessage::IndividualError {
                    client_id: client_state.client_id,
                    error: ClientError::NotAuthenticated,
                }),
            }
        },
        Err(e) => {
            println!("ERROR: invalid client message: {}", client_msg_s);
            println!("Reason: {}", e);

            Some(ServerSocketMessage::IndividualError {
                client_id: client_state.client_id,
                error: ClientError::InvalidMessage {
                    client_message_raw: String::from(client_msg_s),
                },
            })
        }
    }
}// end handle_unauthenticated_client_message

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

// === JWTClaims ==================================================================================
//
// Stores the claims of the JWTs generated by the RestAPI's login service.
//
// Ensure that this struct stays in-sync with the claims generated by the RestAPI.
//
// ================================================================================================
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JWTClaims {
    sub: String,

    // -- the time at which the token was issued, in UNIX epoch seconds
    #[serde(rename = "iat")]
    issued_at_epoch_secs: i64,

    // -- the time at which the token should expire, in UNIX epoch seconds
    #[serde(rename = "exp")]
    expiration_epoch_secs: i64,
}

#[derive(Clone, Debug)]
pub struct JWTExpiredError {
    expiration_dt_utc: Option<chrono::DateTime<Utc>>,
}

impl JWTExpiredError {
    pub fn new(timestamp: i64) -> Self {
        Self {
            expiration_dt_utc: chrono::DateTime::<Utc>::from_timestamp(timestamp, 0),
        }
    }
}

impl std::fmt::Display for JWTExpiredError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "jwt expired at {:?}", self.expiration_dt_utc)
    }
}

impl std::error::Error for JWTExpiredError {}

pub fn get_user_id_from_jwt(token_s: &str, secret: &str) -> Result<ObjectId, Box::<dyn std::error::Error + Send + Sync>> {
    use hmac::{Hmac, Mac};
    use jwt::{
        VerifyWithKey,
        Header,
        Token,
    };
    use sha2::Sha256;

    let key: Hmac<Sha256> = Hmac::new_from_slice(secret.as_bytes())?;
    let token : Token<Header, JWTClaims, _> = token_s.verify_with_key(&key)?;
    let claims = token.claims();

    let timestamp_now_utc = chrono::Local::now().to_utc().timestamp();
    let timestamp_exp_utc = claims.expiration_epoch_secs;
    
    if timestamp_now_utc >= timestamp_exp_utc {
        Err(Box::new(JWTExpiredError::new(timestamp_exp_utc)))
    } else {
        Ok(ObjectId::parse_str(claims.sub.as_str())?)
    }
}
