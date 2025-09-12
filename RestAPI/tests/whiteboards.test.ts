import request from "supertest";
import app from "../src/app";
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";

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

describe("Whiteboards API", () => {
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
      expect(wbRes.body).toHaveProperty('shared_users');
      expect(Array.isArray(wbRes.body.shared_users)).toBe(true);

      if (wbRes.body.shared_users) {
        const sharedUsersLimited = wbRes.body.shared_users.map((perm: any) => {
          const { type, user_id, permission } = perm;

          return ({ type, user_id: user_id.toString(), permission });
        });
        expect(sharedUsersLimited).toEqual([
          {
            type: 'id',
            user_id: sharee._id.toString(),
            permission: 'view'
          }
        ]);
      }
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
});
