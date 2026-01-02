/**
 * Project Service Tests
 * TDD test suite for Frontend API communication layer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  API_BASE_URL,
} from '../../src/services/projectService';
import type { Project, CreateProjectDto, UpdateProjectDto, ApiResponse } from '../../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test data factories
const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-project-id',
  name: 'Test Project',
  description: 'Test description',
  techStack: ['Unity', 'C#'],
  categories: ['RPG'],
  defaultReferences: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const createApiResponse = <T>(data: T, success = true, error: string | null = null): ApiResponse<T> => ({
  success,
  data,
  error,
});

describe('projectService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('API_BASE_URL', () => {
    it('should be defined as http://localhost:3001', () => {
      expect(API_BASE_URL).toBe('http://localhost:3001');
    });
  });

  describe('getProjects', () => {
    it('should fetch all projects successfully', async () => {
      const mockProjects = [
        createMockProject({ id: 'project-1', name: 'Project 1' }),
        createMockProject({ id: 'project-2', name: 'Project 2' }),
      ];
      const mockResponse = createApiResponse(mockProjects);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getProjects();

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/projects`);
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array when no projects exist', async () => {
      const mockResponse = createApiResponse<Project[]>([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getProjects();

      expect(result).toEqual([]);
    });

    it('should throw error when API returns unsuccessful response', async () => {
      const mockResponse = createApiResponse<Project[] | null>(null, false, 'Server error');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getProjects()).rejects.toThrow('Server error');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getProjects()).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getProjects()).rejects.toThrow();
    });
  });

  describe('getProject', () => {
    it('should fetch a single project by id', async () => {
      const mockProject = createMockProject();
      const mockResponse = createApiResponse(mockProject);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getProject('test-project-id');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/projects/test-project-id`);
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      const mockResponse = createApiResponse<Project | null>(null, false, 'Project not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getProject('non-existent-id')).rejects.toThrow('Project not found');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getProject('test-id')).rejects.toThrow('Network error');
    });
  });

  describe('createProject', () => {
    it('should create a new project with all fields', async () => {
      const createDto: CreateProjectDto = {
        name: 'New Project',
        description: 'A new project',
        techStack: ['React', 'TypeScript'],
        categories: ['Action'],
        defaultReferences: ['ref-1'],
      };
      const mockCreatedProject = createMockProject({
        id: 'new-project-id',
        ...createDto,
      });
      const mockResponse = createApiResponse(mockCreatedProject);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createProject(createDto);

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createDto),
      });
      expect(result).toEqual(mockCreatedProject);
    });

    it('should create a project with only required name field', async () => {
      const createDto: CreateProjectDto = {
        name: 'Minimal Project',
      };
      const mockCreatedProject = createMockProject({
        id: 'minimal-id',
        name: 'Minimal Project',
        description: '',
        techStack: [],
        categories: [],
        defaultReferences: [],
      });
      const mockResponse = createApiResponse(mockCreatedProject);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createProject(createDto);

      expect(result.name).toBe('Minimal Project');
    });

    it('should throw error when name is invalid', async () => {
      const mockResponse = createApiResponse<Project | null>(null, false, 'Invalid name');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(createProject({ name: '' })).rejects.toThrow('Invalid name');
    });

    it('should throw error when duplicate name exists', async () => {
      const mockResponse = createApiResponse<Project | null>(null, false, 'Project name duplicate');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(createProject({ name: 'Existing Project' })).rejects.toThrow('duplicate');
    });
  });

  describe('updateProject', () => {
    it('should update project with provided fields', async () => {
      const updateDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated description',
      };
      const mockUpdatedProject = createMockProject({
        name: 'Updated Name',
        description: 'Updated description',
        updatedAt: '2025-01-02T00:00:00.000Z',
      });
      const mockResponse = createApiResponse(mockUpdatedProject);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateProject('test-project-id', updateDto);

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/projects/test-project-id`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDto),
      });
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated description');
    });

    it('should update only specified fields', async () => {
      const updateDto: UpdateProjectDto = {
        techStack: ['Unreal Engine'],
      };
      const mockUpdatedProject = createMockProject({
        techStack: ['Unreal Engine'],
      });
      const mockResponse = createApiResponse(mockUpdatedProject);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateProject('test-project-id', updateDto);

      expect(result.techStack).toEqual(['Unreal Engine']);
    });

    it('should throw error when project not found', async () => {
      const mockResponse = createApiResponse<Project | null>(null, false, 'Project not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(updateProject('non-existent-id', { name: 'New Name' })).rejects.toThrow('not found');
    });

    it('should throw error when updating to duplicate name', async () => {
      const mockResponse = createApiResponse<Project | null>(null, false, 'Project name duplicate');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(updateProject('test-id', { name: 'Existing Name' })).rejects.toThrow('duplicate');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      const mockResponse = createApiResponse({ deleted: true });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(deleteProject('test-project-id')).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/projects/test-project-id`, {
        method: 'DELETE',
      });
    });

    it('should throw error when project not found', async () => {
      const mockResponse = createApiResponse<null>(null, false, 'Project not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(deleteProject('non-existent-id')).rejects.toThrow('not found');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteProject('test-id')).rejects.toThrow('Network error');
    });
  });
});
