import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

// === Routers =================================================================
//
// =============================================================================
import healthRouter from './routes/health';
import usersRouter from './routes/users';
import authRouter from './routes/auth';

// All services should serve on port 3000.
// Reverse proxy will handle routing appropriate requests to this service.
const PORT = 3000;
const API_VERSION = 'v1';

// Configure MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (! MONGO_URI) {
  console.error('ERROR: environment variable MONGO_URI not set');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

// Mount routers
app.use(`/api/${API_VERSION}/health`, healthRouter);
app.use(`/api/${API_VERSION}/users`, usersRouter);
app.use(`/api/${API_VERSION}/auth`, authRouter);

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
