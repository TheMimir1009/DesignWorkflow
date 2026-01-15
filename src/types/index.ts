/**
 * 핵심 엔티티 타입 정의
 * DesignWorkflow 시스템의 기본 엔티티 타입
 */

// 기본 ID 타입 (UUID 형식)
export type EntityId = `${string}-${string}-${string}-${string}-${string}`;

// 기본 타임스탬프 인터페이스
export interface Timestamps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 기본 엔티티 인터페이스
export interface BaseEntity extends Timestamps {
  readonly id: EntityId;
}

// 사용자 역할 타입
export type UserRole = 'admin' | 'editor' | 'viewer';

// 사용자 엔티티
export interface User extends BaseEntity {
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}

// 작업 상태 타입
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

// 작업 엔티티
export interface Task extends BaseEntity {
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly assigneeId?: EntityId;
  readonly dueDate?: Date;
}

// 프로젝트 엔티티
export interface Project extends BaseEntity {
  readonly name: string;
  readonly description: string;
  readonly ownerId: EntityId;
  readonly members: readonly EntityId[];
}

// 파일 메타데이터
export interface FileMetadata {
  readonly name: string;
  readonly size: number;
  readonly mimeType: string;
  readonly path: string;
}

// 알림 타입
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// 알림 엔티티
export interface Notification extends BaseEntity {
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly userId: EntityId;
  readonly read: boolean;
}
