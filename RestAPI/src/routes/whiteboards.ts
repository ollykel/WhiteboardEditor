import { Request, Response, Router } from "express";

import {
  type Types,
} from 'mongoose';

// --- local imports
import type {
  IWhiteboardUserPermission
} from '../models/Whiteboard';

import {
  authenticateJWT
} from '../middleware/auth';

import {
  getWhiteboardById,
  getWhiteboardsByOwner,
  createWhiteboard,
  shareWhiteboard,
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
      case 'server_error':
        return res.status(500).json({ message: 'An unexpected error occurred' });
      case 'invalid_id':
        return res.status(400).json({ message: 'Invalid whiteboard id' });
      case 'not_found':
        return res.status(404).json({ message: 'Whiteboard not found' });
      case 'ok':
      {
          const { whiteboard } = resp;
          const validUserIdSet: Record<string, boolean> = Object.fromEntries([
            [whiteboard.owner._id?.toString(), true],
            ...whiteboard.shared_users.filter(perm => perm.type === 'user').map(perm => [
              perm.user._id, true 
            ])
          ]);

          if (! (userId.toString() in validUserIdSet)) {
            return res.status(403).json({
              message: 'You are not authorized to view this resource'
            });
          } else {
            return res.status(200).json(whiteboard.toAttribView());
          }
      }
      default:
        return res.status(500).json({ message: 'Unexpected error occurred' });
    }
});

export interface ShareWhiteboardRequestBody extends AuthorizedRequestBody {
  userPermissions: IWhiteboardUserPermission<Types.ObjectId>[];
}

// --- Share whiteboard with other users
router.post("/:id/shared_users", shareWhiteboard);

export default router;

