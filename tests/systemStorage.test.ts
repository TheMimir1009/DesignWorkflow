/**
 * System Storage Utilities Tests
 * TDD test suite for system document file storage operations
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {
  getAllSystemDocuments,
  getSystemDocumentById,
  saveSystemDocument,
  deleteSystemDocument,
  getCategories,
  getTags,
  isSystemNameDuplicate,
  ensureSystemsDirectoryExists,
} from '../server/utils/systemStorage.ts';
import type { SystemDocument } from '../src/types/index.ts';

// Test workspace path
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');
const TEST_PROJECT_ID = 'test-project-for-systems';

describe('System Storage Utilities', () => {
  beforeAll(async () => {
    // Create test project directory structure
    const projectDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID);
    const systemsDir = path.join(projectDir, 'systems');
    await fs.mkdir(systemsDir, { recursive: true });
    await fs.writeFile(path.join(systemsDir, 'systems.json'), '[]', 'utf-8');
  });

  afterAll(async () => {
    // Clean up test project directory
    const projectDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID);
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    // Reset systems.json to empty array before each test
    const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
    await fs.writeFile(path.join(systemsDir, 'systems.json'), '[]', 'utf-8');

    // Remove all .md files in systems directory
    const entries = await fs.readdir(systemsDir);
    for (const entry of entries) {
      if (entry.endsWith('.md')) {
        await fs.unlink(path.join(systemsDir, entry));
      }
    }
  });

  describe('ensureSystemsDirectoryExists', () => {
    it('should create systems directory if it does not exist', async () => {
      const newProjectId = 'new-project-for-systems-test';
      const projectDir = path.join(WORKSPACE_PATH, newProjectId);
      const systemsDir = path.join(projectDir, 'systems');

      // Create project directory without systems
      await fs.mkdir(projectDir, { recursive: true });

      await ensureSystemsDirectoryExists(newProjectId);

      const dirExists = await fs.access(systemsDir).then(() => true).catch(() => false);
      expect(dirExists).toBe(true);

      // Clean up
      await fs.rm(projectDir, { recursive: true, force: true });
    });

    it('should not fail if systems directory already exists', async () => {
      await expect(ensureSystemsDirectoryExists(TEST_PROJECT_ID)).resolves.not.toThrow();
    });
  });

  describe('getAllSystemDocuments', () => {
    it('should return empty array when no documents exist', async () => {
      const documents = await getAllSystemDocuments(TEST_PROJECT_ID);
      expect(documents).toEqual([]);
    });

    it('should return all system documents with content from .md files', async () => {
      // Create test documents
      const testDoc: Omit<SystemDocument, 'content'> = {
        id: 'doc-1',
        projectId: TEST_PROJECT_ID,
        name: 'Character System',
        category: 'System',
        tags: ['core', 'player'],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      await fs.writeFile(
        path.join(systemsDir, 'systems.json'),
        JSON.stringify([testDoc]),
        'utf-8'
      );
      await fs.writeFile(
        path.join(systemsDir, 'doc-1.md'),
        '# Character System\n\nThis is the character system.',
        'utf-8'
      );

      const documents = await getAllSystemDocuments(TEST_PROJECT_ID);

      expect(documents).toHaveLength(1);
      expect(documents[0].id).toBe('doc-1');
      expect(documents[0].name).toBe('Character System');
      expect(documents[0].content).toBe('# Character System\n\nThis is the character system.');
    });

    it('should return document with empty content if .md file does not exist', async () => {
      const testDoc: Omit<SystemDocument, 'content'> = {
        id: 'doc-no-md',
        projectId: TEST_PROJECT_ID,
        name: 'Missing Content Doc',
        category: 'System',
        tags: [],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      await fs.writeFile(
        path.join(systemsDir, 'systems.json'),
        JSON.stringify([testDoc]),
        'utf-8'
      );

      const documents = await getAllSystemDocuments(TEST_PROJECT_ID);

      expect(documents).toHaveLength(1);
      expect(documents[0].content).toBe('');
    });
  });

  describe('getSystemDocumentById', () => {
    it('should return null when document does not exist', async () => {
      const document = await getSystemDocumentById(TEST_PROJECT_ID, 'non-existent-id');
      expect(document).toBeNull();
    });

    it('should return document with content by id', async () => {
      const testDoc: Omit<SystemDocument, 'content'> = {
        id: 'doc-by-id',
        projectId: TEST_PROJECT_ID,
        name: 'Combat System',
        category: 'System',
        tags: ['combat', 'battle'],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      await fs.writeFile(
        path.join(systemsDir, 'systems.json'),
        JSON.stringify([testDoc]),
        'utf-8'
      );
      await fs.writeFile(
        path.join(systemsDir, 'doc-by-id.md'),
        '# Combat System\n\nBattle mechanics here.',
        'utf-8'
      );

      const document = await getSystemDocumentById(TEST_PROJECT_ID, 'doc-by-id');

      expect(document).not.toBeNull();
      expect(document!.id).toBe('doc-by-id');
      expect(document!.name).toBe('Combat System');
      expect(document!.content).toBe('# Combat System\n\nBattle mechanics here.');
    });
  });

  describe('saveSystemDocument', () => {
    it('should save new document to systems.json and create .md file', async () => {
      const newDoc: SystemDocument = {
        id: 'new-doc-1',
        projectId: TEST_PROJECT_ID,
        name: 'Economy System',
        category: 'Economy',
        tags: ['economy', 'balance'],
        content: '# Economy System\n\nIn-game economy details.',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveSystemDocument(TEST_PROJECT_ID, newDoc);

      // Verify systems.json
      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      const systemsJson = await fs.readFile(path.join(systemsDir, 'systems.json'), 'utf-8');
      const savedDocs = JSON.parse(systemsJson) as Omit<SystemDocument, 'content'>[];

      expect(savedDocs).toHaveLength(1);
      expect(savedDocs[0].id).toBe('new-doc-1');
      expect(savedDocs[0].name).toBe('Economy System');
      // Content should not be in systems.json
      expect((savedDocs[0] as Record<string, unknown>).content).toBeUndefined();

      // Verify .md file
      const mdContent = await fs.readFile(path.join(systemsDir, 'new-doc-1.md'), 'utf-8');
      expect(mdContent).toBe('# Economy System\n\nIn-game economy details.');
    });

    it('should update existing document in systems.json and .md file', async () => {
      // First save
      const doc: SystemDocument = {
        id: 'update-doc',
        projectId: TEST_PROJECT_ID,
        name: 'Original Name',
        category: 'System',
        tags: ['original'],
        content: '# Original Content',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveSystemDocument(TEST_PROJECT_ID, doc);

      // Update
      const updatedDoc: SystemDocument = {
        ...doc,
        name: 'Updated Name',
        tags: ['updated', 'modified'],
        content: '# Updated Content',
        updatedAt: new Date().toISOString(),
      };

      await saveSystemDocument(TEST_PROJECT_ID, updatedDoc);

      // Verify
      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      const systemsJson = await fs.readFile(path.join(systemsDir, 'systems.json'), 'utf-8');
      const savedDocs = JSON.parse(systemsJson) as Omit<SystemDocument, 'content'>[];

      expect(savedDocs).toHaveLength(1);
      expect(savedDocs[0].name).toBe('Updated Name');
      expect(savedDocs[0].tags).toEqual(['updated', 'modified']);

      const mdContent = await fs.readFile(path.join(systemsDir, 'update-doc.md'), 'utf-8');
      expect(mdContent).toBe('# Updated Content');
    });
  });

  describe('deleteSystemDocument', () => {
    it('should remove document from systems.json and delete .md file', async () => {
      // Create document first
      const doc: SystemDocument = {
        id: 'doc-to-delete',
        projectId: TEST_PROJECT_ID,
        name: 'Document To Delete',
        category: 'System',
        tags: [],
        content: '# To Delete',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveSystemDocument(TEST_PROJECT_ID, doc);

      // Verify it exists
      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      let systemsJson = await fs.readFile(path.join(systemsDir, 'systems.json'), 'utf-8');
      expect(JSON.parse(systemsJson)).toHaveLength(1);

      // Delete
      await deleteSystemDocument(TEST_PROJECT_ID, 'doc-to-delete');

      // Verify systems.json
      systemsJson = await fs.readFile(path.join(systemsDir, 'systems.json'), 'utf-8');
      expect(JSON.parse(systemsJson)).toHaveLength(0);

      // Verify .md file is deleted
      const mdExists = await fs.access(path.join(systemsDir, 'doc-to-delete.md'))
        .then(() => true)
        .catch(() => false);
      expect(mdExists).toBe(false);
    });

    it('should not fail when deleting non-existent document', async () => {
      await expect(
        deleteSystemDocument(TEST_PROJECT_ID, 'non-existent')
      ).resolves.not.toThrow();
    });
  });

  describe('getCategories', () => {
    it('should return empty array when no documents exist', async () => {
      const categories = await getCategories(TEST_PROJECT_ID);
      expect(categories).toEqual([]);
    });

    it('should return unique categories sorted alphabetically', async () => {
      const docs: Omit<SystemDocument, 'content'>[] = [
        { id: '1', projectId: TEST_PROJECT_ID, name: 'Doc 1', category: 'System', tags: [], dependencies: [], createdAt: '', updatedAt: '' },
        { id: '2', projectId: TEST_PROJECT_ID, name: 'Doc 2', category: 'Economy', tags: [], dependencies: [], createdAt: '', updatedAt: '' },
        { id: '3', projectId: TEST_PROJECT_ID, name: 'Doc 3', category: 'System', tags: [], dependencies: [], createdAt: '', updatedAt: '' },
        { id: '4', projectId: TEST_PROJECT_ID, name: 'Doc 4', category: 'UI', tags: [], dependencies: [], createdAt: '', updatedAt: '' },
      ];

      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      await fs.writeFile(
        path.join(systemsDir, 'systems.json'),
        JSON.stringify(docs),
        'utf-8'
      );

      const categories = await getCategories(TEST_PROJECT_ID);

      expect(categories).toEqual(['Economy', 'System', 'UI']);
    });
  });

  describe('getTags', () => {
    it('should return empty array when no documents exist', async () => {
      const tags = await getTags(TEST_PROJECT_ID);
      expect(tags).toEqual([]);
    });

    it('should return unique tags sorted alphabetically', async () => {
      const docs: Omit<SystemDocument, 'content'>[] = [
        { id: '1', projectId: TEST_PROJECT_ID, name: 'Doc 1', category: 'System', tags: ['core', 'player'], dependencies: [], createdAt: '', updatedAt: '' },
        { id: '2', projectId: TEST_PROJECT_ID, name: 'Doc 2', category: 'Economy', tags: ['economy', 'core'], dependencies: [], createdAt: '', updatedAt: '' },
        { id: '3', projectId: TEST_PROJECT_ID, name: 'Doc 3', category: 'UI', tags: ['ui', 'menu'], dependencies: [], createdAt: '', updatedAt: '' },
      ];

      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      await fs.writeFile(
        path.join(systemsDir, 'systems.json'),
        JSON.stringify(docs),
        'utf-8'
      );

      const tags = await getTags(TEST_PROJECT_ID);

      expect(tags).toEqual(['core', 'economy', 'menu', 'player', 'ui']);
    });
  });

  describe('isSystemNameDuplicate', () => {
    it('should return false when no documents exist', async () => {
      const isDuplicate = await isSystemNameDuplicate(TEST_PROJECT_ID, 'New Document');
      expect(isDuplicate).toBe(false);
    });

    it('should return true when document with same name exists', async () => {
      const doc: Omit<SystemDocument, 'content'> = {
        id: 'existing-doc',
        projectId: TEST_PROJECT_ID,
        name: 'Existing Document',
        category: 'System',
        tags: [],
        dependencies: [],
        createdAt: '',
        updatedAt: '',
      };

      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      await fs.writeFile(
        path.join(systemsDir, 'systems.json'),
        JSON.stringify([doc]),
        'utf-8'
      );

      const isDuplicate = await isSystemNameDuplicate(TEST_PROJECT_ID, 'Existing Document');
      expect(isDuplicate).toBe(true);
    });

    it('should exclude specified document id when checking duplicates', async () => {
      const doc: Omit<SystemDocument, 'content'> = {
        id: 'self-doc',
        projectId: TEST_PROJECT_ID,
        name: 'Self Document',
        category: 'System',
        tags: [],
        dependencies: [],
        createdAt: '',
        updatedAt: '',
      };

      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      await fs.writeFile(
        path.join(systemsDir, 'systems.json'),
        JSON.stringify([doc]),
        'utf-8'
      );

      // Should return false when checking its own name (for updates)
      const isDuplicate = await isSystemNameDuplicate(TEST_PROJECT_ID, 'Self Document', 'self-doc');
      expect(isDuplicate).toBe(false);
    });
  });

  // TODO: Implement searchSystemDocuments function in systemStorage.ts
  describe.skip('searchSystemDocuments', () => {
    beforeEach(async () => {
      const docs: Omit<SystemDocument, 'content'>[] = [
        { id: '1', projectId: TEST_PROJECT_ID, name: 'Character System', category: 'System', tags: ['core', 'player'], dependencies: [], createdAt: '', updatedAt: '' },
        { id: '2', projectId: TEST_PROJECT_ID, name: 'Combat System', category: 'System', tags: ['core', 'battle'], dependencies: [], createdAt: '', updatedAt: '' },
        { id: '3', projectId: TEST_PROJECT_ID, name: 'Economy Rules', category: 'Economy', tags: ['economy', 'balance'], dependencies: [], createdAt: '', updatedAt: '' },
      ];

      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      await fs.writeFile(
        path.join(systemsDir, 'systems.json'),
        JSON.stringify(docs),
        'utf-8'
      );

      // Create .md files
      await fs.writeFile(path.join(systemsDir, '1.md'), '# Character System\n\nPlayer character details.', 'utf-8');
      await fs.writeFile(path.join(systemsDir, '2.md'), '# Combat System\n\nBattle mechanics.', 'utf-8');
      await fs.writeFile(path.join(systemsDir, '3.md'), '# Economy Rules\n\nIn-game currency.', 'utf-8');
    });

    it('should return all documents when query is empty', async () => {
      const results = await searchSystemDocuments(TEST_PROJECT_ID, '');
      expect(results).toHaveLength(3);
    });

    it('should search by document name (case insensitive)', async () => {
      const results = await searchSystemDocuments(TEST_PROJECT_ID, 'character');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Character System');
    });

    it('should search by tags', async () => {
      const results = await searchSystemDocuments(TEST_PROJECT_ID, 'core');
      expect(results).toHaveLength(2);
      expect(results.map(r => r.name).sort()).toEqual(['Character System', 'Combat System']);
    });

    it('should search by category', async () => {
      const results = await searchSystemDocuments(TEST_PROJECT_ID, 'economy');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Economy Rules');
    });
  });
});
