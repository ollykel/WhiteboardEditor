// === tests.rs ===================================================================================
//
// COntains all unit tests for the crate.
//
// ================================================================================================

#[cfg(test)]
mod unit_tests {
    use crate::*;
    use std::collections::{
        HashMap,
    };

    #[tokio::test]
    async fn handle_invalid_client_message() {
        // not even valid json
        let test_client_id = 0;
        let client_msg_s = "This is not valid json";

        // -- initialize client state
        let whiteboard = Whiteboard {
            id: ObjectId::new(),
            metadata: WhiteboardMetadata {
                name: String::from("Test"),
                owner_id: ObjectId::new(),
                shared_users: vec![],
                permissions_by_user_id: HashMap::new(),
            },
            canvases: HashMap::new(),
        };

        let client_state = ClientState {
            client_id: test_client_id,
            jwt_secret: String::from("abcd"),
            user_whiteboard_permission: Mutex::new(None),
            whiteboard_ref: Arc::new(Mutex::new(whiteboard.clone())),
            active_clients: Arc::new(Mutex::new(HashMap::new())),
            diffs: Arc::new(Mutex::new(Vec::new())),
        };

        let resp = handle_authenticated_client_message(
            &client_state,
            client_msg_s
        ).await;

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

    #[tokio::test]
    async fn handle_authenticated_client_message_create_shapes() {
        let f64_prec: f64 = 1.0e-16;
        let test_client_id = 0;
        let canvas_a_id = ObjectId::new();
        let shapes_expected = vec![
            ShapeModel::Rect {
                x: 100.0,
                y: 100.0,
                width: 64.0,
                height: 64.0,
                stroke_width: 1.0,
                stroke_color: String::from("#333333"),
                fill_color: String::from("#ff0000"),
            },
            ShapeModel::Rect {
                x: 200.0,
                y: 200.0,
                width: 64.0,
                height: 64.0,
                stroke_width: 1.0,
                stroke_color: String::from("#333333"),
                fill_color: String::from("#ff0000"),
            },
            ShapeModel::Rect {
                x: 300.0,
                y: 300.0,
                width: 64.0,
                height: 64.0,
                stroke_width: 1.0,
                stroke_color: String::from("#333333"),
                fill_color: String::from("#ff0000"),
            },
        ];
        let client_msg_s = format!(r##"
        {{
            "type": "create_shapes",
            "canvasId": "{}",
            "shapes": [
                {{
                    "type": "rect",
                    "x": 100,
                    "y": 100,
                    "width": 64,
                    "height": 64,
                    "strokeWidth": 1,
                    "strokeColor": "#333333",
                    "fillColor": "#ff0000"
                }},
                {{
                    "type": "rect",
                    "x": 200,
                    "y": 200,
                    "width": 64,
                    "height": 64,
                    "strokeWidth": 1,
                    "strokeColor": "#333333",
                    "fillColor": "#ff0000"
                }},
                {{
                    "type": "rect",
                    "x": 300,
                    "y": 300,
                    "width": 64,
                    "height": 64,
                    "strokeWidth": 1,
                    "strokeColor": "#333333",
                    "fillColor": "#ff0000"
                }}
            ]
        }}
        "##, canvas_a_id);

        let whiteboard = Whiteboard {
            id: ObjectId::new(),
            metadata: WhiteboardMetadata {
                name: String::from("Test"),
                owner_id: ObjectId::new(),
                shared_users: vec![],
                permissions_by_user_id: HashMap::new(),
            },
            canvases: HashMap::from([
                (
                    canvas_a_id.clone(),
                    Canvas {
                        id: canvas_a_id.clone(),
                        next_shape_id_base: 0,
                        width: 512,
                        height: 512,
                        name: String::from("Canvas A"),
                        time_created: Utc::now(),
                        time_last_modified: Utc::now(),
                        shapes: HashMap::new(),
                        allowed_users: None, // None = open to all
                    }
                )
            ]),
        };

        let client_state = ClientState {
            client_id: test_client_id,
            jwt_secret: String::from("abcd"),
            user_whiteboard_permission: Mutex::new(
                Some(WhiteboardPermissionEnum::Own)
            ),
            whiteboard_ref: Arc::new(Mutex::new(whiteboard.clone())),
            active_clients: Arc::new(Mutex::new(HashMap::new())),
            diffs: Arc::new(Mutex::new(Vec::new())),
        };

        let resp = handle_authenticated_client_message(
            &client_state,
            &client_msg_s
        ).await;

        match resp {
            None => panic!("Expected some client message, got None"),
            // CreateShapes { client_id: ClientIdType, canvas_id: CanvasIdType, shapes: HashMap<CanvasObjectIdType, ShapeModel> },
            Some(server_msg) => match server_msg {
                ServerSocketMessage::CreateShapes { client_id, canvas_id, shapes } => {
                    if client_id != test_client_id {
                        panic!("Expected client_id = {}; got {}", test_client_id, client_id);
                    } else if canvas_id != canvas_a_id.to_string() {
                        panic!("Expected canvas_id = {}; got {}", canvas_a_id, canvas_id);
                    } else if shapes.len() != shapes_expected.len() {
                        panic!(
                            r#"
                            Expected shapes map to contain {} items; got {}

                            Shapes: {:?}
                            "#,
                            shapes_expected.len(),
                            shapes.len(),
                            shapes
                        );
                    } else {
                        // success
                        let mut shapes_entries : Vec<(&String, &ShapeModel)> = shapes.iter()
                            .collect();

                        shapes_entries.sort_by_key(|(obj_id, _)| (*obj_id).clone());

                        for (ref shape_entry, ref shape_expected) in shapes_entries.iter().zip(shapes_expected.iter()) {
                            let (_, shape) = shape_entry;

                            match (shape, shape_expected) {
                                (
                                    ShapeModel::Rect { x, y, width, height, stroke_width, stroke_color, fill_color },
                                    ShapeModel::Rect { x: x_exp, y: y_exp, width: width_exp, height: height_exp, stroke_width: stroke_width_exp, stroke_color: stroke_color_exp, fill_color: fill_color_exp }
                                ) => {
                                    if (x - x_exp).abs() > f64_prec {
                                        panic!("Expected shape x = {}; got {}", x, x_exp);
                                    }
                                    if (y - y_exp).abs() > f64_prec {
                                        panic!("Expected shape y = {}; got {}", y, y_exp);
                                    }
                                    if (width - width_exp).abs() > f64_prec {
                                        panic!("Expected shape width = {}; got {}", width, width_exp);
                                    }
                                    if (height - height_exp).abs() > f64_prec {
                                        panic!("Expected shape height = {}; got {}", height, height_exp);
                                    }
                                    if (stroke_width - stroke_width_exp).abs() > f64_prec {
                                        panic!("Expected shape stroke_width = {}; got {}", stroke_width, stroke_width_exp);
                                    }
                                    if stroke_color != stroke_color_exp {
                                        panic!("Expected shape stroke_color = {}; got {}", stroke_color, stroke_color_exp);
                                    }
                                    if fill_color != fill_color_exp {
                                        panic!("Expected shape fill_color = {}; got {}", fill_color, fill_color_exp);
                                    }
                                },
                                (_, _) => panic!("Expected Rect; got {:?}", shape)
                            };

                            // success
                        }
                    }
                },
                _ => panic!("Expected ServerSocketMessage::IndividualError, got {:?}", server_msg)
            }
        };
    }

    // === fetch_whiteboard_from_mongodb ==========================================================
    //
    // Ensures that data is properly fetched and deserialized from MongoDB into the *MongoDBView
    // structs.
    //
    // Requires the test database to be running and freshly initialized before each invocation. See
    // the "test_db" service in docker-compose.yml and the TestDatabase directory for reference.
    //
    // ============================================================================================
    #[tokio::test]
    async fn fetch_whiteboard_from_mongodb() {
        // -- try fetching Project Alpha and its constituent components (see
        // TestDatabase/init-db.js for document definitions)
        use crate::bson::{
            oid::ObjectId,
        };
        use crate::chrono::{
            TimeZone,
            MappedLocalTime,
            Utc,
        };

        // -- initialize database connection
        let mongo_uri = "mongodb://test_db:27017/testdb";
        let mongo_client = connect_mongodb(&mongo_uri).await.unwrap();
        let db = mongo_client.default_database().unwrap();

        // -- call get_whiteboard_by_id; uses ID for "Project Alpha" in TestDatabase/init-db.js
        let whiteboard_id_s = "68d5e8d4829da666aece5f4c";
        let whiteboard_id = ObjectId::parse_str(&whiteboard_id_s).unwrap();
        // -- id for single canvas
        let canvas_id = ObjectId::parse_str("68d5e8d4829da666aece5f4e").unwrap();
        let whiteboard = get_whiteboard_by_id(&db, &whiteboard_id).await.unwrap().unwrap();

        // TODO: actually check contents of whiteboard with assert statement
        println!("Whiteboard Received: {:?}", whiteboard);

        assert!(whiteboard.id == whiteboard_id);
        assert!(whiteboard.metadata.name == "Project Alpha");
        assert!(whiteboard.metadata.owner_id == ObjectId::parse_str("68d5e8cf829da666aece5f47").unwrap());
        assert!(whiteboard.metadata.shared_users.len() == 0);
        assert!(whiteboard.canvases.len() == 1);
        assert!(whiteboard.canvases.contains_key(&canvas_id));

        // check contents of single canvas
        let canvas = whiteboard.canvases.get(&canvas_id).unwrap();

        assert!(canvas.id == canvas_id);
        assert!(canvas.width == 800);
        assert!(canvas.height == 600);
        assert!(canvas.name.as_str() == "Canvas Alpha");

        let exp_time_created = match Utc.timestamp_opt(1754050200, 0) {
            MappedLocalTime::Single(val) => val,
            bad_val => {
                panic!("Got {:?} from expected time created timestamp", bad_val);
            },
        };

        let exp_time_last_modified = match Utc.timestamp_opt(1754827800, 0) {
            MappedLocalTime::Single(val) => val,
            bad_val => {
                panic!("Got {:?} from expected time last modified timestamp", bad_val);
            },
        };

        assert!(canvas.time_created == exp_time_created);
        assert!(canvas.time_last_modified == exp_time_last_modified);
        assert!(canvas.shapes.len() == 0);
        assert!(canvas.allowed_users.is_none());
    }// -- end fn fetch_whiteboard_from_mongodb()

    // === MockStore ==============================================================================
    //
    // Instead of pulling data from database, contains pre-cached user values.
    //
    // ============================================================================================
    struct MockStore {
        users_by_id: HashMap<UserIdType, User>,
        whiteboards_by_id: HashMap<WhiteboardIdType, Whiteboard>,
    }// -- end struct MockStore

    impl UserStore for MockStore {
        async fn get_user_by_id(&self, user_id: &UserIdType) -> Result<Option<User>, Box<dyn std::error::Error + Send + Sync>> {
            match self.users_by_id.get(user_id) {
                Some(user) => Ok(Some(user.clone())),
                None => Ok(None),
            }
        }// -- end get_user_by_id
    }

    impl WhiteboardMetadataStore for MockStore {
        async fn get_whiteboard_metadata_by_id(&self, whiteboard_id: &WhiteboardIdType) -> Result<
            Option<WhiteboardMetadata>, Box<dyn std::error::Error + Send + Sync>
        > {
            match self.whiteboards_by_id.get(whiteboard_id) {
                Some(whiteboard) => Ok(Some(whiteboard.metadata.clone())),
                None => Ok(None),
            }
        }// -- end get_whiteboard_metadata_by_id
    }

    // === handle_valid_login_attempt =============================================================
    //
    // Ensure that handle_unauthenticated_client_message correctly handles a valid login attempt.
    //
    // ============================================================================================
    #[tokio::test]
    async fn handle_valid_login_attempt() {
        use mongodb::{
            bson::{
                oid::ObjectId,
            },
        };
        use hmac::{Hmac, Mac};
        use jwt::SignWithKey;
        use sha2::Sha256;

        let jwt_secret = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
        let target_uid_s = "68d5e8d4829da666aece5f48";
        let target_uid = ObjectId::parse_str(target_uid_s).expect("UID to be valid");

        // -- pre-generate jwt with desired uid
        let key : Hmac<Sha256> = Hmac::new_from_slice(jwt_secret.as_bytes())
            .expect("Valid key to be generated");
        let timestamp_iat_utc = chrono::Local::now().to_utc().timestamp() - 20;
        // expiration always in the future
        let timestamp_exp_utc = timestamp_iat_utc + 999999;
        let jwt_claims = JWTClaims {
            sub: String::from(target_uid_s),
            issued_at_epoch_secs: timestamp_iat_utc,
            expiration_epoch_secs: timestamp_exp_utc,
        };
        let token_s = jwt_claims.sign_with_key(&key).unwrap();

        // -- initialize user store
        let user_store = MockStore {
            users_by_id: HashMap::from([
                (target_uid, User {
                    id: ObjectId::parse_str(target_uid_s).unwrap(),
                    username: String::from("bob"),
                    email: String::from("bob@example.com"),
                }),
            ]),
            whiteboards_by_id: HashMap::new(),  // not needed here
        };

        // -- initialize mock client state
        let test_client_id = 0;

        let whiteboard = Whiteboard {
            id: ObjectId::new(),
            metadata: WhiteboardMetadata {
                name: String::from("Test"),
                owner_id: ObjectId::new(),
                shared_users: vec![
                    WhiteboardPermission {
                        permission_type: WhiteboardPermissionType::User {
                            user: target_uid,
                        },
                        permission: WhiteboardPermissionEnum::Edit,
                    },
                ],
                permissions_by_user_id: HashMap::from([
                    (String::from(target_uid_s), WhiteboardPermissionEnum::Edit),
                ]),
            },
            canvases: HashMap::new(),
        };
        let client_state = ClientState {
            client_id: test_client_id,
            jwt_secret: String::from(jwt_secret),
            user_whiteboard_permission: Mutex::new(None),
            whiteboard_ref: Arc::new(Mutex::new(whiteboard.clone())),
            active_clients: Arc::new(Mutex::new(HashMap::new())),
            diffs: Arc::new(Mutex::new(Vec::new())),
        };

        // -- create authentication message (json)
        let client_login_msg_s = format!(
            r#"{{ "type": "login", "jwt": "{}" }}"#, 
            token_s
        );

        // -- attempt login
        let resp = handle_unauthenticated_client_message(
            &client_state,
            &user_store,
            client_login_msg_s.as_str()
        ).await.expect("Response to client login message");

        match resp {
            ServerSocketMessage::InitClient { client_id, whiteboard: whiteboard_view } => {
                let user_perm = client_state.user_whiteboard_permission.lock().await;
                let active_clients = client_state.active_clients.lock().await;

                assert_eq!(client_id, test_client_id);
                assert_eq!(whiteboard_view, whiteboard.to_client_view());
                assert_eq!(*user_perm, Some(WhiteboardPermissionEnum::Edit));
                assert_eq!(*active_clients, HashMap::from([
                    (test_client_id, UserSummary {
                        user_id: String::from(target_uid_s),
                        username: String::from("bob"),
                    })
                ]));
            },
            bad_resp => {
                panic!("Expected InitClient message, got {:?}", bad_resp);
            },
        };
    }// -- end fn fetch_user_from_mongodb_user_store

    // === fetch_user_from_mongodb_user_store =====================================================
    //
    // Tests instantiating a MongoDBStore and using it to fetch a user account from the test
    // database.
    //
    // See TestDatabase/init-db.js for the sample data.
    //
    // ============================================================================================
    #[tokio::test]
    async fn fetch_user_from_mongodb_user_store() {
        use mongodb::{
            Collection,
            bson::{
                oid::{
                    ObjectId,
                },
            },
        };

        // -- initialize database connection
        let mongo_uri = "mongodb://test_db:27017/testdb";
        let mongo_client = connect_mongodb(&mongo_uri).await
            .expect("Mongo client to establish connection to database");
        let db = mongo_client.default_database()
            .expect("The mongo uri to point to a default database");
        let user_coll: Collection<UserMongoDBView> = db.collection::<UserMongoDBView>(
            "users"
        );
        let whiteboard_metadata_coll: Collection<WhiteboardMetadataMongoDBView> = db.collection::<WhiteboardMetadataMongoDBView>(
            "whiteboards"
        );

        // -- "alice"
        let uid = ObjectId::parse_str("68d5e8cf829da666aece5f47")
            .expect("The provided string is a valid ObjectId");

        // -- instantiate MongoDBStore
        let user_store = MongoDBStore::new(&user_coll, &whiteboard_metadata_coll);

        // -- fetch the user from the database
        let user_opt = user_store.get_user_by_id(&uid).await
            .expect("The user store to return a user with the given ID");
        let user = user_opt.expect("User to be non-null");

        // -- ensure fetched user matches expected value
        assert!(user.id == uid);
        assert!(user.username.as_str() == "alice");
        assert!(user.email.as_str() == "alice@example.com");
    }// -- end fn fetch_user_from_mongodb_user_store()
}
