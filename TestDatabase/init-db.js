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
  { username: "alice", email: "alice@example.com", passwordHashed: "hashed_pw1" },
  { username: "bob", email: "bob@example.com", passwordHashed: "hashed_pw2" },
  { username: "carol", email: "carol@example.com", passwordHashed: "hashed_pw3" },
  { username: "dave", email: "dave@example.com", passwordHashed: "hashed_pw4" },
  { username: "eve", email: "eve@example.com", passwordHashed: "hashed_pw5" },
];

db.Users.insertMany(users);

const insertedUsers = db.Users.find().toArray();

// --- Create Whiteboards ---
const whiteboards = [
  {
    name: "Project Alpha",
    time_created: new Date("2025-08-01T12:00:00.000Z"),
    canvases: [
      {
        width: 800,
        height: 600,
        time_created: new Date("2025-08-01T12:10:00.000Z"),
        time_last_modified: new Date("2025-08-10T12:10:00.000Z"),
        editors: [],
      },
    ],
    owner: insertedUsers[0]._id, // Alice
    shared_users: [],
  },
  {
    name: "Project Beta",
    time_created: new Date("2025-08-02T12:10:00.000Z"),
    canvases: [
      {
        width: 1024,
        height: 768,
        time_created: new Date("2025-08-02T12:20:00.000Z"),
        time_last_modified: new Date("2025-08-03T12:10:00.000Z"),
        editors: [],
      },
    ],
    owner: insertedUsers[1]._id, // Bob
    shared_users: [],
  },
];

db.Whiteboards.insertMany(whiteboards);

print("Database initialized with test users and whiteboards.");
