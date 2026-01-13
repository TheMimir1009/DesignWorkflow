/**
 * OfflineStorage Utility Tests
 * TDD test suite for SPEC-DOCEDIT-001 Offline Draft Storage
 *
 * Test Coverage:
 * - Save draft to localStorage
 * - Retrieve draft from localStorage
 * - Clear draft from localStorage
 * - Sync when online
 * - Storage quota exceeded handling
 * - Data integrity validation
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { offlineStorage } from '../../src/utils/offlineStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
    // Store reference for test manipulation
    _store: store,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch API for sync functionality
global.fetch = vi.fn();

describe('OfflineStorage', () => {
  const mockTaskId = 'task-123';
  const mockContent = '# Test Document\n\nThis is a test content.';
  const storageKeyPrefix = 'draft_';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveDraft', () => {
    it('should save draft content to localStorage', () => {
      offlineStorage.saveDraft(mockTaskId, mockContent);

      const stored = localStorage.getItem(`${storageKeyPrefix}${mockTaskId}`);
      expect(stored).toBeTruthy();

      // Should be stored as JSON with metadata
      const parsed = JSON.parse(stored!);
      expect(parsed.content).toBe(mockContent);
      expect(parsed.taskId).toBe(mockTaskId);
      expect(parsed.lastModified).toBeGreaterThan(0);
    });

    it('should save draft with metadata', () => {
      const now = new Date();
      offlineStorage.saveDraft(mockTaskId, mockContent);

      const stored = localStorage.getItem(`${storageKeyPrefix}${mockTaskId}`);
      expect(stored).toBeTruthy();

      // Verify it's stored as JSON with metadata
      const parsed = JSON.parse(stored!);
      expect(parsed.content).toBe(mockContent);
      expect(parsed.lastModified).toBeGreaterThanOrEqual(now.getTime() - 1000);
      expect(parsed.taskId).toBe(mockTaskId);
    });

    it('should overwrite existing draft for same task', () => {
      const initialContent = 'Initial content';
      const updatedContent = 'Updated content';

      offlineStorage.saveDraft(mockTaskId, initialContent);
      offlineStorage.saveDraft(mockTaskId, updatedContent);

      const stored = localStorage.getItem(`${storageKeyPrefix}${mockTaskId}`);
      const parsed = JSON.parse(stored!);
      expect(parsed.content).toBe(updatedContent);
    });

    it('should handle empty content', () => {
      offlineStorage.saveDraft(mockTaskId, '');

      const stored = localStorage.getItem(`${storageKeyPrefix}${mockTaskId}`);
      expect(stored).toBeTruthy();
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Test with "quotes" and \'apostrophes\' and \n newlines \t tabs';

      offlineStorage.saveDraft(mockTaskId, specialContent);

      const stored = localStorage.getItem(`${storageKeyPrefix}${mockTaskId}`);
      const parsed = JSON.parse(stored!);
      expect(parsed.content).toBe(specialContent);
    });

    it('should throw error when localStorage is full', () => {
      // Mock localStorage.setItem to simulate quota exceeded
      const originalSetItem = localStorage.setItem;
      const mockError = new Error('QuotaExceededError');
      mockError.name = 'QuotaExceededError';
      localStorage.setItem = vi.fn(() => {
        throw mockError;
      });

      expect(() => {
        offlineStorage.saveDraft(mockTaskId, mockContent);
      }).toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('getDraft', () => {
    it('should retrieve draft content from localStorage', () => {
      offlineStorage.saveDraft(mockTaskId, mockContent);

      const retrieved = offlineStorage.getDraft(mockTaskId);
      expect(retrieved).toBe(mockContent);
    });

    it('should return null for non-existent draft', () => {
      const retrieved = offlineStorage.getDraft('non-existent-task');
      expect(retrieved).toBeNull();
    });

    it('should return null for empty taskId', () => {
      const retrieved = offlineStorage.getDraft('');
      expect(retrieved).toBeNull();
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem(`${storageKeyPrefix}${mockTaskId}`, 'invalid-json{[');

      const retrieved = offlineStorage.getDraft(mockTaskId);
      expect(retrieved).toBeNull();
    });

    it('should return latest draft when multiple versions exist', () => {
      const content1 = 'First version';
      const content2 = 'Second version';

      offlineStorage.saveDraft(mockTaskId, content1);
      // Add a small delay to ensure different timestamp
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Busy wait to ensure time passes
      }
      offlineStorage.saveDraft(mockTaskId, content2);

      const retrieved = offlineStorage.getDraft(mockTaskId);
      expect(retrieved).toBe(content2);
    });
  });

  describe('clearDraft', () => {
    it('should remove draft from localStorage', () => {
      offlineStorage.saveDraft(mockTaskId, mockContent);
      expect(localStorage.getItem(`${storageKeyPrefix}${mockTaskId}`)).toBeTruthy();

      offlineStorage.clearDraft(mockTaskId);
      expect(localStorage.getItem(`${storageKeyPrefix}${mockTaskId}`)).toBeNull();
    });

    it('should handle clearing non-existent draft', () => {
      expect(() => {
        offlineStorage.clearDraft('non-existent-task');
      }).not.toThrow();
    });

    it('should handle clearing empty taskId', () => {
      expect(() => {
        offlineStorage.clearDraft('');
      }).not.toThrow();
    });

    it('should only clear specified draft', () => {
      const task1 = 'task-1';
      const task2 = 'task-2';

      offlineStorage.saveDraft(task1, 'Content 1');
      offlineStorage.saveDraft(task2, 'Content 2');

      offlineStorage.clearDraft(task1);

      expect(localStorage.getItem(`${storageKeyPrefix}${task1}`)).toBeNull();
      expect(localStorage.getItem(`${storageKeyPrefix}${task2}`)).toBeTruthy();
    });
  });

  describe('hasDraft', () => {
    it('should return true when draft exists', () => {
      offlineStorage.saveDraft(mockTaskId, mockContent);

      expect(offlineStorage.hasDraft(mockTaskId)).toBe(true);
    });

    it('should return false when draft does not exist', () => {
      expect(offlineStorage.hasDraft('non-existent-task')).toBe(false);
    });

    it('should return false for empty taskId', () => {
      expect(offlineStorage.hasDraft('')).toBe(false);
    });
  });

  describe('getAllDrafts', () => {
    it('should return all stored drafts', () => {
      const task1 = 'task-1';
      const task2 = 'task-2';

      offlineStorage.saveDraft(task1, 'Content 1');
      offlineStorage.saveDraft(task2, 'Content 2');

      const drafts = offlineStorage.getAllDrafts();
      expect(drafts).toHaveLength(2);
      expect(drafts.find((d) => d.taskId === task1)).toBeTruthy();
      expect(drafts.find((d) => d.taskId === task2)).toBeTruthy();
    });

    it('should return empty array when no drafts exist', () => {
      const drafts = offlineStorage.getAllDrafts();
      expect(drafts).toEqual([]);
    });

    it('should include draft metadata', () => {
      offlineStorage.saveDraft(mockTaskId, mockContent);

      const drafts = offlineStorage.getAllDrafts();
      const draft = drafts[0];

      expect(draft.taskId).toBe(mockTaskId);
      expect(draft.content).toBe(mockContent);
      expect(draft.lastModified).toBeGreaterThanOrEqual(0);
    });
  });

  describe('syncWhenOnline', () => {
    it('should sync draft to server when online', async () => {
      const mockSaveEndpoint = '/api/documents/versions';
      offlineStorage.saveDraft(mockTaskId, mockContent);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await offlineStorage.syncWhenOnline(mockTaskId, mockSaveEndpoint);

      expect(global.fetch).toHaveBeenCalledWith(
        mockSaveEndpoint,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: mockTaskId,
            content: mockContent,
          }),
        })
      );
    });

    it('should clear draft after successful sync', async () => {
      const mockSaveEndpoint = '/api/documents/versions';
      offlineStorage.saveDraft(mockTaskId, mockContent);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await offlineStorage.syncWhenOnline(mockTaskId, mockSaveEndpoint);

      expect(offlineStorage.hasDraft(mockTaskId)).toBe(false);
    });

    it('should handle sync failure gracefully', async () => {
      const mockSaveEndpoint = '/api/documents/versions';
      offlineStorage.saveDraft(mockTaskId, mockContent);

      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        offlineStorage.syncWhenOnline(mockTaskId, mockSaveEndpoint)
      ).rejects.toThrow();

      // Draft should still exist after failed sync
      expect(offlineStorage.hasDraft(mockTaskId)).toBe(true);
    });

    it('should handle non-existent draft when syncing', async () => {
      const mockSaveEndpoint = '/api/documents/versions';

      const result = await offlineStorage.syncWhenOnline('non-existent-task', mockSaveEndpoint);

      expect(result).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('getDraftAge', () => {
    it('should return age of draft in milliseconds', () => {
      offlineStorage.saveDraft(mockTaskId, mockContent);

      const age = offlineStorage.getDraftAge(mockTaskId);
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1000); // Should be very recent
    });

    it('should return null for non-existent draft', () => {
      const age = offlineStorage.getDraftAge('non-existent-task');
      expect(age).toBeNull();
    });
  });

  describe('clearOldDrafts', () => {
    it('should remove drafts older than specified age', () => {
      const oldTask = 'old-task';
      const recentTask = 'recent-task';

      offlineStorage.saveDraft(oldTask, 'Old content');
      // Simulate old draft by directly manipulating timestamp
      const stored = localStorage.getItem(`${storageKeyPrefix}${oldTask}`);
      const parsed = JSON.parse(stored!);
      parsed.lastModified = Date.now() - 48 * 60 * 60 * 1000; // 48 hours ago
      localStorage.setItem(`${storageKeyPrefix}${oldTask}`, JSON.stringify(parsed));

      offlineStorage.saveDraft(recentTask, 'Recent content');

      offlineStorage.clearOldDrafts(24 * 60 * 60 * 1000); // 24 hours

      expect(offlineStorage.hasDraft(oldTask)).toBe(false);
      expect(offlineStorage.hasDraft(recentTask)).toBe(true);
    });

    it('should handle no drafts to clear', () => {
      expect(() => {
        offlineStorage.clearOldDrafts(24 * 60 * 60 * 1000);
      }).not.toThrow();
    });
  });

  describe('Storage quota management', () => {
    it('should get storage usage percentage', () => {
      offlineStorage.saveDraft(mockTaskId, mockContent);

      const usage = offlineStorage.getStorageUsage();
      expect(usage).toBeGreaterThan(0);
      expect(usage).toBeLessThanOrEqual(100);
    });

    it('should return 0 usage when storage is empty', () => {
      const usage = offlineStorage.getStorageUsage();
      expect(usage).toBe(0);
    });
  });
});
