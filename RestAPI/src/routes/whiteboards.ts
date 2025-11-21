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
  handlePutThumbnail,
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

// -- Put thumbnail screenshot to database
router.put("/:id/thumbnail", handlePutThumbnail);

export default router;

