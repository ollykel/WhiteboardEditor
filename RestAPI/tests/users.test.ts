import request from "supertest";
import app from "../src/app";
import mongoose from 'mongoose';

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

describe("Users API", () => {
  it("should create a new user", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .send({
        username: "tester_beta",
        email: "tester_beta@example.com",
        password: "password123"
      })
      .expect(201);

    expect(res.body).toHaveProperty("_id");
    expect(res.body.username).toBe("tester_beta");
    expect(res.body.email).toBe("tester_beta@example.com");
  });

  // Attempt unauthenticated /api/v*/users/me call, which should be forbidden
  it("should not allow an unauthenticated user to view GET /users/me", async () => {
    await request(app)
      .get("/api/v1/users/me")
      .expect(401);
  });
});
