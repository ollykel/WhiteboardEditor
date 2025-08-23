import { Request, Response, Router } from "express";

import {
  authenticateJWT
} from '../middleware/auth';

import {
  getWhiteboardsByOwner,
  createWhiteboard
} from "../controllers/whiteboards";

import type {
  AuthorizedRequestBody
} from "../models/Auth";

const router = Router();

// --- all routes authenticated
router.use(authenticateJWT);

router.post("/", createWhiteboard);

// --- Get user's own whiteboards
router.get("/own", async (req: Request<{}, any, AuthorizedRequestBody>, res: Response) => {
  const { authUser } = req.body;
  const { id: ownerId } = authUser;
  const ownWhiteboards = await getWhiteboardsByOwner(ownerId);

  res.status(200).json(ownWhiteboards);
});

export default router;
