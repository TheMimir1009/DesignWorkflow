/**
 * Express Server Entry Point
 * Main server configuration with middleware and route setup
 */
import express, { type Express } from 'express';
import cors from 'cors';
import { projectsRouter } from './routes/projects.ts';
import { tasksRouter, getProjectTasks, createProjectTask } from './routes/tasks.ts';
import { systemsRouter, getProjectSystems, createProjectSystem } from './routes/systems.ts';
import { qaRouter, saveTaskQA, getTaskQA, generateDesign } from './routes/qa.ts';

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
  app.post('/api/projects/:projectId/tasks', createProjectTask);

  // System routes
  app.use('/api/systems', systemsRouter);
  app.get('/api/projects/:projectId/systems', getProjectSystems);
  app.post('/api/projects/:projectId/systems', createProjectSystem);

  // Q&A routes
  app.use('/api/questions', qaRouter);
  app.post('/api/tasks/:taskId/qa', saveTaskQA);
  app.get('/api/tasks/:taskId/qa', getTaskQA);
  app.post('/api/tasks/:taskId/generate-design', generateDesign);

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
