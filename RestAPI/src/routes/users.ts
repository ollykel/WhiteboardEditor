// -- std imports
import { Request, Response, Router } from "express";

import {
  Types,
} from 'mongoose';

// -- local imports
import {
  SetInclusionOptionType
} from '../utils';

import {
  getUserById,
  createUser,
  patchUser,
  deleteUser,
  getSharedWhiteboardsByUser,
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

// === GET /users/:userId ======================================================
//
// Fetch the authenticated user's data.
//
// =============================================================================
router.get("/:userId", async (
  req: Request<{ userId: Types.ObjectId | 'me'}, any, AuthorizedRequestBody>,
  res: Response
) => {
    const { authUser } = req.body;
    const { id: authUserId } = authUser;
    const { userId } = req.params;
    const targetUserId = (userId === 'me') ? authUserId : userId;

    const resp = await getUserById(targetUserId);
    
    switch (resp.status) {
      case 'bad_request':
        return res.status(400).json({ message: resp.message });
      case 'not_found':
        return res.status(404).json({ message: `User ${targetUserId} not found` });
      case 'ok':
        return res.status(200).json(resp.user.toAttribView());
      default:
        throw new Error(`Unhandled case: ${resp}`);
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
    const resp = await getUserById(userId);

    switch (resp.status) {
        case 'bad_request':
          return res.status(400).json({ message: resp.message });
        case 'not_found':
          return res.status(404).json({ message: `User ${userId} not found` });
        case 'ok':
        {
            const {
              user,
            } = resp;

            if (! user) {
              return res.status(400).json({
                message: `Could not find user with id ${userId}`
              });
            } else {
              delete patchData.authUser;
              const patchUserRes = await patchUser(user, patchData);

              if (patchUserRes.type === 'error') {
                return res.status(400).json({ message: patchUserRes.message });
              } else {
                return res.status(201).json(patchUserRes.data);
              }
            }
        }
        default:
          throw new Error(`Unhandled case: ${resp}`);
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

// === GET /users/:userId:/shared_whiteboards ==================================
//
// Get summaries (attribute views) of all whiteboards shared with a given user.
// If passed "me" as the userId, fetches for the authenticated user.
// By default, spans all permissions.
//
// TODO: implement queries to filter by permission type.
//
// =============================================================================
router.get('/:userId/shared_whiteboards', async (
  req: Request<{ userId: Types.ObjectId | 'me' }, any, AuthorizedRequestBody>,
  res: Response,
) => {
  const {
    userId,
  } = req.params;
  const { authUser } = req.body;
  const { id: authUserId } = authUser;

  const targetUserId = (userId === 'me') ?
    authUserId
    : userId;
    
  const includeOpts: SetInclusionOptionType<string> = ({
    type: 'all',
  });

  const resp = await getSharedWhiteboardsByUser(targetUserId, includeOpts);

  switch (resp.status) {
      case 'server_error':
        return res.status(500).json({ message: 'Unexpected server error' });
      case 'user_not_found':
        // This _shouldn't_ happen in our case, since we've already passed the
        // authentication middleware by this point. Nevertheless, the controller
        // still accounts for the possibility.
        return res.status(403).json({ message: 'Invalid user' });
      case 'bad_request':
        return res.status(400).json({ message: resp.message });
      case 'ok':
        return res.status(200).json(resp.whiteboards);
      default:
        // Shouldn't get here. If we get here, there is a case we haven't
        // accounted for.
        throw new Error(`Unexpected case: ${resp}`);
  }// end switch (resp.status)
});

export default router;
