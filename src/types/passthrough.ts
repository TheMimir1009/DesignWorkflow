/**
 * 파이프라인 처리 타입 정의
 * 데이터 처리 파이프라인 및 워크플로우 관리를 위한 타입
 */

import type { EntityId } from './index.js';

// 파이프라인 단계 상태
export type PipelineStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// 파이프라인 단계
export interface PipelineStage {
  readonly id: EntityId;
  readonly name: string;
  readonly description: string;
  readonly status: PipelineStageStatus;
  readonly input: unknown;
  readonly output?: unknown;
  readonly error?: string;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
}

// 파이프라인 유형
export type PipelineType = 'ingestion' | 'processing' | 'generation' | 'validation';

// 파이프라인 구성
export interface PipelineConfig {
  readonly id: EntityId;
  readonly name: string;
  readonly type: PipelineType;
  readonly description: string;
  readonly stages: readonly PipelineStageDefinition[];
  readonly retryPolicy: RetryPolicy;
  readonly timeoutMs: number;
}

// 파이프라인 단계 정의
export interface PipelineStageDefinition {
  readonly id: EntityId;
  readonly name: string;
  readonly handler: string;
  readonly dependsOn?: readonly EntityId[];
  readonly timeoutMs?: number;
}

// 재시도 정책
export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffMs: number;
  readonly retryableErrors: readonly string[];
}

// 파이프라인 실행
export interface PipelineExecution {
  readonly id: EntityId;
  readonly configId: EntityId;
  readonly status: PipelineStageStatus;
  readonly stages: readonly PipelineStage[];
  readonly input: unknown;
  readonly output?: unknown;
  readonly error?: string;
  readonly startedAt: Date;
  readonly completedAt?: Date;
  readonly progress: number;
}

// 데이터 처리 작업
export interface ProcessingJob {
  readonly id: EntityId;
  readonly type: string;
  readonly input: unknown;
  readonly status: PipelineStageStatus;
  readonly result?: unknown;
  readonly error?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 배치 작업
export interface BatchJob {
  readonly id: EntityId;
  readonly jobs: readonly ProcessingJob[];
  readonly status: PipelineStageStatus;
  readonly completedCount: number;
  readonly failedCount: number;
  readonly createdAt: Date;
  readonly completedAt?: Date;
}

// 워크플로우 트리거
export type WorkflowTrigger = 'manual' | 'scheduled' | 'event_based';

// 워크플로우 정의
export interface Workflow {
  readonly id: EntityId;
  readonly name: string;
  readonly description: string;
  readonly trigger: WorkflowTrigger;
  readonly pipelineId: EntityId;
  readonly schedule?: string;
  readonly enabled: boolean;
}

// 이벤트 기반 트리거
export interface EventTrigger {
  readonly eventType: string;
  readonly filter: Record<string, unknown>;
}

// 파이프라인 메트릭
export interface PipelineMetrics {
  readonly totalExecutions: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly averageExecutionTimeMs: number;
  readonly lastExecutionAt?: Date;
}
