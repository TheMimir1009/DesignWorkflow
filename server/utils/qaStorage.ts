/**
 * Q&A Storage Utility
 * Handles reading and writing Q&A session data to workspace/qa-sessions/
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { QASession, QACategory } from '../../src/types/qa';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to Q&A sessions directory
 */
export const QA_SESSIONS_DIR = path.resolve(__dirname, '../../workspace/qa-sessions');

/**
 * Ensure Q&A sessions directory exists
 */
async function ensureDirectory(): Promise<void> {
  try {
    await fs.mkdir(QA_SESSIONS_DIR, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

/**
 * Get session file path for a task
 */
function getSessionFilePath(taskId: string): string {
  return path.join(QA_SESSIONS_DIR, `${taskId}.json`);
}

/**
 * Get Q&A session by task ID
 */
export async function getQASessionByTaskId(taskId: string): Promise<QASession | null> {
  const filePath = getSessionFilePath(taskId);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as QASession;
  } catch {
    return null;
  }
}

/**
 * Create a new Q&A session for a task
 */
export async function createQASession(
  taskId: string,
  category: QACategory
): Promise<QASession> {
  await ensureDirectory();

  const session: QASession = {
    id: uuidv4(),
    taskId,
    category,
    status: 'in_progress',
    currentStep: 0,
    answers: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  await saveQASession(session);
  return session;
}

/**
 * Save Q&A session to file
 */
export async function saveQASession(session: QASession): Promise<QASession> {
  await ensureDirectory();

  const filePath = getSessionFilePath(session.taskId);
  await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');

  return session;
}

/**
 * Delete Q&A session
 */
export async function deleteQASession(taskId: string): Promise<boolean> {
  const filePath = getSessionFilePath(taskId);

  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * List all Q&A sessions
 */
export async function listQASessions(): Promise<QASession[]> {
  await ensureDirectory();

  try {
    const files = await fs.readdir(QA_SESSIONS_DIR);
    const sessions: QASession[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(
            path.join(QA_SESSIONS_DIR, file),
            'utf-8'
          );
          sessions.push(JSON.parse(content) as QASession);
        } catch {
          // Skip invalid files
        }
      }
    }

    return sessions;
  } catch {
    return [];
  }
}
