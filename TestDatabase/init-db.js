// === init-db.js ==============================================================
//
// Initializes the database with test data.
//
// No volume should be mounted for the container to persist data between runs.
// This ensures that tests run with the same data each time.
//
// =============================================================================

db = db.getSiblingDB("testdb"); // create/use "testdb"

// --- Create Users ---
const users = [
  {
    _id: new ObjectId('68d5e8cf829da666aece5f47'),
    username: "alice",
    email: "alice@example.com",
    // password: password123
    passwordHashed: "$2b$10$lE4PvWzGiI.hKlq98/EFW.9QSKDDkq.O/WHvMjeMvheUiDxE2pzgW",
  },
  {
    _id: new ObjectId('68d5e8d4829da666aece5f48'),
    username: "bob",
    email: "bob@example.com",
    // password: password456
    passwordHashed: "$2b$10$uLkhrYaddxeki7BymA4MdeqLtWgIRKjcQvgJvSbNhx1FQrWTJO8/2",
  },
  {
    _id: new ObjectId('68d5e8d4829da666aece5f49'),
    username: "carol",
    email: "carol@example.com",
    // password: password789
    passwordHashed: "$2b$10$DQXE2KyaqWw3xS6wf.tdn.BRh0s7MXrhpHhibzFZ0fUqsnowBYcGq",
    },
  {
    _id: new ObjectId('68d5e8d5829da666aece5f4a'),
    username: "dave",
    email: "dave@example.com",
    // password: password101
    passwordHashed: "$2b$10$cGyV5HrtmrLGBr/6tU32/OsfmIFbPu28EzV6td0C9aRHfVCNs5d2e",
  },
  {
    _id: new ObjectId('68d5e8d6829da666aece5f4b'),
    username: "eve",
    email: "eve@example.com",
    // password: weakpassword
    passwordHashed: "$2b$10$ihPYYk6dgK/OwTMkBOnlXe9UDcSHNvYSWQe5N0oM11TPwle7EJrH2",
  },
];

db.users.insertMany(users);

const insertedUsers = db.users.find().toArray();

// --- Create Canvases ---
const canvases = [
  {
    _id: new ObjectId('68d5e8d4829da666aece5f4e'),
    width: 800,
    height: 600,
    name: "Canvas Alpha",
    time_created: new Date("2025-08-01T12:10:00.000Z"),
    time_last_modified: new Date("2025-08-10T12:10:00.000Z"),
    // null allowed_users = all users allowed
    // allowed_users: [],
  },
  {
    _id: new ObjectId('68d5e8d4829da666aece5f4f'),
    width: 1024,
    height: 768,
    name: "Canvas Beta",
    time_created: new Date("2025-08-02T12:20:00.000Z"),
    time_last_modified: new Date("2025-08-03T12:10:00.000Z"),
    // null allowed_users = all users allowed
    // allowed_users: [],
  },
  // -- children of first two canvases
  {
    _id: new ObjectId('68d5e8d4829da666aece5f50'),
    width: 200,
    height: 200,
    name: "Canvas Alpha - One",
    parent_canvas: {
      canvas_id: new ObjectId('68d5e8d4829da666aece5f4e'),
      origin_x: 100,
      origin_y: 100,
    },
    time_created: new Date("2025-08-01T12:10:00.000Z"),
    time_last_modified: new Date("2025-08-10T12:10:00.000Z"),
    // null allowed_users = all users allowed
    // allowed_users: [],
  },
  {
    _id: new ObjectId('68d5e8d4829da666aece5f51'),
    width: 800,
    height: 600,
    name: "Canvas Alpha - Two",
    parent_canvas: {
      canvas_id: new ObjectId('68d5e8d4829da666aece5f4e'),
      origin_x: 300,
      origin_y: 300,
    },
    time_created: new Date("2025-08-01T12:10:00.000Z"),
    time_last_modified: new Date("2025-08-10T12:10:00.000Z"),
    // null allowed_users = all users allowed
    // allowed_users: [],
  },
  {
    _id: new ObjectId('68d5e8d4829da666aece5f52'),
    width: 100,
    height: 100,
    name: "Canvas Alpha - Three",
    parent_canvas: {
      // Canvas Alpha - One
      canvas_id: new ObjectId('68d5e8d4829da666aece5f50'),
      origin_x: 50,
      origin_y: 50,
    },
    time_created: new Date("2025-08-01T12:10:00.000Z"),
    time_last_modified: new Date("2025-08-10T12:10:00.000Z"),
    // null allowed_users = all users allowed
    // allowed_users: [],
  },
  {
    _id: new ObjectId('68d5e8d4829da666aece5f53'),
    width: 800,
    height: 600,
    name: "Canvas Beta - One",
    parent_canvas: {
      canvas_id: new ObjectId('68d5e8d4829da666aece5f4f'),
      origin_x: 100,
      origin_y: 100,
    },
    time_created: new Date("2025-08-01T12:10:00.000Z"),
    time_last_modified: new Date("2025-08-10T12:10:00.000Z"),
    // null allowed_users = all users allowed
    // allowed_users: [],
  },
];

db.canvases.insertMany(canvases);

const insertedCanvases = db.canvases.find().toArray();

// --- Create shapes/canvas objects ---
const shapes = [
  {
    _id: new ObjectId('68d5e8d4829da666aece5f54'),
    // Canvas Alpha - Three
    canvas_id: new ObjectId('68d5e8d4829da666aece5f52'),
    type: 'rect',
    width: 10,
    height: 10,
    x: 20,
    y: 20,
    rotation: 0,
    fillColor: "red",
    strokeColor: "black",
    strokeWidth: 1.0,
  },
  {
    _id: new ObjectId('68d5e8d4829da666aece5f55'),
    // Canvas Beta - One
    canvas_id: new ObjectId('68d5e8d4829da666aece5f53'),
    type: 'rect',
    width: 10,
    height: 10,
    x: 20,
    y: 20,
    rotation: 0,
    fillColor: "red",
    strokeColor: "black",
    strokeWidth: 1.0,
  },
];

db.shapes.insertMany(shapes);

const insertedShapes = db.shapes.find().toArray();

// --- Create Whiteboards ---
const whiteboards = [
  {
    _id: new ObjectId('68d5e8d4829da666aece5f56'),
    name: "Project Alpha",
    time_created: new Date("2025-08-01T12:00:00.000Z"),
    owner: insertedUsers[0]._id, // Alice
    root_canvas: insertedCanvases[0]._id,
    shared_users: [],
  },
  {
    _id: new ObjectId('68d5e8d4829da666aece5f57'),
    name: "Project Beta",
    time_created: new Date("2025-08-02T12:10:00.000Z"),
    owner: insertedUsers[1]._id, // Bob
    root_canvas: insertedCanvases[1]._id,
    shared_users: [],
  },
];

db.whiteboards.insertMany(whiteboards);

const insertedWhiteboards = db.whiteboards.find().toArray();

print("Database initialized with test users and whiteboards.");
