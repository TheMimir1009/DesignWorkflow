/**
 * 파이프라인 처리 타입 정의 테스트
 */

import { describe, it, expect } from 'vitest';
import type {
  PipelineStageStatus,
  PipelineStage,
  PipelineType,
  PipelineConfig,
  PipelineStageDefinition,
  RetryPolicy,
  PipelineExecution,
  ProcessingJob,
  BatchJob,
  WorkflowTrigger,
  Workflow,
  EventTrigger,
  PipelineMetrics,
} from './passthrough.js';

describe('Pipeline Processing Types', () => {
  describe('PipelineStageStatus', () => {
    it('should accept valid pipeline stage statuses', () => {
      const pending: PipelineStageStatus = 'pending';
      const running: PipelineStageStatus = 'running';
      const completed: PipelineStageStatus = 'completed';
      const failed: PipelineStageStatus = 'failed';
      const skipped: PipelineStageStatus = 'skipped';

      expect(pending).toBe('pending');
      expect(running).toBe('running');
      expect(completed).toBe('completed');
      expect(failed).toBe('failed');
      expect(skipped).toBe('skipped');
    });
  });

  describe('PipelineStage', () => {
    it('should have required stage properties', () => {
      const stage: PipelineStage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Data Validation',
        description: 'Validate input data',
        status: 'pending',
        input: { data: 'test' },
      };

      expect(stage.id).toBeDefined();
      expect(stage.name).toBe('Data Validation');
      expect(stage.description).toBe('Validate input data');
      expect(stage.status).toBe('pending');
      expect(stage.input).toEqual({ data: 'test' });
    });

    it('should support completed stage with output', () => {
      const completedStage: PipelineStage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Processing',
        description: 'Process data',
        status: 'completed',
        input: { value: 10 },
        output: { result: 20 },
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:05:00Z'),
      };

      expect(completedStage.status).toBe('completed');
      expect(completedStage.output).toEqual({ result: 20 });
      expect(completedStage.startedAt).toBeInstanceOf(Date);
      expect(completedStage.completedAt).toBeInstanceOf(Date);
    });

    it('should support failed stage with error', () => {
      const failedStage: PipelineStage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Validation',
        description: 'Validate schema',
        status: 'failed',
        input: { invalid: 'data' },
        error: 'Schema validation failed',
        startedAt: new Date(),
      };

      expect(failedStage.status).toBe('failed');
      expect(failedStage.error).toBe('Schema validation failed');
    });
  });

  describe('PipelineType', () => {
    it('should accept valid pipeline types', () => {
      const ingestion: PipelineType = 'ingestion';
      const processing: PipelineType = 'processing';
      const generation: PipelineType = 'generation';
      const validation: PipelineType = 'validation';

      expect(ingestion).toBe('ingestion');
      expect(processing).toBe('processing');
      expect(generation).toBe('generation');
      expect(validation).toBe('validation');
    });
  });

  describe('RetryPolicy', () => {
    it('should have retry policy properties', () => {
      const policy: RetryPolicy = {
        maxRetries: 3,
        backoffMs: 1000,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
      };

      expect(policy.maxRetries).toBe(3);
      expect(policy.backoffMs).toBe(1000);
      expect(policy.retryableErrors).toContain('ECONNRESET');
    });
  });

  describe('PipelineStageDefinition', () => {
    it('should have stage definition properties', () => {
      const definition: PipelineStageDefinition = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Extract Data',
        handler: 'extractDataHandler',
        dependsOn: ['550e8400-e29b-41d4-a716-446655440001'],
        timeoutMs: 5000,
      };

      expect(definition.id).toBeDefined();
      expect(definition.name).toBe('Extract Data');
      expect(definition.handler).toBe('extractDataHandler');
      expect(definition.dependsOn).toBeDefined();
      expect(definition.timeoutMs).toBe(5000);
    });

    it('should allow optional dependencies and timeout', () => {
      const simpleDefinition: PipelineStageDefinition = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Simple Task',
        handler: 'simpleHandler',
      };

      expect(simpleDefinition.dependsOn).toBeUndefined();
      expect(simpleDefinition.timeoutMs).toBeUndefined();
    });
  });

  describe('PipelineConfig', () => {
    it('should have pipeline configuration properties', () => {
      const stages: readonly PipelineStageDefinition[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Stage 1',
          handler: 'handler1',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Stage 2',
          handler: 'handler2',
        },
      ];

      const retryPolicy: RetryPolicy = {
        maxRetries: 2,
        backoffMs: 500,
        retryableErrors: ['NETWORK_ERROR'],
      };

      const config: PipelineConfig = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Data Processing Pipeline',
        type: 'processing',
        description: 'Process incoming data',
        stages,
        retryPolicy,
        timeoutMs: 30000,
      };

      expect(config.id).toBeDefined();
      expect(config.name).toBe('Data Processing Pipeline');
      expect(config.type).toBe('processing');
      expect(config.stages).toHaveLength(2);
      expect(config.retryPolicy.maxRetries).toBe(2);
      expect(config.timeoutMs).toBe(30000);
    });
  });

  describe('PipelineExecution', () => {
    it('should have execution properties', () => {
      const stages: readonly PipelineStage[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Stage 1',
          description: 'First stage',
          status: 'completed',
          input: { value: 1 },
          output: { result: 2 },
        },
      ];

      const execution: PipelineExecution = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        configId: '550e8400-e29b-41d4-a716-446655440002',
        status: 'running',
        stages,
        input: { data: 'test' },
        startedAt: new Date(),
        progress: 50,
      };

      expect(execution.id).toBeDefined();
      expect(execution.configId).toBeDefined();
      expect(execution.status).toBe('running');
      expect(execution.stages).toHaveLength(1);
      expect(execution.progress).toBe(50);
    });

    it('should support completed execution with output', () => {
      const execution: PipelineExecution = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        configId: '550e8400-e29b-41d4-a716-446655440001',
        status: 'completed',
        stages: [],
        input: { value: 10 },
        output: { result: 100 },
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:10:00Z'),
        progress: 100,
      };

      expect(execution.status).toBe('completed');
      expect(execution.output).toEqual({ result: 100 });
      expect(execution.progress).toBe(100);
    });

    it('should support failed execution with error', () => {
      const execution: PipelineExecution = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        configId: '550e8400-e29b-41d4-a716-446655440001',
        status: 'failed',
        stages: [],
        input: { data: 'test' },
        error: 'Processing failed: timeout',
        startedAt: new Date(),
        progress: 75,
      };

      expect(execution.status).toBe('failed');
      expect(execution.error).toBe('Processing failed: timeout');
    });
  });

  describe('ProcessingJob', () => {
    it('should have job properties', () => {
      const job: ProcessingJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'data_transform',
        input: { data: 'test' },
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(job.id).toBeDefined();
      expect(job.type).toBe('data_transform');
      expect(job.input).toEqual({ data: 'test' });
      expect(job.status).toBe('pending');
    });

    it('should support completed job with result', () => {
      const job: ProcessingJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'validation',
        input: { schema: 'test' },
        status: 'completed',
        result: { valid: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(job.status).toBe('completed');
      expect(job.result).toEqual({ valid: true });
    });

    it('should support failed job with error', () => {
      const job: ProcessingJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'processing',
        input: { data: 'invalid' },
        status: 'failed',
        error: 'Invalid data format',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(job.status).toBe('failed');
      expect(job.error).toBe('Invalid data format');
    });
  });

  describe('BatchJob', () => {
    it('should have batch job properties', () => {
      const jobs: readonly ProcessingJob[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'task1',
          input: {},
          status: 'completed',
          result: { success: true },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          type: 'task2',
          input: {},
          status: 'failed',
          error: 'Task failed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const batchJob: BatchJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        jobs,
        status: 'running',
        completedCount: 1,
        failedCount: 1,
        createdAt: new Date(),
      };

      expect(batchJob.id).toBeDefined();
      expect(batchJob.jobs).toHaveLength(2);
      expect(batchJob.status).toBe('running');
      expect(batchJob.completedCount).toBe(1);
      expect(batchJob.failedCount).toBe(1);
    });

    it('should support completed batch job', () => {
      const batchJob: BatchJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        jobs: [],
        status: 'completed',
        completedCount: 10,
        failedCount: 0,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      expect(batchJob.status).toBe('completed');
      expect(batchJob.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('WorkflowTrigger', () => {
    it('should accept valid workflow triggers', () => {
      const manual: WorkflowTrigger = 'manual';
      const scheduled: WorkflowTrigger = 'scheduled';
      const eventBased: WorkflowTrigger = 'event_based';

      expect(manual).toBe('manual');
      expect(scheduled).toBe('scheduled');
      expect(eventBased).toBe('event_based');
    });
  });

  describe('Workflow', () => {
    it('should have workflow properties', () => {
      const workflow: Workflow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Daily Data Sync',
        description: 'Sync data daily',
        trigger: 'scheduled',
        pipelineId: '550e8400-e29b-41d4-a716-446655440001',
        schedule: '0 0 * * *',
        enabled: true,
      };

      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe('Daily Data Sync');
      expect(workflow.trigger).toBe('scheduled');
      expect(workflow.pipelineId).toBeDefined();
      expect(workflow.schedule).toBe('0 0 * * *');
      expect(workflow.enabled).toBe(true);
    });

    it('should allow optional schedule', () => {
      const manualWorkflow: Workflow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Manual Process',
        description: 'Manual trigger workflow',
        trigger: 'manual',
        pipelineId: '550e8400-e29b-41d4-a716-446655440001',
        enabled: true,
      };

      expect(manualWorkflow.schedule).toBeUndefined();
    });
  });

  describe('EventTrigger', () => {
    it('should have event trigger properties', () => {
      const eventTrigger: EventTrigger = {
        eventType: 'document.created',
        filter: {
          documentType: 'design_doc',
        },
      };

      expect(eventTrigger.eventType).toBe('document.created');
      expect(eventTrigger.filter.documentType).toBe('design_doc');
    });
  });

  describe('PipelineMetrics', () => {
    it('should have metrics properties', () => {
      const metrics: PipelineMetrics = {
        totalExecutions: 100,
        successfulExecutions: 95,
        failedExecutions: 5,
        averageExecutionTimeMs: 2500,
        lastExecutionAt: new Date(),
      };

      expect(metrics.totalExecutions).toBe(100);
      expect(metrics.successfulExecutions).toBe(95);
      expect(metrics.failedExecutions).toBe(5);
      expect(metrics.averageExecutionTimeMs).toBe(2500);
      expect(metrics.lastExecutionAt).toBeInstanceOf(Date);
    });

    it('should allow optional last execution time', () => {
      const metrics: PipelineMetrics = {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTimeMs: 0,
      };

      expect(metrics.lastExecutionAt).toBeUndefined();
    });
  });
});
