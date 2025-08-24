import { Request, Response, Router } from "express";

import {
  getUser,
  createUser,
  patchUser
} from "../controllers/users";

import {
  authenticateJWT
} from '../middleware/auth';

import type {
  AuthorizedRequestBody
} from "../models/Auth";

import type {
  PatchUserRequest
} from "../models/User";

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

// === PATCH /users/me =========================================================
//
// Update one or more fields in the authenticated user's data.
//
// =============================================================================
router.patch("/me", async (
  req: Request<{}, any, PatchUserRequest>,
  res: Response
) => {
  const { authUser } = req.body;
  const patchData: Partial<PatchUserRequest> = ({ ...req.body });
  const { id: userId } = authUser;
  const user = await getUser(userId);

  if (! user) {
    res.status(400).json({
      message: `Could not find user with id ${userId}`
    });
  } else {
    delete patchData.authUser;
    const patchUserRes = await patchUser(user, patchData);

    if (patchUserRes.type === 'error') {
      res.status(400).json({ message: patchUserRes.message });
    } else {
      res.status(201).json(patchUserRes.data);
    }
  }
});

export default router;
