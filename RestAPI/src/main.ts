import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();

app.use(cors());
app.use(express.json());

// All services should serve on port 3000.
// Reverse proxy will handle routing appropriate requests to this service.
const PORT = 3000;
const API_VERSION = 'v1';

// === Health Check ============================================================
//
// Basic check to ensure service is running.
//
// =============================================================================
app.get(`/api/${API_VERSION}/health`, (_req, res) => {
  res.status(200).json({
    message: "service healthy"
  });
});

app.listen(PORT, () => {
  console.log(`REST API server listening on port ${PORT} ...`);
});
