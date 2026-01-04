/**
 * Express Server Entry Point
 * Main server configuration with middleware and route setup
 */
import express, { type Express } from 'express';
import cors from 'cors';
import { projectsRouter } from './routes/projects.ts';
import { systemsRouter } from './routes/systems.ts';
import { tasksRouter, getProjectTasks, createProjectTask } from './routes/tasks.ts';
import { templatesRouter } from './routes/templates.ts';
import { questionsRouter } from './routes/questions.ts';
import { qaSessionsRouter } from './routes/qa-sessions.ts';

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
  app.use('/api/projects/:projectId/systems', systemsRouter);
  app.use('/api/tasks', tasksRouter);

  // Project-scoped routes
  app.get('/api/projects/:projectId/tasks', getProjectTasks);
  app.post('/api/projects/:projectId/tasks', createProjectTask);

  // Templates routes
  app.use('/api/templates', templatesRouter);

  // QA routes
  app.use('/api/questions', questionsRouter);
  app.use('/api/qa-sessions', qaSessionsRouter);

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
