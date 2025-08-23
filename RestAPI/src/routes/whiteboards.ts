import { Router } from "express";

import {
  authenticateJWT
} from '../middleware/auth';

import {
  createWhiteboard
} from "../controllers/whiteboards";

const router = Router();

// --- all routes authenticated
router.use(authenticateJWT);

router.post("/", createWhiteboard);

export default router;
