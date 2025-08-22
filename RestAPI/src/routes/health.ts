import { Router, Request, Response } from 'express';

const router = Router();

// === Health Check ============================================================
//
// Basic check to ensure service is running.
//
// =============================================================================
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: "service healthy"
  });
});

export default router;
