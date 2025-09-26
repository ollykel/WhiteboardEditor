// === tests.rs ===================================================================================
//
// COntains all unit tests for the crate.
//
// ================================================================================================

#[cfg(test)]
mod unit_tests {
    use crate::*;

    #[tokio::test]
    async fn handle_invalid_client_message() {
        // not even valid json
        let test_client_id = 0;
        let client_msg_s = "This is not valid json";
        let client_state = ClientState {
            client_id: test_client_id,
            whiteboard_ref: Arc::new(Mutex::new(Whiteboard {
                id: ObjectId::new(),
                name: String::from("Test"),
                canvases: HashMap::new(),
                owner_id: ObjectId::new(),
                shared_users: vec![],
            })),
            active_clients: Arc::new(Mutex::new(HashMap::new())),
            diffs: Arc::new(Mutex::new(Vec::new())),
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

    #[tokio::test]
    async fn handle_client_message_create_shapes() {
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
        let client_state = ClientState {
            client_id: test_client_id,
            whiteboard_ref: Arc::new(Mutex::new(Whiteboard {
                id: ObjectId::new(),
                name: String::from("Test"),
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
                owner_id: ObjectId::new(),
                shared_users: vec![],
            })),
            active_clients: Arc::new(Mutex::new(HashMap::new())),
            diffs: Arc::new(Mutex::new(Vec::new())),
        };

        let resp = handle_client_message(&client_state, &client_msg_s).await;

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
}
