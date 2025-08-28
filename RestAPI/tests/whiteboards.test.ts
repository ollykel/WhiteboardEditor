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
    const userCollection = mongoose.connection.collection('Users');

    const user = await userCollection.findOne({ username: 'alice' });

    expect(jwtSecret).not.toBeNull();
    expect(user).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! user)) {
      return;
    }

    // Generate signed JWT
    jwt.sign(
      { sub: user._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 },
      async (err, authToken) => {
        if (err) {
          fail(`Failed to sign jwt token: ${err}`);
        } else {
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
        }
      }
    );

  });

  it("should allow an authenticated user to share their whiteboard", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('Users');
    const whiteboardCollection = mongoose.connection.collection('Whiteboards');

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

    // Generate signed JWT
    jwt.sign(
      { sub: owner._id.toString() },   // sub = subject claim
      jwtSecret,
      { expiresIn: 999999999 },
      async (err, authToken) => {
        if (err) {
          fail(`Failed to sign jwt token: ${err}`);
        } else {
          // -- Share whiteboard
          const wbRes = await request(app)
            .post(`/api/v1/whiteboards/${whiteboard._id}/share`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
              users: [sharee._id]
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
              expect(wbRes.body.shared_users).toBe([sharee._id]);
            }
        }
      }
    );

  });
});
