import {
  Router,
} from "express";

// --- local imports
import {
  authenticateJWT
} from '../middleware/auth';

import {
  handleGetOwnWhiteboard,
  handleGetWhiteboardById,
  handleCreateWhiteboard,
  handleShareWhiteboard,
} from "../controllers/whiteboards";

const router = Router();

// --- all routes authenticated
router.use(authenticateJWT);

router.post("/", handleCreateWhiteboard);

// -- Get user's own whiteboards
router.get("/own", handleGetOwnWhiteboard);

// -- Get whiteboard by id
router.get('/:whiteboardId', handleGetWhiteboardById);

// --- Share whiteboard with other users
router.post("/:id/shared_users", handleShareWhiteboard);

export default router;

