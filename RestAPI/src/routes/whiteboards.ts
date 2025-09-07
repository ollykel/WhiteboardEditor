import { Request, Response, Router } from "express";

// --- local imports
import {
  addSharedUsers
} from "../controllers/whiteboards";

import type {
  UserIdType
} from '../models/User';

import type {
  WhiteboardIdType
} from '../models/Whiteboard';

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

export type ShareWhiteboardRequestBody = AuthorizedRequestBody & (
  | {
    userIdType: 'id';
    ids: UserIdType[];
  }
  | {
    userIdType: 'email';
    emails: string[];
  }
)
// --- Share whiteboard with other users
router.post(
  "/:id/share",
  async (
    req: Request<{ id: WhiteboardIdType }, any, ShareWhiteboardRequestBody>,
    res: Response
  ) => {
    try {
      const { id: whiteboardId } = req.params;
      const { authUser, userIdType } = req.body;

      const result = await addSharedUsers(
        whiteboardId,
        authUser.id,
        (userIdType === 'id' ? ({
          userIdType,
          ids: req.body.ids
        })
        :
        ({
            userIdType,
            emails: req.body.emails
        }))
      );

      switch (result.status) {
        case "success":
          return res.status(200).json(result.whiteboard);
        case "no_whiteboard":
          return res.status(404).json({ error: "Whiteboard not found" });
        case "invalid_users":
        case "invalid_emails":
          return res
            .status(400)
            .json({ error: "Invalid users", invalid_users: result.invalid_users });
        case "forbidden":
          return res.status(403).json({ error: "You do not own this whiteboard" });
        default:
          console.error('Unexpected error:', result);
          return res.status(500).json({ error: "Unexpected error" });
      }
    } catch (err: any) {
      console.error("Error sharing whiteboard:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;

