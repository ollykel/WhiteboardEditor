import { Request, Response, Router } from "express";

// --- local imports
import {
  addSharedUsers
} from "../controllers/whiteboards";

import type {
  WhiteboardIdType,
  IWhiteboardUserPermission
} from '../models/Whiteboard';

import {
  authenticateJWT
} from '../middleware/auth';

import {
  getWhiteboardById,
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

// -- Get user's own whiteboards
router.get("/own", async (req: Request<{}, any, AuthorizedRequestBody>, res: Response) => {
  const { authUser } = req.body;
  const { id: ownerId } = authUser;
  const ownWhiteboards = await getWhiteboardsByOwner(ownerId);

  res.status(200).json(ownWhiteboards);
});

// -- Get whiteboard by id
router.get('/:whiteboardId', async (
  req: Request<{ whiteboardId: string }, any, AuthorizedRequestBody>,
  res: Response
) => {
    const { authUser } = req.body;
    const { id: userId } = authUser;
    const { whiteboardId } = req.params;

    // fetch whiteboard by id
    const resp = await getWhiteboardById(whiteboardId);

    switch (resp.status) {
      case 'invalid_id':
        return res.status(400).json({ message: 'Invalid whiteboard id' });
      case 'not_found':
        return res.status(404).json({ message: 'Whiteboard not found' });
      case 'ok':
      {
          const { whiteboard } = resp;
          console.log('!! Whiteboard:', whiteboard);
          const validUserIdSet: Record<string, boolean> = Object.fromEntries([
            [whiteboard.owner.id, true],
            ...whiteboard.shared_users.filter(perm => perm.type === 'id').map(perm => [
              perm.user_id, true
            ])
          ]);

          if (! (userId.toString() in validUserIdSet)) {
            return res.status(403).json({
              message: 'You are not authorized to view this resource'
            });
          } else {
            return res.status(200).json(whiteboard);
          }
      }
      default:
        return res.status(500).json({ message: 'Unexpected error occurred' });
    }
});

export interface ShareWhiteboardRequestBody extends AuthorizedRequestBody {
  userPermissions: IWhiteboardUserPermission[];
}

// --- Share whiteboard with other users
router.post(
  "/:id/share",
  async (
    req: Request<{ id: WhiteboardIdType }, any, ShareWhiteboardRequestBody>,
    res: Response
  ) => {
    try {
      const { id: whiteboardId } = req.params;
      const { authUser, userPermissions } = req.body;

      const result = await addSharedUsers(
        whiteboardId,
        authUser.id,
        userPermissions
      );

      switch (result.status) {
        case "success":
          return res.status(200).json(result.whiteboard.toPublicView());
        case "no_whiteboard":
          return res.status(404).json({ error: "Whiteboard not found" });
        case "invalid_users":
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

