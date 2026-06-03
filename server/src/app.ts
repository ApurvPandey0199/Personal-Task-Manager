import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import tasksRouter from './routes/tasks';
import { errorHandler } from './middleware/error';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/tasks', tasksRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Merged static React frontend serving configuration
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  console.log(`[Production] Merged execution active. Serving static frontend assets from: ${CLIENT_DIST}`);
  app.use(express.static(CLIENT_DIST));
  
  // Catch-all route to serve the built index.html for SPA client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
} else {
  console.log(`[Development] Serving backend API only. Client assets not found at: ${CLIENT_DIST}`);
  
  // Centralized 404 handler sending error to global error handler in dev mode
  app.use((req, res, next) => {
    const error: any = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    error.status = 404;
    error.error = 'Not Found';
    next(error);
  });
}

// Global Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
