import request from "supertest";
import app from "../src/app";
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";

// -- imports from models
import type {
  IUser,
} from '../src/models/User';

import type {
  IWhiteboardAttribView,
  IWhiteboardUserPermission,
} from '../src/models/Whiteboard';

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

const validateWhiteboardAttribView = (
  whiteboard: IWhiteboardAttribView,
  fieldValues: Partial<IWhiteboardAttribView> | any[]
) => {
  expect(whiteboard).toHaveProperty('id');
  expect(whiteboard).not.toHaveProperty('_id');
  expect(whiteboard).toHaveProperty('name');
  expect(whiteboard).toHaveProperty('time_created');
  // NOTE: no canvases

  // -- owner
  expect(whiteboard).toHaveProperty('owner');
  validateUser(whiteboard.owner, {});

  // -- shared users
  expect(whiteboard).toHaveProperty('shared_users');
  expect(Array.isArray(whiteboard.shared_users)).toBe(true);
  for (const perm of whiteboard.shared_users) {
    switch (perm.type) {
      case 'user':
        expect(perm).toHaveProperty('user');
        validateUser(perm.user as unknown as IUser, {});
        break;
      case 'email':
        expect(perm).toHaveProperty('email');
        expect(typeof perm.email).toEqual('string');
        break;
      default:
        throw new Error(`Unrecognized permission type: ${perm}`);
    }
  }

  if (fieldValues) {
    let expectedValues = fieldValues;

    if ('shared_users' in fieldValues) {
      const {
        shared_users,
        ...expectedFieldValues
      } = fieldValues;
      const sharedUsers = shared_users as IWhiteboardUserPermission<any>[];

      expectedValues = expectedFieldValues;

      if (shared_users) {
        expect(Array.isArray(whiteboard.shared_users)).toBe(true);
        expect(whiteboard.shared_users.length).toBe(sharedUsers.length);

        for (let idx = 0; idx < sharedUsers.length; ++idx) {
          expect(whiteboard.shared_users[idx]).toMatchObject(sharedUsers[idx]);
        }
      }
    }

    expect(whiteboard).toMatchObject(expectedValues);
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

    expect(wbRes.body).toHaveProperty('id');
    expect(wbRes.body).not.toHaveProperty('_id');
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
      const { type, user, permission } = perm;

      return ({ type, user: user.toString(), permission });
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
    validateWhiteboardAttribView(wbRes.body, {
      name: "Alice's Whiteboard",
    });
  });

  it("should allow an authenticated user to share their whiteboard", async () => {
    const jwtSecret = process.env.JWT_SECRET;
    const userCollection = mongoose.connection.collection('users');
    const whiteboardCollection = mongoose.connection.collection('whiteboards');

    const whiteboard = await whiteboardCollection.findOne({ name: "Project Alpha"});
    const owner = await userCollection.findOne({ username: 'alice' });
    const sharee = await userCollection.findOne({ username: 'bob' })
      .then(user => user?.populateAttribs() || null);

    expect(jwtSecret).not.toBeNull();
    expect(owner).not.toBeNull();
    expect(sharee).not.toBeNull();
    expect(whiteboard).not.toBeNull();

    // to please TypeScript
    if ((! jwtSecret) || (! owner) || (! sharee) || (! whiteboard)) {
      return;
    }

    const targetUrl = `/api/v1/whiteboards/${whiteboard._id}/shared_users`;

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
            type: 'user',
            user: sharee._id.toString(),
            permission: 'view'
          }
        ]
      })
      .expect(200);

      validateWhiteboardAttribView(wbRes.body, {
        shared_users: [
          {
            type: 'user',
            user: sharee,
            permission: 'view'
          }
        ]
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
      .post(`/api/v1/whiteboards/${whiteboard._id}/shared_users`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userPermissions: [{
          type: 'user',
          user: sharee._id.toString(),
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
      .post(`/api/v1/whiteboards/${whiteboard._id}/shared_users`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        // Not a real id
        userPermissions: [{
          type: 'user',
          user: 'zzzzzzz',
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
      .post(`/api/v1/whiteboards/${whiteboard._id}/shared_users`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        // With timestamp at beginning of unix epoch
        userPermissions: [{
          type: 'user',
          user: '000000018ab18fedd089b041',
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

    const userPermissions: IWhiteboardUserPermission<any>[] = [{
      type: 'email',
      // no corresponding user in Users collection
      email: 'noexist@example.com',
      permission: 'view'
    }];

    // -- Share whiteboard
    const wbRes = await request(app)
      .post(`/api/v1/whiteboards/${whiteboard._id}/shared_users`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userPermissions
      })
      .expect(200);

    validateWhiteboardAttribView(wbRes.body, {
      shared_users: userPermissions,
    });
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
      type: 'user',
      user: targetUser._id.toString(),
      permission: 'view'
    }];

    // -- Share whiteboard
    const wbRes = await request(app)
      .post(`/api/v1/whiteboards/${whiteboard._id}/shared_users`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userPermissions: userPermissionsReq
      })
      .expect(200);

    validateWhiteboardAttribView(wbRes.body, {});

    // -- shared users
    expect(wbRes.body.shared_users.length).toBe(userPermissionsExpect.length);

    for (const i in userPermissionsExpect) {
      expect(wbRes.body.shared_users[0]).toMatchObject(userPermissionsExpect[i]);
    }// -- end for (const i in userPermissionsExpect)
  });
});
