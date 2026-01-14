/**
 * Passthrough Pipeline Storage Utility
 * Handles reading and writing pipeline state to workspace/passthrough-pipelines/
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { PassthroughPipeline, PassthroughStage, PassthroughStageError } from '../../src/types/passthrough';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to passthrough pipelines directory
 */
export const PIPELINES_DIR = process.env.MOAI_TEST_PIPELINE_DIR ||
  path.resolve(__dirname, '../../workspace/passthrough-pipelines');

/**
 * Ensure pipelines directory exists
 */
async function ensureDirectory(): Promise<void> {
  try {
    await fs.mkdir(PIPELINES_DIR, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

/**
 * Get pipeline file path by ID
 */
function getPipelineFilePath(pipelineId: string): string {
  return path.join(PIPELINES_DIR, `${pipelineId}.json`);
}

/**
 * Get pipeline file path by task ID
 */
function getPipelineFilePathByTaskId(taskId: string): string {
  return path.join(PIPELINES_DIR, `task-${taskId}.json`);
}

/**
 * Create a new passthrough pipeline
 */
export async function createPipeline(
  taskId: string,
  qaSessionId: string,
  stages: PassthroughStage[] = []
): Promise<PassthroughPipeline> {
  await ensureDirectory();

  const now = new Date().toISOString();
  const pipeline: PassthroughPipeline = {
    id: uuidv4(),
    taskId,
    qaSessionId,
    status: 'pending',
    currentStage: null,
    stages,
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null,
  };

  // Save immediately
  await savePipeline(pipeline);

  return pipeline;
}

/**
 * Save pipeline to file
 */
export async function savePipeline(pipeline: PassthroughPipeline): Promise<PassthroughPipeline> {
  await ensureDirectory();

  const filePath = getPipelineFilePath(pipeline.id);
  await fs.writeFile(filePath, JSON.stringify(pipeline, null, 2), 'utf-8');

  // Also save by task ID for quick lookup
  const taskFilePath = getPipelineFilePathByTaskId(pipeline.taskId);
  await fs.writeFile(taskFilePath, JSON.stringify(pipeline, null, 2), 'utf-8');

  return pipeline;
}

/**
 * Get pipeline by ID
 */
export async function getPipelineById(pipelineId: string): Promise<PassthroughPipeline | null> {
  const filePath = getPipelineFilePath(pipelineId);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as PassthroughPipeline;
  } catch {
    return null;
  }
}

/**
 * Get pipeline by task ID
 */
export async function getPipelineByTaskId(taskId: string): Promise<PassthroughPipeline | null> {
  const filePath = getPipelineFilePathByTaskId(taskId);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as PassthroughPipeline;
  } catch {
    return null;
  }
}

/**
 * Delete pipeline
 */
export async function deletePipeline(pipelineId: string): Promise<boolean> {
  const pipeline = await getPipelineById(pipelineId);

  if (!pipeline) {
    return false;
  }

  try {
    const filePath = getPipelineFilePath(pipelineId);
    await fs.unlink(filePath);

    const taskFilePath = getPipelineFilePathByTaskId(pipeline.taskId);
    await fs.unlink(taskFilePath).catch(() => {
      // Ignore if task file doesn't exist
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * List all pipelines
 */
export async function listPipelines(
  taskId?: string,
  status?: PassthroughPipeline['status']
): Promise<PassthroughPipeline[]> {
  await ensureDirectory();

  try {
    const files = await fs.readdir(PIPELINES_DIR);
    const pipelines: PassthroughPipeline[] = [];

    for (const file of files) {
      // Only process pipeline ID files (not task- files)
      if (file.endsWith('.json') && !file.startsWith('task-')) {
        try {
          const content = await fs.readFile(path.join(PIPELINES_DIR, file), 'utf-8');
          const pipeline = JSON.parse(content) as PassthroughPipeline;

          // Apply filters
          if (taskId && pipeline.taskId !== taskId) {
            continue;
          }
          if (status && pipeline.status !== status) {
            continue;
          }

          pipelines.push(pipeline);
        } catch {
          // Skip invalid files
        }
      }
    }

    // Sort by creation date (newest first)
    return pipelines.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Update pipeline status
 */
export async function updatePipelineStatus(
  pipelineId: string,
  status: PassthroughPipeline['status'],
  currentStage?: PassthroughPipeline['currentStage']
): Promise<PassthroughPipeline | null> {
  const pipeline = await getPipelineById(pipelineId);

  if (!pipeline) {
    return null;
  }

  const now = new Date().toISOString();

  // Update status-specific fields
  if (status === 'running' && !pipeline.startedAt) {
    pipeline.startedAt = now;
  }

  if (status === 'completed') {
    pipeline.completedAt = now;
    pipeline.currentStage = null; // Clear current stage when completed
  } else if (currentStage !== undefined) {
    pipeline.currentStage = currentStage;
  }

  pipeline.status = status;
  pipeline.updatedAt = now;

  await savePipeline(pipeline);
  return pipeline;
}

/**
 * Update stage progress
 */
export async function updateStageProgress(
  pipelineId: string,
  stageId: string,
  progress: number,
  status: PassthroughStage['status'],
  error?: PassthroughStageError
): Promise<PassthroughPipeline | null> {
  const pipeline = await getPipelineById(pipelineId);

  if (!pipeline) {
    return null;
  }

  const stage = pipeline.stages.find(s => s.id === stageId);

  if (!stage) {
    return null;
  }

  const now = new Date().toISOString();

  // Update stage
  stage.progress = progress;
  stage.status = status;

  // Set startedAt if stage is starting to run
  if (status === 'running' && !stage.startedAt) {
    stage.startedAt = now;
  }

  // Auto-complete stage if progress is 100
  if (progress === 100 && status !== 'failed' && status !== 'cancelled') {
    stage.status = 'completed';
    stage.completedAt = now;
    stage.progress = 100;
  }

  // Set completedAt if status is explicitly completed
  if (status === 'completed' && !stage.completedAt) {
    stage.completedAt = now;
    stage.progress = 100;
  }

  // Set error if provided
  if (error) {
    stage.error = error;
  }

  pipeline.updatedAt = now;

  await savePipeline(pipeline);
  return pipeline;
}
