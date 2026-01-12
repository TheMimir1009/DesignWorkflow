/**
 * Debug API Routes (SPEC-DEBUG-003, SPEC-LLM-002)
 * Endpoints for LLM debug logs management
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getSharedLogs, getSharedLogger, clearSharedLogger } from '../utils/llmProvider.ts';

export const debugRouter = Router();

/**
 * GET /api/debug/logs
 * Get all LLM API call logs from server
 */
debugRouter.get('/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = getSharedLogs();

    // Transform LLMLogEntry to LLMCallLog format for client
    const clientLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      provider: log.provider,
      model: log.model,
      endpoint: log.response ? 'api' : 'error',
      status: log.error ? 'error' : 'success',
      statusCode: log.error ? undefined : 200,
      duration: log.metrics?.duration_ms,
      inputTokens: log.response?.usage?.prompt_tokens,
      outputTokens: log.response?.usage?.completion_tokens,
      totalTokens: log.response?.usage?.total_tokens,
      cost: log.metrics?.estimated_cost,
      error: log.error?.message,
      request: log.request,
      response: log.response,
    }));

    sendSuccess(res, clientLogs);
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * DELETE /api/debug/logs
 * Clear all LLM API call logs
 */
debugRouter.delete('/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    clearSharedLogger();
    sendSuccess(res, { message: 'Logs cleared successfully' });
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * GET /api/debug/status
 * Get debug logging status and statistics
 */
debugRouter.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = getSharedLogs();

    // Calculate statistics
    const stats = {
      totalRequests: logs.length,
      successCount: logs.filter(log => !log.error).length,
      errorCount: logs.filter(log => log.error).length,
      totalTokens: logs.reduce((sum, log) => sum + (log.response?.usage?.total_tokens || 0), 0),
      totalCost: logs.reduce((sum, log) => sum + (log.metrics?.estimated_cost || 0), 0),
      isEnabled: true, // Debug mode is always enabled now
    };

    sendSuccess(res, stats);
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * POST /api/debug/sync
 * Trigger a sync of logs to client (for polling-based updates)
 */
debugRouter.post('/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lastTimestamp } = req.body;

    const logs = getSharedLogs();
    let filteredLogs = logs;

    if (lastTimestamp) {
      // Only return logs after the specified timestamp
      filteredLogs = logs.filter(log => log.timestamp > lastTimestamp);
    }

    // Transform to client format
    const clientLogs = filteredLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      provider: log.provider,
      model: log.model,
      endpoint: log.response ? 'api' : 'error',
      status: log.error ? 'error' : 'success',
      statusCode: log.error ? undefined : 200,
      duration: log.metrics?.duration_ms,
      inputTokens: log.response?.usage?.prompt_tokens,
      outputTokens: log.response?.usage?.completion_tokens,
      totalTokens: log.response?.usage?.total_tokens,
      cost: log.metrics?.estimated_cost,
      error: log.error?.message,
      request: log.request,
      response: log.response,
    }));

    sendSuccess(res, {
      logs: clientLogs,
      currentTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * GET /api/debug/logs/connection-tests
 * Get all connection test logs (SPEC-LLM-002)
 */
debugRouter.get('/logs/connection-tests', async (req: Request, res: Response): Promise<void> => {
  try {
    const logger = getSharedLogger();
    const connectionTestLogs = logger.getConnectionTestLogs();

    // Transform to client format
    const clientLogs = connectionTestLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      provider: log.provider,
      model: log.model,
      endpoint: 'connection-test',
      method: 'TEST',
      status: log.error ? 'error' : 'success',
      statusCode: log.error ? undefined : 200,
      duration: log.metrics?.duration_ms,
      error: log.error?.message,
      request: log.request,
      response: log.response,
      // Connection test specific fields
      phase: log.request?.parameters?.phase,
      projectId: log.request?.parameters?.projectId,
      modelCount: log.request?.parameters?.modelCount,
      models: log.request?.parameters?.models,
    }));

    sendSuccess(res, clientLogs);
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * GET /api/debug/logs/connection-tests/:provider
 * Get connection test logs for a specific provider (SPEC-LLM-002)
 */
debugRouter.get('/logs/connection-tests/:provider', async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;

    const logger = getSharedLogger();
    const connectionTestLogs = logger.getConnectionTestLogs();

    // Filter by provider
    const filteredLogs = connectionTestLogs.filter(log => log.provider === provider);

    // Transform to client format
    const clientLogs = filteredLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      provider: log.provider,
      model: log.model,
      endpoint: 'connection-test',
      method: 'TEST',
      status: log.error ? 'error' : 'success',
      statusCode: log.error ? undefined : 200,
      duration: log.metrics?.duration_ms,
      error: log.error?.message,
      request: log.request,
      response: log.response,
      // Connection test specific fields
      phase: log.request?.parameters?.phase,
      projectId: log.request?.parameters?.projectId,
      modelCount: log.request?.parameters?.modelCount,
      models: log.request?.parameters?.models,
    }));

    sendSuccess(res, clientLogs);
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
  }
});
