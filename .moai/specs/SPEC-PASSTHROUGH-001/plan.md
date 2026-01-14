# SPEC-PASSTHROUGH-001: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-PASSTHROUGH-001 |
| 제목 | 패스쓰루 자동 파이프라인 구현 계획 |
| 생성일 | 2026-01-14 |
| 작성자 | Mimir |

---

## 1. 구현 단계

### Phase 1: Primary Goal - 핵심 인프라 구축

**목표**: 패스쓰루 파이프라인의 기본 구조와 상태 관리 구현

#### 1.1 타입 및 인터페이스 정의
- [ ] `src/types/passthrough.ts` 생성
  - PipelineStatus, StageStatus, PipelineStage 타입
  - StageInfo, PipelineState 인터페이스
  - API 요청/응답 인터페이스

#### 1.2 백엔드 API 구현
- [ ] `server/routes/passthrough.ts` 생성
  - POST /api/tasks/:taskId/passthrough/start
  - POST /api/tasks/:taskId/passthrough/pause
  - POST /api/tasks/:taskId/passthrough/resume
  - POST /api/tasks/:taskId/passthrough/cancel
  - GET /api/tasks/:taskId/passthrough/status

#### 1.3 상태 지속성 구현
- [ ] `server/utils/passthroughStorage.ts` 생성
  - savePipelineState() - JSON 파일 저장
  - loadPipelineState() - JSON 파일 로드
  - deletePipelineState() - 파이프라인 상태 삭제

#### 1.4 프론트엔드 상태 관리
- [ ] `src/store/passthroughStore.ts` 생성
  - Zustand store 기본 구조
  - 상태 및 액션 정의
  - 폴링 로직 구현

### Phase 2: Secondary Goal - 파이프라인 실행 엔진

**목표**: 실제 문서 생성 파이프라인 실행 및 제어 로직 구현

#### 2.1 파이프라인 실행 엔진
- [ ] `server/utils/passthroughRunner.ts` 생성
  - runPipeline() - 전체 파이프라인 실행
  - runStage() - 단일 단계 실행
  - handlePause() - 일시정지 처리
  - handleCancel() - 취소 처리

#### 2.2 LLM 연동
- [ ] SPEC-LLM-001 설정 연동
  - 현재 활성화된 프로바이더 조회
  - 모델 설정 적용
  - mashup 모드 지원

#### 2.3 문서 생성 로직 통합
- [ ] SPEC-DOCUMENT-001 함수 재사용
  - generateDesignDocument() 호출
  - generatePRD() 호출
  - generatePrototype() 호출

#### 2.4 프론트엔드 서비스
- [ ] `src/services/passthroughService.ts` 생성
  - startPassthrough() API 호출
  - pausePassthrough() API 호출
  - resumePassthrough() API 호출
  - cancelPassthrough() API 호출
  - getPassthroughStatus() API 호출

### Phase 3: Final Goal - UI 컴포넌트 및 통합

**목표**: 사용자 인터페이스 구현 및 전체 시스템 통합

#### 3.1 UI 컴포넌트 구현
- [ ] `src/components/passthrough/PassthroughPanel.tsx`
  - 메인 컨테이너 컴포넌트
  - 상태 기반 렌더링
  - 에러 표시

- [ ] `src/components/passthrough/PassthroughProgress.tsx`
  - 진행률 프로그레스 바
  - 단계별 상태 표시

- [ ] `src/components/passthrough/PassthroughStageCard.tsx`
  - 개별 단계 정보 카드
  - 실행 시간 표시
  - 에러 정보 표시

- [ ] `src/components/passthrough/PassthroughControls.tsx`
  - 제어 버튼 그룹
  - 상태 기반 버튼 활성화
  - 확인 다이얼로그

#### 3.2 Q&A 완료 후 통합
- [ ] `src/components/document/QAFormModal.tsx` 수정
  - Q&A 완료 시 패스쓰루 옵션 추가
  - "자동 생성" 버튼 연결

#### 3.3 칸반 보드 연동
- [ ] `src/components/kanban/KanbanCard.tsx` 수정
  - 패스쓰루 실행 중 드래그 비활성화
  - 진행 상태 뱃지 표시

#### 3.4 테스트 작성
- [ ] 단위 테스트
  - passthroughStore 테스트
  - passthroughService 테스트
  - 컴포넌트 테스트

- [ ] 통합 테스트
  - API 엔드포인트 테스트
  - 파이프라인 실행 테스트
  - 상태 복구 테스트

---

## 2. 파일 생성 목록 (13개 신규 파일)

### 프론트엔드 (8개)

| 파일 경로 | 설명 | 우선순위 |
|-----------|------|----------|
| `src/types/passthrough.ts` | 패스쓰루 타입 정의 | Phase 1 |
| `src/store/passthroughStore.ts` | Zustand 상태 관리 | Phase 1 |
| `src/services/passthroughService.ts` | API 서비스 | Phase 2 |
| `src/components/passthrough/index.ts` | 컴포넌트 인덱스 | Phase 3 |
| `src/components/passthrough/PassthroughPanel.tsx` | 메인 패널 | Phase 3 |
| `src/components/passthrough/PassthroughProgress.tsx` | 진행률 표시 | Phase 3 |
| `src/components/passthrough/PassthroughStageCard.tsx` | 단계 카드 | Phase 3 |
| `src/components/passthrough/PassthroughControls.tsx` | 제어 버튼 | Phase 3 |

### 백엔드 (3개)

| 파일 경로 | 설명 | 우선순위 |
|-----------|------|----------|
| `server/routes/passthrough.ts` | API 라우트 | Phase 1 |
| `server/utils/passthroughRunner.ts` | 실행 엔진 | Phase 2 |
| `server/utils/passthroughStorage.ts` | 상태 저장 | Phase 1 |

### 테스트 (2개)

| 파일 경로 | 설명 | 우선순위 |
|-----------|------|----------|
| `tests/server/passthrough.test.ts` | 백엔드 테스트 | Phase 3 |
| `tests/client/passthrough/passthroughStore.test.ts` | 스토어 테스트 | Phase 3 |

---

## 3. 파일 수정 목록 (5개 수정 파일)

| 파일 경로 | 수정 내용 | 우선순위 |
|-----------|----------|----------|
| `server/index.ts` | passthrough 라우트 등록 | Phase 1 |
| `src/components/document/QAFormModal.tsx` | 패스쓰루 시작 버튼 추가 | Phase 3 |
| `src/components/kanban/KanbanCard.tsx` | 패스쓰루 중 드래그 비활성화 | Phase 3 |
| `src/store/taskStore.ts` | 패스쓰루 상태 연동 | Phase 2 |
| `src/types/index.ts` | passthrough 타입 re-export | Phase 1 |

---

## 4. API 엔드포인트 명세

### 4.1 POST /api/tasks/:taskId/passthrough/start

**설명**: 패스쓰루 파이프라인 시작

**Request Body**:
```typescript
{
  resumeFromStage?: PipelineStage  // 선택적: 특정 단계부터 재개
}
```

**Response**:
```typescript
{
  success: boolean;
  pipeline: PipelineState;
  message?: string;
}
```

**에러 코드**:
- 400: Q&A가 완료되지 않음
- 409: 이미 실행 중인 파이프라인 존재
- 404: 태스크를 찾을 수 없음

### 4.2 POST /api/tasks/:taskId/passthrough/pause

**설명**: 실행 중인 파이프라인 일시정지

**Response**:
```typescript
{
  success: boolean;
  pipeline: PipelineState;
  message?: string;
}
```

**에러 코드**:
- 400: 일시정지할 수 없는 상태
- 404: 파이프라인을 찾을 수 없음

### 4.3 POST /api/tasks/:taskId/passthrough/resume

**설명**: 일시정지된 파이프라인 재개

**Response**:
```typescript
{
  success: boolean;
  pipeline: PipelineState;
  message?: string;
}
```

**에러 코드**:
- 400: 재개할 수 없는 상태
- 404: 파이프라인을 찾을 수 없음

### 4.4 POST /api/tasks/:taskId/passthrough/cancel

**설명**: 파이프라인 취소

**Response**:
```typescript
{
  success: boolean;
  pipeline: PipelineState;
  message?: string;
}
```

**에러 코드**:
- 400: 취소할 수 없는 상태
- 404: 파이프라인을 찾을 수 없음

### 4.5 GET /api/tasks/:taskId/passthrough/status

**설명**: 파이프라인 상태 조회

**Response**:
```typescript
{
  success: boolean;
  pipeline: PipelineState | null;
  message?: string;
}
```

### 4.6 POST /api/tasks/:taskId/passthrough/retry

**설명**: 실패한 단계 재시도

**Request Body**:
```typescript
{
  stage: PipelineStage  // 재시도할 단계
}
```

**Response**:
```typescript
{
  success: boolean;
  pipeline: PipelineState;
  message?: string;
}
```

**에러 코드**:
- 400: 재시도할 수 없는 상태
- 400: 재시도 횟수 초과 (3회)
- 404: 파이프라인을 찾을 수 없음

---

## 5. 컴포넌트 구조

```
src/components/passthrough/
├── index.ts                     # 컴포넌트 export
├── PassthroughPanel.tsx         # 메인 패널 (컨테이너)
│   ├── PassthroughProgress.tsx  # 진행률 표시
│   ├── PassthroughStageCard.tsx # 단계별 카드 (x3)
│   │   ├── Design Doc
│   │   ├── PRD
│   │   └── Prototype
│   └── PassthroughControls.tsx  # 제어 버튼
│       ├── Start Button
│       ├── Pause Button
│       ├── Resume Button
│       └── Cancel Button
```

### 컴포넌트 계층 구조

```
QAFormModal (SPEC-QA-001)
  |
  +-- onComplete --> PassthroughPanel
                       |
                       +-- PassthroughProgress
                       |     +-- ProgressBar
                       |     +-- StageIndicators
                       |
                       +-- StageCards (map)
                       |     +-- PassthroughStageCard (Design Doc)
                       |     +-- PassthroughStageCard (PRD)
                       |     +-- PassthroughStageCard (Prototype)
                       |
                       +-- PassthroughControls
                             +-- StartButton
                             +-- PauseButton
                             +-- ResumeButton
                             +-- CancelButton
```

---

## 6. 상태 관리 설계

### 6.1 passthroughStore 구조

```typescript
interface PassthroughStore {
  // === 상태 ===
  pipeline: PipelineState | null;
  isLoading: boolean;
  error: string | null;
  pollingIntervalId: number | null;

  // === 액션 ===
  // 파이프라인 제어
  startPipeline: (taskId: string) => Promise<void>;
  pausePipeline: (taskId: string) => Promise<void>;
  resumePipeline: (taskId: string) => Promise<void>;
  cancelPipeline: (taskId: string) => Promise<void>;
  retryStage: (taskId: string, stage: PipelineStage) => Promise<void>;

  // 상태 조회
  fetchPipelineStatus: (taskId: string) => Promise<void>;
  clearPipeline: () => void;

  // 폴링 관리
  startPolling: (taskId: string) => void;
  stopPolling: () => void;

  // === Computed ===
  // getters
  isRunning: () => boolean;
  isPaused: () => boolean;
  isCompleted: () => boolean;
  isFailed: () => boolean;
  getCurrentStage: () => PipelineStage | null;
  getProgress: () => number;
}
```

### 6.2 상태 전이 다이어그램

```
                    +------------+
                    |   idle     |
                    +-----+------+
                          |
                    start |
                          v
                    +------------+
         +--------->|  running   |<---------+
         |          +-----+------+          |
         |                |                 |
   resume|    +-----------+-----------+     |retry
         |    |           |           |     |
         |    v           v           v     |
    +----+----+    +------+-----+  +--+-----+--+
    |  paused |    | completed  |  |  failed   |
    +---------+    +------------+  +-----------+
         |                              |
         |                              |
         +----------> cancel <----------+
                         |
                         v
                  +------------+
                  | cancelled  |
                  +------------+
```

---

## 7. 테스트 계획

### 7.1 단위 테스트

#### passthroughStore 테스트
- [ ] 초기 상태 확인
- [ ] startPipeline 액션 테스트
- [ ] pausePipeline 액션 테스트
- [ ] resumePipeline 액션 테스트
- [ ] cancelPipeline 액션 테스트
- [ ] 폴링 시작/중지 테스트
- [ ] 에러 처리 테스트

#### passthroughService 테스트
- [ ] API 호출 성공 케이스
- [ ] API 호출 실패 케이스
- [ ] 타임아웃 처리

#### 컴포넌트 테스트
- [ ] PassthroughPanel 렌더링
- [ ] PassthroughProgress 진행률 표시
- [ ] PassthroughStageCard 상태별 렌더링
- [ ] PassthroughControls 버튼 활성화/비활성화

### 7.2 통합 테스트

#### API 엔드포인트 테스트
- [ ] POST /start - 성공/실패 케이스
- [ ] POST /pause - 상태별 동작
- [ ] POST /resume - 상태별 동작
- [ ] POST /cancel - 상태별 동작
- [ ] GET /status - 상태 조회
- [ ] POST /retry - 재시도 로직

#### 파이프라인 실행 테스트
- [ ] 전체 파이프라인 정상 실행
- [ ] 일시정지 후 재개
- [ ] 취소 시 즉시 중단
- [ ] 에러 발생 시 상태 처리
- [ ] 브라우저 새로고침 후 상태 복구

### 7.3 테스트 커버리지 목표

| 영역 | 목표 커버리지 |
|------|---------------|
| 타입 정의 | 100% |
| Store 액션 | 90% |
| API 서비스 | 85% |
| 컴포넌트 | 80% |
| API 라우트 | 90% |
| 실행 엔진 | 85% |

---

## 8. 위험 요소 및 대응

| 위험 요소 | 영향도 | 대응 방안 |
|-----------|--------|-----------|
| LLM API 응답 지연 | High | 타임아웃 120초, 진행 상태 표시, 재시도 옵션 |
| 브라우저 새로고침 | Medium | 서버 측 상태 저장, 복구 로직 구현 |
| 동시 요청 충돌 | Medium | 락 메커니즘, 상태 검증 |
| 문서 생성 실패 | High | 상세 에러 메시지, 재시도 옵션 (최대 3회) |
| 네트워크 오류 | Medium | 자동 재시도, 오프라인 감지 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-14 | Mimir | 초기 구현 계획 작성 |
