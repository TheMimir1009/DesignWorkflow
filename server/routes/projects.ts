/**
 * Projects CRUD API Routes
 * Handles all project-related endpoints at /api/projects
 */
import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { Project } from '../../src/types/index.ts';
import type { CreateProjectDto, UpdateProjectDto } from '../types.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import { validateName, validateDescription } from '../utils/validation.ts';
import {
  getAllProjects,
  getProjectById,
  saveProject,
  isProjectNameDuplicate,
  createProjectDirectoryStructure,
  deleteProjectDirectory,
} from '../utils/projectStorage.ts';

export const projectsRouter = Router();

/**
 * POST /api/projects - Create a new project
 *
 * Request Body (CreateProjectDto):
 * - name: string (required, 1-100 chars)
 * - description: string (optional, 0-500 chars)
 * - techStack: string[] (optional)
 * - categories: string[] (optional)
 * - defaultReferences: string[] (optional)
 *
 * Response: ApiResponse<Project>
 * - 201: Project created successfully
 * - 400: Validation error or duplicate name
 * - 500: Server error
 */
projectsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as CreateProjectDto;

    // Validate name
    const nameValidation = validateName(body.name);
    if (!nameValidation.valid) {
      sendError(res, 400, nameValidation.error!);
      return;
    }

    // Validate description
    const descriptionValidation = validateDescription(body.description);
    if (!descriptionValidation.valid) {
      sendError(res, 400, descriptionValidation.error!);
      return;
    }

    // Check for duplicate name
    if (await isProjectNameDuplicate(body.name)) {
      sendError(res, 400, 'A project with this name already exists (duplicate)');
      return;
    }

    // Create project entity
    const now = new Date().toISOString();
    const project: Project = {
      id: uuidv4(),
      name: body.name.trim(),
      description: body.description?.trim() ?? '',
      techStack: body.techStack ?? [],
      categories: body.categories ?? [],
      defaultReferences: body.defaultReferences ?? [],
      createdAt: now,
      updatedAt: now,
    };

    // Create directory structure and save project
    await createProjectDirectoryStructure(project.id);
    await saveProject(project);

    sendSuccess(res, project, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    sendError(res, 500, 'Failed to create project');
  }
});

/**
 * GET /api/projects - Get all projects
 *
 * Response: ApiResponse<Project[]>
 * - 200: List of projects sorted by createdAt descending
 * - 500: Server error
 */
projectsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await getAllProjects();
    sendSuccess(res, projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    sendError(res, 500, 'Failed to get projects');
  }
});

/**
 * GET /api/projects/:id - Get a single project by ID
 *
 * Path Parameters:
 * - id: Project UUID
 *
 * Response: ApiResponse<Project>
 * - 200: Project found
 * - 404: Project not found
 * - 500: Server error
 */
projectsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);

    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    sendSuccess(res, project);
  } catch (error) {
    console.error('Error getting project:', error);
    sendError(res, 500, 'Failed to get project');
  }
});

/**
 * PUT /api/projects/:id - Update a project
 *
 * Path Parameters:
 * - id: Project UUID
 *
 * Request Body (UpdateProjectDto):
 * - name: string (optional, 1-100 chars)
 * - description: string (optional, 0-500 chars)
 * - techStack: string[] (optional)
 * - categories: string[] (optional)
 * - defaultReferences: string[] (optional)
 *
 * Response: ApiResponse<Project>
 * - 200: Project updated successfully
 * - 400: Validation error or duplicate name
 * - 404: Project not found
 * - 500: Server error
 */
projectsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateProjectDto;

    // Get existing project
    const existingProject = await getProjectById(id);
    if (!existingProject) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Validate name if provided
    if (body.name !== undefined) {
      const nameValidation = validateName(body.name);
      if (!nameValidation.valid) {
        sendError(res, 400, nameValidation.error!);
        return;
      }

      // Check for duplicate name (excluding current project)
      if (body.name !== existingProject.name && await isProjectNameDuplicate(body.name, id)) {
        sendError(res, 400, 'A project with this name already exists (duplicate)');
        return;
      }
    }

    // Validate description if provided
    if (body.description !== undefined) {
      const descriptionValidation = validateDescription(body.description);
      if (!descriptionValidation.valid) {
        sendError(res, 400, descriptionValidation.error!);
        return;
      }
    }

    // Update project with provided fields
    const updatedProject: Project = {
      ...existingProject,
      name: body.name !== undefined ? body.name.trim() : existingProject.name,
      description: body.description !== undefined ? body.description.trim() : existingProject.description,
      techStack: body.techStack ?? existingProject.techStack,
      categories: body.categories ?? existingProject.categories,
      defaultReferences: body.defaultReferences ?? existingProject.defaultReferences,
      updatedAt: new Date().toISOString(),
    };

    await saveProject(updatedProject);
    sendSuccess(res, updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    sendError(res, 500, 'Failed to update project');
  }
});

/**
 * DELETE /api/projects/:id - Delete a project
 *
 * Path Parameters:
 * - id: Project UUID
 *
 * Response: ApiResponse<{ deleted: boolean }>
 * - 200: Project deleted successfully
 * - 404: Project not found
 * - 500: Server error
 */
projectsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if project exists
    const existingProject = await getProjectById(id);
    if (!existingProject) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Delete project directory
    await deleteProjectDirectory(id);

    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    sendError(res, 500, 'Failed to delete project');
  }
});
