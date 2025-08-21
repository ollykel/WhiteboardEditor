import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (! MONGO_URI) {
  console.error('ERROR: environment variable MONGO_URI not set');
  process.exit(1);
}

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

mongoose.connect(MONGO_URI)
.then(() => {
  // Only start listening once the database connection has been established
  console.log('Connected to database successfully');

  app.listen(PORT, () => {
    console.log(`REST API server listening on port ${PORT} ...`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
