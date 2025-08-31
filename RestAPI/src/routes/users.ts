import { Request, Response, Router } from "express";

import {
  getUser,
  createUser,
  patchUser,
  deleteUser
} from "../controllers/users";

import {
  authenticateJWT
} from '../middleware/auth';

import type {
  AuthorizedRequestBody
} from "../models/Auth";

import type {
  PatchUserRequest,
  CreateUserRequest
} from "../models/User";

const router = Router();

router.post("/", async (
  req: Request<{}, {}, CreateUserRequest>,
  res: Response
) => {
    // TODO: secure logging to scrub credentials
    console.log('Received POST /users:', req.body);
    await createUser(req, res);
});

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

// === DELETE /users/me ========================================================
//
// Deletes the user's own account.
// 
// =============================================================================
router.delete('/me', async (
  req: Request<{}, any, AuthorizedRequestBody>,
  res: Response
) => {
  const { authUser } = req.body;
  const { id: userId } = authUser;
  const resp = await deleteUser(userId);

  if (resp.result === 'err') {
    res.status(400).json({ message: resp.err });
  } else {
    res.status(200).json(resp.data);
  }
});

export default router;
