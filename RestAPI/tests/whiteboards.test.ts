import request from "supertest";
import app from "../src/app";
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";

// -- imports from models
import type {
  IUser
} from '../src/models/User';

const MONGO_URI = 'mongodb://test_db:27017/testdb';

// handle database connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI)
  } catch (err) {
    console.error('FAILED TO CONNECT TO DATABASE:', err);
    process.exit(1);
  }
};

const disconnectFromDatabase = async () => {
  await mongoose.disconnect();
};

beforeAll(connectToDatabase);

afterAll(disconnectFromDatabase);

// === standard utilities for validating certain objects =======================
//
// =============================================================================

// === validateUser ============================================================
//
// Ensures that the user object is a valid public view of a user. Should include
// id, email, and username, but exclude the hashed password.
//
// =============================================================================
const validateUser = (user: IUser, fieldValues: {} | any[]) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('username');
  expect(user).not.toHaveProperty('passwordHashed');

  if (fieldValues) {
    expect(user).toMatchObject(fieldValues);
  }
};

describe("Whiteboards API", () => {
  it("should allow an authenticated user to get their own whiteboard", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');
    const whiteboardCollection = mongoose.connection.collection('whiteboards');

    const whiteboard = await whiteboardCollection.findOne({ name: "Project Alpha"});
    const owner = await userCollection.findOne({ username: 'alice' });

    expect(jwtSecret).not.toBeNull();
    expect(owner).not.toBeNull();
    expect(whiteboard).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! owner) || (! whiteboard)) {
      return;
    }

    const targetUrl = `/api/v1/whiteboards/${whiteboard._id.toString()}`;

    console.log('Target url:', targetUrl);

    // Generate signed JWT
    const authToken = jwt.sign(
      { sub: owner._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 }
    );

    // -- Get whiteboard
    const wbRes = await request(app)
      .get(targetUrl)
      .set("Authorization", `Bearer ${authToken}`)
      .send()
      .expect(200);

    expect(wbRes.body).toHaveProperty('_id');
    expect(wbRes.body).toHaveProperty('name');
    expect(wbRes.body).toHaveProperty('time_created');
    expect(wbRes.body).toHaveProperty('shared_users');
    expect(Array.isArray(wbRes.body.shared_users)).toBe(true);

    // -- check that owner is present and validly formatted as a user
    expect(wbRes.body).toHaveProperty('owner');
    validateUser(wbRes.body.owner, ({
      username: 'alice',
      email: 'alice@example.com',
    }));

    // check that single canvas is present
    expect(wbRes.body).toHaveProperty('canvases');
    expect(Array.isArray(wbRes.body.canvases)).toBe(true);
    expect(wbRes.body.canvases.length).toBe(1);

    const sharedUsersLimited = wbRes.body.shared_users.map((perm: any) => {
      const { type, user_id, permission } = perm;

      return ({ type, user_id: user_id.toString(), permission });
    });

    expect(sharedUsersLimited).toEqual([]);
  });

  it("should not create a new whiteboard for an unauthenticated user", async () => {
    await request(app)
      .post("/api/v1/whiteboards")
      .send({
        name: "Bad Whiteboard"
      })
      .expect(401);
  });

  it("should create a new whiteboard for an authenticated user", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');

    const user = await userCollection.findOne({ username: 'alice' });

    expect(jwtSecret).not.toBeNull();
    expect(user).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! user)) {
      return;
    }

    // Generate signed JWT
    const authToken = jwt.sign(
      { sub: user._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 }
    );

    // -- Create whiteboard
    const wbRes = await request(app)
      .post("/api/v1/whiteboards")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Alice's Whiteboard"
      })
      .expect(201);

    // Verify response body
    expect(wbRes.body).toHaveProperty("_id");
    expect(wbRes.body).toHaveProperty("name", "Alice's Whiteboard");
    expect(wbRes.body).toHaveProperty("owner");
    expect(wbRes.body).toHaveProperty("shared_users");
    expect(Array.isArray(wbRes.body.shared_users)).toBe(true);
  });

  it("should allow an authenticated user to share their whiteboard", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');
    const whiteboardCollection = mongoose.connection.collection('whiteboards');

    const whiteboard = await whiteboardCollection.findOne({ name: "Project Alpha"});
    const owner = await userCollection.findOne({ username: 'alice' });
    const sharee = await userCollection.findOne({ username: 'bob' });

    expect(jwtSecret).not.toBeNull();
    expect(owner).not.toBeNull();
    expect(sharee).not.toBeNull();
    expect(whiteboard).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! owner) || (! sharee) || (! whiteboard)) {
      return;
    }

    const targetUrl = `/api/v1/whiteboards/${whiteboard._id}/share`;

    console.log('Target url:', targetUrl);

    // Generate signed JWT
    const authToken = jwt.sign(
      { sub: owner._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 }
    );

    // -- Share whiteboard
    const wbRes = await request(app)
      .post(targetUrl)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userPermissions: [
          {
            type: 'id',
            user_id: sharee._id.toString(),
            permission: 'view'
          }
        ]
      })
      .expect(200);

      expect(wbRes.body).toHaveProperty('_id');
      expect(wbRes.body).toHaveProperty('name');
      expect(wbRes.body).toHaveProperty('time_created');
      expect(wbRes.body).toHaveProperty('canvases');
      expect(wbRes.body).toHaveProperty('owner');

      // -- verification that shared_users has one permission
      expect(wbRes.body).toHaveProperty('shared_users');
      expect(Array.isArray(wbRes.body.shared_users)).toBe(true);
      expect(wbRes.body.shared_users.length).toBe(1);
      expect(wbRes.body.shared_users[0]).toMatchObject({
        type: 'id',
        user_id: sharee._id.toString(),
        permission: 'view'
      });
  });

  it("should not allow a user to share a whiteboard they don't own", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');
    const whiteboardCollection = mongoose.connection.collection('whiteboards');

    const whiteboard = await whiteboardCollection.findOne({ name: "Project Beta"});
    const owner = await userCollection.findOne({ username: 'alice' });
    const sharee = await userCollection.findOne({ username: 'bob' });

    expect(jwtSecret).not.toBeNull();
    expect(owner).not.toBeNull();
    expect(sharee).not.toBeNull();
    expect(whiteboard).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! owner) || (! sharee) || (! whiteboard)) {
      return;
    }

    // Generate signed JWT
    const authToken = jwt.sign(
      { sub: owner._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 }
    );

    // -- Share whiteboard
    await request(app)
      .post(`/api/v1/whiteboards/${whiteboard._id}/share`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userPermissions: [{
          type: 'id',
          user_id: sharee._id.toString(),
          permission: 'view'
        }]
      })
      .expect(403);
  });

  it("should not allow a user to share a whiteboard with user with a malformed user ID", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');
    const whiteboardCollection = mongoose.connection.collection('whiteboards');

    const whiteboard = await whiteboardCollection.findOne({ name: "Project Alpha"});
    const owner = await userCollection.findOne({ username: 'alice' });

    expect(jwtSecret).not.toBeNull();
    expect(owner).not.toBeNull();
    expect(whiteboard).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! owner) || (! whiteboard)) {
      return;
    }

    // Generate signed JWT
    const authToken = jwt.sign(
      { sub: owner._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 }
    );

    // -- Share whiteboard
    await request(app)
      .post(`/api/v1/whiteboards/${whiteboard._id}/share`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        // Not a real id
        userPermissions: [{
          type: 'id',
          user_id: 'zzzzzzz',
          permission: 'view'
        }]
      })
      .expect(400);
  });

  it("should not allow a user to share a whiteboard with a user that doesn't exist", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');
    const whiteboardCollection = mongoose.connection.collection('whiteboards');

    const whiteboard = await whiteboardCollection.findOne({ name: "Project Alpha"});
    const owner = await userCollection.findOne({ username: 'alice' });

    expect(jwtSecret).not.toBeNull();
    expect(owner).not.toBeNull();
    expect(whiteboard).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! owner) || (! whiteboard)) {
      return;
    }

    // Generate signed JWT
    const authToken = jwt.sign(
      { sub: owner._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 }
    );

    // -- Share whiteboard
    await request(app)
      .post(`/api/v1/whiteboards/${whiteboard._id}/share`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        // With timestamp at beginning of unix epoch
        userPermissions: [{
          type: 'id',
          user_id: '000000018ab18fedd089b041',
          permission: 'view'
        }]
      })
      .expect(400);
  });

  it("should allow a user to share a whiteboard with a user email that doesn't correspond to an existing account", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');
    const whiteboardCollection = mongoose.connection.collection('whiteboards');

    const whiteboard = await whiteboardCollection.findOne({ name: "Project Alpha"});
    const owner = await userCollection.findOne({ username: 'alice' });

    expect(jwtSecret).not.toBeNull();
    expect(owner).not.toBeNull();
    expect(whiteboard).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! owner) || (! whiteboard)) {
      return;
    }

    // Generate signed JWT
    const authToken = jwt.sign(
      { sub: owner._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 }
    );

    const userPermissions = [{
      type: 'email',
      // no corresponding user in Users collection
      email: 'noexist@example.com',
      permission: 'view'
    }];

    // -- Share whiteboard
    const wbRes = await request(app)
      .post(`/api/v1/whiteboards/${whiteboard._id}/share`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userPermissions
      })
      .expect(200);

    expect(wbRes.body).toHaveProperty('_id');
    expect(wbRes.body).toHaveProperty('name');
    expect(wbRes.body).toHaveProperty('time_created');
    expect(wbRes.body).toHaveProperty('canvases');
    expect(wbRes.body).toHaveProperty('owner');
    expect(wbRes.body).toHaveProperty('shared_users');

    // -- shared users
    expect(Array.isArray(wbRes.body.shared_users)).toBe(true);
    expect(wbRes.body.shared_users.length).toBe(userPermissions.length);

    for (const i in userPermissions) {
      expect(wbRes.body.shared_users[0]).toMatchObject(userPermissions[i]);
    }// -- end for (const i in userPermissions)
  });

  it("should convert a shared user email to a shared user id if an account exists for the given email", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');
    const whiteboardCollection = mongoose.connection.collection('whiteboards');

    const whiteboard = await whiteboardCollection.findOne({ name: "Project Alpha"});
    const owner = await userCollection.findOne({ username: 'alice' });

    expect(jwtSecret).not.toBeNull();
    expect(owner).not.toBeNull();
    expect(whiteboard).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! owner) || (! whiteboard)) {
      return;
    }

    // Generate signed JWT
    const authToken = jwt.sign(
      { sub: owner._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 }
    );

    const targetUserEmail = 'carol@example.com';
    const targetUser = await userCollection.findOne({ email: targetUserEmail });

    expect(targetUser).not.toBeNull();

    // to please typescript
    if (! targetUser) {
      return;
    }

    const userPermissionsReq = [{
      type: 'email',
      email: targetUserEmail,
      permission: 'view'
    }];

    const userPermissionsExpect = [{
      type: 'id',
      user_id: targetUser._id.toString(),
      permission: 'view'
    }];

    // -- Share whiteboard
    const wbRes = await request(app)
      .post(`/api/v1/whiteboards/${whiteboard._id}/share`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userPermissions: userPermissionsReq
      })
      .expect(200);

    expect(wbRes.body).toHaveProperty('_id');
    expect(wbRes.body).toHaveProperty('name');
    expect(wbRes.body).toHaveProperty('time_created');
    expect(wbRes.body).toHaveProperty('canvases');
    expect(wbRes.body).toHaveProperty('owner');

    // -- shared users
    expect(Array.isArray(wbRes.body.shared_users)).toBe(true);
    expect(wbRes.body.shared_users.length).toBe(userPermissionsExpect.length);

    for (const i in userPermissionsExpect) {
      expect(wbRes.body.shared_users[0]).toMatchObject(userPermissionsExpect[i]);
    }// -- end for (const i in userPermissionsExpect)
  });
});
