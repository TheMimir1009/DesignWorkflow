/**
 * Express Server Entry Point
 * Main server configuration with middleware and route setup
 */
import express, { type Express } from 'express';
import cors from 'cors';
import { projectsRouter } from './routes/projects.ts';
import { tasksRouter, getProjectTasks } from './routes/tasks.ts';

/**
 * Create and configure Express application
 * Exported for testing purposes
 */
export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/projects', projectsRouter);
  app.use('/api/tasks', tasksRouter);

  // Project-scoped task routes
  app.get('/api/projects/:projectId/tasks', getProjectTasks);

  return app;
}

// Only start server when run directly (not imported for tests)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const PORT = process.env.PORT || 3001;
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
