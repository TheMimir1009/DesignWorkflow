/**
 * Test Suite: discovery.ts API routes
 * TDD implementation for system discovery endpoints
 *
 * Requirements covered:
 * - TASK-002: POST /api/projects/:projectId/discover endpoint
 * - TASK-002: Input validation (projectId, featureText)
 * - TASK-002: keywordExtractor + systemMatcher integration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { SystemDocument } from '../../../src/types/index.ts';

// Mock modules before import
vi.mock('../../utils/keywordExtractor.ts', () => ({
  extractKeywords: vi.fn(),
}));

vi.mock('../../utils/systemMatcher.ts', () => ({
  matchSystemsByKeywords: vi.fn(),
}));

vi.mock('../../utils/projectStorage.ts', () => ({
  getProjectById: vi.fn(),
}));

vi.mock('../../utils/systemStorage.ts', () => ({
  getSystemsByProject: vi.fn(),
}));

// Import after mocking
import { discoverProjectSystems } from '../discovery.ts';
import { extractKeywords } from '../../utils/keywordExtractor.ts';
import { matchSystemsByKeywords } from '../../utils/systemMatcher.ts';
import { getProjectById } from '../../utils/projectStorage.ts';
import { getSystemsByProject } from '../../utils/systemStorage.ts';

// Type cast mocks
const mockExtractKeywords = vi.mocked(extractKeywords);
const mockMatchSystemsByKeywords = vi.mocked(matchSystemsByKeywords);
const mockGetProjectById = vi.mocked(getProjectById);
const mockGetSystemsByProject = vi.mocked(getSystemsByProject);

/**
 * Create test Express app with discovery router
 */
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.post('/api/projects/:projectId/discover', discoverProjectSystems);
  return app;
}

/**
 * Helper function to create mock project
 */
function createMockProject(overrides = {}) {
  return {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test description',
    techStack: [],
    categories: [],
    defaultReferences: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Helper function to create mock system
 */
function createMockSystem(overrides: Partial<SystemDocument> = {}): SystemDocument {
  return {
    id: 'system-1',
    projectId: 'project-1',
    name: 'Test System',
    category: 'core',
    tags: ['tag1', 'tag2'],
    content: 'Test content',
    dependencies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Generate feature text with minimum 100 characters
 */
function generateValidFeatureText(): string {
  return 'This is a comprehensive feature description for the character growth system. It includes level progression, experience points, and various character attributes that need to be implemented.';
}

describe('discovery API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/projects/:projectId/discover', () => {
    // Test 7: Normal request returns recommendations
    it('should return recommendations for valid request', async () => {
      const featureText = generateValidFeatureText();

      mockGetProjectById.mockResolvedValue(createMockProject());
      mockGetSystemsByProject.mockResolvedValue([
        createMockSystem({ id: 'sys-1', name: 'Character System', tags: ['character', 'growth'] }),
        createMockSystem({ id: 'sys-2', name: 'Level System', tags: ['level', 'progression'] }),
      ]);
      mockExtractKeywords.mockReturnValue([
        { keyword: 'character', weight: 100 },
        { keyword: 'growth', weight: 80 },
        { keyword: 'level', weight: 60 },
      ]);
      mockMatchSystemsByKeywords.mockReturnValue([
        { systemId: 'sys-1', systemName: 'Character System', relevanceScore: 100, matchedTags: ['character', 'growth'] },
        { systemId: 'sys-2', systemName: 'Level System', relevanceScore: 50, matchedTags: ['level'] },
      ]);

      const response = await request(app)
        .post('/api/projects/project-1/discover')
        .send({ featureText });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.isAIGenerated).toBe(false);
      expect(response.body.data.analyzedKeywords).toEqual(['character', 'growth', 'level']);
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
      expect(response.body.data.recommendations.length).toBe(2);
    });

    // Test 8: Missing featureText returns 400
    it('should return 400 when featureText is missing', async () => {
      mockGetProjectById.mockResolvedValue(createMockProject());

      const response = await request(app)
        .post('/api/projects/project-1/discover')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('featureText');
    });

    // Test 9: featureText less than 100 characters returns 400
    it('should return 400 when featureText is less than 100 characters', async () => {
      mockGetProjectById.mockResolvedValue(createMockProject());

      const response = await request(app)
        .post('/api/projects/project-1/discover')
        .send({ featureText: 'Too short' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('100');
    });

    // Test 10: Invalid projectId returns 404
    it('should return 404 when project does not exist', async () => {
      mockGetProjectById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/projects/invalid-project/discover')
        .send({ featureText: generateValidFeatureText() });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Project');
    });

    // Test 11: Internal error returns 500 with fallback
    it('should return 500 with error message on internal error', async () => {
      mockGetProjectById.mockResolvedValue(createMockProject());
      mockGetSystemsByProject.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/projects/project-1/discover')
        .send({ featureText: generateValidFeatureText() });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    // Test 12: Response format validation
    it('should return correct response format', async () => {
      const featureText = generateValidFeatureText();

      mockGetProjectById.mockResolvedValue(createMockProject());
      mockGetSystemsByProject.mockResolvedValue([
        createMockSystem({ id: 'sys-1', name: 'Test System', tags: ['test'] }),
      ]);
      mockExtractKeywords.mockReturnValue([{ keyword: 'test', weight: 100 }]);
      mockMatchSystemsByKeywords.mockReturnValue([
        { systemId: 'sys-1', systemName: 'Test System', relevanceScore: 100, matchedTags: ['test'] },
      ]);

      const response = await request(app)
        .post('/api/projects/project-1/discover')
        .send({ featureText });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('error');
      expect(response.body.data).toHaveProperty('isAIGenerated');
      expect(response.body.data).toHaveProperty('analyzedKeywords');
    });

    // Test: Empty systems returns empty recommendations
    it('should return empty recommendations when no systems exist', async () => {
      const featureText = generateValidFeatureText();

      mockGetProjectById.mockResolvedValue(createMockProject());
      mockGetSystemsByProject.mockResolvedValue([]);
      mockExtractKeywords.mockReturnValue([{ keyword: 'test', weight: 100 }]);
      mockMatchSystemsByKeywords.mockReturnValue([]);

      const response = await request(app)
        .post('/api/projects/project-1/discover')
        .send({ featureText });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toEqual([]);
    });

    // Test: keywordExtractor returns empty keywords
    it('should return empty recommendations when no keywords extracted', async () => {
      const featureText = generateValidFeatureText();

      mockGetProjectById.mockResolvedValue(createMockProject());
      mockGetSystemsByProject.mockResolvedValue([
        createMockSystem({ id: 'sys-1', tags: ['tag1'] }),
      ]);
      mockExtractKeywords.mockReturnValue([]);
      mockMatchSystemsByKeywords.mockReturnValue([]);

      const response = await request(app)
        .post('/api/projects/project-1/discover')
        .send({ featureText });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
