// tests/whiteboards.test.ts
import request from "supertest";
import app from "../src/app";
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (! MONGO_URI) {
  console.error('ERROR: unset env var MONGO_URI');
  process.exit(1);
}

// handle database connection
const connectToDatabase = async () => {
  await mongoose.connect(MONGO_URI)
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
});
