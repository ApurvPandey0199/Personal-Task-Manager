import dotenv from 'dotenv';
import app from './app';
import { initDB } from './db';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = () => {
  try {
    // 1. Initialize SQLite Database Tables & Seed data with better-sqlite3
    initDB();
    
    // 2. Start the Express listening socket
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 Task Manager API Server running on port ${PORT}`);
      console.log(`👉 Health Check: http://localhost:${PORT}/health`);
      console.log(`👉 Tasks Endpoint: http://localhost:${PORT}/api/tasks`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();
