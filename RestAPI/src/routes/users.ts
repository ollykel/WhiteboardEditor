import { Request, Response, Router } from "express";

import {
  getUser,
  createUser
} from "../controllers/users";

import {
  authenticateJWT
} from '../middleware/auth';

import type {
  AuthorizedRequestBody
} from "../models/Auth";

const router = Router();

router.post("/", createUser);

// --- Routes below are authenticated
router.use(authenticateJWT);

// === GET /users/me ===========================================================
//
// Fetch the authenticated user's data.
//
// =============================================================================
router.get("/me", async (
  req: Request<{}, any, AuthorizedRequestBody>,
  res: Response
) => {
  const { authUser } = req.body;
  const { id: userId } = authUser;
  const user = await getUser(userId);

  if (! user) {
    res.status(404).json({
      message: `Could not find user with id ${userId}`
    });
  } else {
    res.status(200).json(user);
  }
});

export default router;
