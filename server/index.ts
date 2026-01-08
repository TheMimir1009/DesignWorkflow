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
import { authRouter } from './routes/auth.ts';
import { usersRouter } from './routes/users.ts';
import { projectAccessRouter } from './routes/projectAccess.ts';
import { generateRouter } from './routes/generate.ts';
import { qaSessionsRouter } from './routes/qa-sessions.ts';
import { templatesRouter } from './routes/templates.ts';
import { questionsRouter } from './routes/questions.ts';
import {
  archivesRouter,
  getProjectArchives,
  getProjectArchive,
  archiveTask,
  restoreArchivedTask,
  deleteProjectArchive,
} from './routes/archives.ts';

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
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/tasks', tasksRouter);

  // Project-scoped task routes
  app.get('/api/projects/:projectId/tasks', getProjectTasks);
  app.post('/api/projects/:projectId/tasks', createProjectTask);

  // Archive routes
  app.get('/api/projects/:projectId/archives', getProjectArchives);
  app.get('/api/projects/:projectId/archives/:archiveId', getProjectArchive);
  app.post('/api/projects/:projectId/tasks/:taskId/archive', archiveTask);
  app.post('/api/projects/:projectId/archives/:archiveId/restore', restoreArchivedTask);
  app.delete('/api/projects/:projectId/archives/:archiveId', deleteProjectArchive);

  // Project access routes
  app.use('/api/projects/:projectId/access', projectAccessRouter);

  // System routes
  app.use('/api/systems', systemsRouter);
  app.get('/api/projects/:projectId/systems', getProjectSystems);
  app.post('/api/projects/:projectId/systems', createProjectSystem);

  // Q&A routes
  app.use('/api/questions', qaRouter);
  app.post('/api/tasks/:taskId/qa', saveTaskQA);
  app.get('/api/tasks/:taskId/qa', getTaskQA);
  app.post('/api/tasks/:taskId/generate-design', generateDesign);

  // AI Generation routes (Claude Code Integration)
  app.use('/api/generate', generateRouter);

  // QA Sessions routes
  app.use('/api/qa-sessions', qaSessionsRouter);

  // Templates routes
  app.use('/api/templates', templatesRouter);

  // Question Library routes (separate from Q&A questions)
  app.use('/api/question-library', questionsRouter);

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
