import {
  Router,
} from "express";

// --- local imports
import {
  authenticateJWT
} from '../middleware/auth';

import {
  handleGetOwnWhiteboards,
  handleGetWhiteboardById,
  handleCreateWhiteboard,
  handleShareWhiteboard,
} from "../controllers/whiteboards";

const router = Router();

// -- all routes authenticated
router.use(authenticateJWT);

router.post("/", handleCreateWhiteboard);

// -- Get user's own whiteboards
router.get("/own", handleGetOwnWhiteboards);

// -- Get whiteboard by id
router.get('/:whiteboardId', handleGetWhiteboardById);

// -- Share whiteboard with other users
router.post("/:id/user_permissions", handleShareWhiteboard);

// -- Post thumbnail screenshot to database
router.post("/:id/thumbnail", handlePostThumbnail);

// -- Get thumbnail screenshot
router.get("/:id/thumbnail", handleGetThumbnail);

export default router;

