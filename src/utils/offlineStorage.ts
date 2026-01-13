/**
 * OfflineStorage Utility
 * TAG-DOCEDIT-003: Offline draft storage using localStorage
 *
 * Features:
 * - Save draft content to localStorage
 * - Retrieve draft content by taskId
 * - Clear draft from storage
 * - Sync drafts when online
 * - Storage quota management
 * - Old draft cleanup
 */

/**
 * Draft metadata structure
 */
interface DraftMetadata {
  taskId: string;
  content: string;
  lastModified: number;
}

/**
 * Storage key prefix for drafts
 */
const DRAFT_STORAGE_PREFIX = 'draft_';

/**
 * LocalStorage quota size (5-10MB typical browser limit)
 * Using conservative estimate of 5MB
 */
const ESTIMATED_QUOTA_BYTES = 5 * 1024 * 1024;

/**
 * OfflineStorage utility for managing draft documents in localStorage
 *
 * @example
 * ```ts
 * // Save a draft
 * offlineStorage.saveDraft('task-123', '# My Document');
 *
 * // Retrieve a draft
 * const content = offlineStorage.getDraft('task-123');
 *
 * // Sync when online
 * await offlineStorage.syncWhenOnline('task-123', '/api/documents/versions');
 *
 * // Clear draft
 * offlineStorage.clearDraft('task-123');
 * ```
 */
export const offlineStorage = {
  /**
   * Save draft content to localStorage
   * @param taskId - Task identifier
   * @param content - Draft content to save
   * @throws Error if storage quota is exceeded
   */
  saveDraft(taskId: string, content: string): void {
    if (!taskId) {
      return;
    }

    const metadata: DraftMetadata = {
      taskId,
      content,
      lastModified: Date.now(),
    };

    const key = `${DRAFT_STORAGE_PREFIX}${taskId}`;

    try {
      localStorage.setItem(key, JSON.stringify(metadata));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  },

  /**
   * Retrieve draft content from localStorage
   * @param taskId - Task identifier
   * @returns Draft content or null if not found
   */
  getDraft(taskId: string): string | null {
    if (!taskId) {
      return null;
    }

    const key = `${DRAFT_STORAGE_PREFIX}${taskId}`;
    const stored = localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    try {
      const metadata: DraftMetadata = JSON.parse(stored);
      return metadata.content;
    } catch {
      // Handle corrupted data
      return null;
    }
  },

  /**
   * Remove draft from localStorage
   * @param taskId - Task identifier
   */
  clearDraft(taskId: string): void {
    if (!taskId) {
      return;
    }

    const key = `${DRAFT_STORAGE_PREFIX}${taskId}`;
    localStorage.removeItem(key);
  },

  /**
   * Check if a draft exists for the given task
   * @param taskId - Task identifier
   * @returns True if draft exists
   */
  hasDraft(taskId: string): boolean {
    if (!taskId) {
      return false;
    }

    const key = `${DRAFT_STORAGE_PREFIX}${taskId}`;
    return localStorage.getItem(key) !== null;
  },

  /**
   * Get all stored drafts
   * @returns Array of draft metadata
   */
  getAllDrafts(): DraftMetadata[] {
    const drafts: DraftMetadata[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DRAFT_STORAGE_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const metadata: DraftMetadata = JSON.parse(stored);
            drafts.push(metadata);
          } catch {
            // Skip corrupted entries
            continue;
          }
        }
      }
    }

    return drafts;
  },

  /**
   * Sync draft to server when online
   * @param taskId - Task identifier
   * @param endpoint - API endpoint for saving
   * @returns True if sync was successful
   */
  async syncWhenOnline(taskId: string, endpoint: string): Promise<boolean> {
    if (!taskId || !this.hasDraft(taskId)) {
      return false;
    }

    const content = this.getDraft(taskId);
    if (!content) {
      return false;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear draft after successful sync
      this.clearDraft(taskId);
      return true;
    } catch (error) {
      // Re-throw error for caller to handle
      throw error;
    }
  },

  /**
   * Get age of draft in milliseconds
   * @param taskId - Task identifier
   * @returns Age in milliseconds or null if not found
   */
  getDraftAge(taskId: string): number | null {
    if (!taskId) {
      return null;
    }

    const key = `${DRAFT_STORAGE_PREFIX}${taskId}`;
    const stored = localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    try {
      const metadata: DraftMetadata = JSON.parse(stored);
      return Date.now() - metadata.lastModified;
    } catch {
      return null;
    }
  },

  /**
   * Remove drafts older than specified age
   * @param maxAge - Maximum age in milliseconds
   */
  clearOldDrafts(maxAge: number): void {
    const drafts = this.getAllDrafts();
    const now = Date.now();

    drafts.forEach((draft) => {
      const age = now - draft.lastModified;
      if (age > maxAge) {
        this.clearDraft(draft.taskId);
      }
    });
  },

  /**
   * Get estimated storage usage percentage
   * @returns Usage percentage (0-100)
   */
  getStorageUsage(): number {
    let totalBytes = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DRAFT_STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          // Rough estimate: 2 bytes per character (UTF-16)
          totalBytes += key.length * 2 + value.length * 2;
        }
      }
    }

    return Math.min((totalBytes / ESTIMATED_QUOTA_BYTES) * 100, 100);
  },
};

// Re-export types for convenience
export type { DraftMetadata };
