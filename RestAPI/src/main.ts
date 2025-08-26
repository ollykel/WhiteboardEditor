import 'dotenv/config';
import mongoose from 'mongoose';

import app from './app';

// --- All services should internally serve on port 3000.
const PORT = 3000;

// Configure MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (! MONGO_URI) {
  console.error('ERROR: environment variable MONGO_URI not set');
  process.exit(1);
}

// Connect to database
mongoose.connect(MONGO_URI)
.then(() => {
  // Only start listening once the database connection has been established
  console.log('Connected to database successfully');

  // Start listening
  app.listen(PORT, () => {
    console.log(`REST API server listening on port ${PORT} ...`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
