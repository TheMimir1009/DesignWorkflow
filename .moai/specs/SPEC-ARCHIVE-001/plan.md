# SPEC-ARCHIVE-001: 구현 계획

## 개요

이 문서는 아카이브 기능(SPEC-ARCHIVE-001)의 상세 구현 계획을 정의합니다.

---

## 1. 구현 단계

### Phase 1: 백엔드 API 구현

**예상 작업량**: 중간

#### 1.1 archiveStorage.ts 생성

**파일**: `server/utils/archiveStorage.ts`

**기능**:
- `getArchivesByProject(projectId)` - 프로젝트별 아카이브 목록 조회
- `getArchiveById(projectId, archiveId)` - 개별 아카이브 조회
- `createArchive(projectId, taskId, task)` - 아카이브 생성
- `deleteArchive(projectId, archiveId)` - 아카이브 삭제
- `restoreArchive(projectId, archiveId)` - 아카이브 복원

**참조 패턴**: `server/utils/taskStorage.ts`

#### 1.2 archives.ts 라우트 생성

**파일**: `server/routes/archives.ts`

**엔드포인트**:

```typescript
// 아카이브 목록 조회
GET /api/projects/:projectId/archives

// 아카이브 상세 조회
GET /api/projects/:projectId/archives/:archiveId

// 태스크 아카이브
POST /api/projects/:projectId/tasks/:taskId/archive

// 아카이브 복원
POST /api/projects/:projectId/archives/:archiveId/restore

// 아카이브 영구 삭제
DELETE /api/projects/:projectId/archives/:archiveId
```

#### 1.3 Express 서버 통합

**파일**: `server/index.ts`

**작업**:
- archives 라우터 import 및 등록
- `/api/projects/:projectId/archives` 경로 마운트

---

### Phase 2: 프론트엔드 상태 관리

**예상 작업량**: 중간

#### 2.1 ArchiveState 타입 추가

**파일**: `src/types/index.ts`

**추가 타입**:

```typescript
// Archive Store State
export interface ArchiveState {
  archives: Archive[];
  selectedArchiveId: string | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

// Archive DTOs
export interface ArchiveListResponse {
  archives: Archive[];
  total: number;
}
```

#### 2.2 archiveStore.ts 생성

**파일**: `src/store/archiveStore.ts`

**상태**:
- `archives: Archive[]`
- `selectedArchiveId: string | null`
- `isLoading: boolean`
- `error: string | null`
- `searchQuery: string`

**액션**:
- `fetchArchives(projectId)` - 아카이브 목록 로드
- `archiveTask(projectId, taskId)` - 태스크 아카이브
- `restoreArchive(projectId, archiveId)` - 아카이브 복원
- `deleteArchive(projectId, archiveId)` - 아카이브 삭제
- `selectArchive(archiveId)` - 아카이브 선택
- `setSearchQuery(query)` - 검색어 설정
- `clearError()` - 에러 초기화

**참조 패턴**: `src/store/taskStore.ts`

#### 2.3 archiveService.ts 생성

**파일**: `src/services/archiveService.ts`

**함수**:
- `getArchives(projectId): Promise<Archive[]>`
- `getArchiveById(projectId, archiveId): Promise<Archive>`
- `archiveTask(projectId, taskId): Promise<Archive>`
- `restoreArchive(projectId, archiveId): Promise<Task>`
- `deleteArchive(projectId, archiveId): Promise<void>`

**참조 패턴**: `src/services/taskService.ts`

---

### Phase 3: UI 컴포넌트 구현

**예상 작업량**: 높음

#### 3.1 ArchiveList.tsx 컴포넌트

**파일**: `src/components/archive/ArchiveList.tsx`

**기능**:
- 아카이브된 태스크 목록 표시
- 검색 필터링
- 정렬 (날짜순)
- 복원/삭제 액션

**UI 요소**:
- 검색 입력 필드
- 아카이브 카드 그리드/리스트
- 빈 상태 메시지
- 로딩 스켈레톤

#### 3.2 ArchiveDetail.tsx 컴포넌트

**파일**: `src/components/archive/ArchiveDetail.tsx`

**기능**:
- 아카이브된 태스크의 모든 문서 표시
- 탭 네비게이션 (Feature List / Design Doc / PRD / Prototype)
- Markdown 렌더링
- 복원 버튼

**UI 요소**:
- 모달/슬라이드 패널
- 탭 컴포넌트
- Markdown 프리뷰
- 메타데이터 표시 (아카이브 날짜, 참조 시스템)

#### 3.3 ArchiveCard.tsx 컴포넌트

**파일**: `src/components/archive/ArchiveCard.tsx`

**기능**:
- 개별 아카이브 항목 표시
- 클릭 시 상세 뷰 열기
- 빠른 액션 (복원, 삭제)

**UI 요소**:
- 카드 레이아웃
- 제목, 날짜, 태그
- 액션 버튼 (호버 시 표시)

#### 3.4 ArchiveConfirmDialog.tsx 컴포넌트

**파일**: `src/components/archive/ArchiveConfirmDialog.tsx`

**기능**:
- 아카이브/복원/삭제 확인 다이얼로그
- 액션 타입에 따른 메시지 변경

**props**:
- `isOpen: boolean`
- `actionType: 'archive' | 'restore' | 'delete'`
- `taskTitle: string`
- `onConfirm: () => void`
- `onCancel: () => void`

#### 3.5 KanbanCard.tsx 수정

**파일**: `src/components/kanban/KanbanCard.tsx`

**수정 내용**:
- Prototype 상태일 때 아카이브 버튼 추가
- 아카이브 버튼 클릭 핸들러
- 확인 다이얼로그 연동

**조건부 렌더링**:

```tsx
{task.status === 'prototype' && (
  <button onClick={handleArchiveClick}>
    <ArchiveIcon />
  </button>
)}
```

---

### Phase 4: 통합 및 테스트

**예상 작업량**: 중간

#### 4.1 네비게이션 통합

**작업**:
- 사이드바 또는 헤더에 "아카이브" 메뉴 추가
- 라우팅 설정 (필요시)

#### 4.2 단위 테스트

**테스트 파일**:
- `server/utils/__tests__/archiveStorage.test.ts`
- `src/services/__tests__/archiveService.test.ts`
- `src/store/__tests__/archiveStore.test.ts`

**테스트 케이스**:
- 아카이브 CRUD 작업
- 에러 핸들링
- 상태 업데이트

#### 4.3 통합 테스트

**테스트 파일**:
- `server/routes/__tests__/archives.test.ts`

**테스트 케이스**:
- API 엔드포인트 전체
- 인증/권한 검증
- 에러 응답

#### 4.4 컴포넌트 테스트

**테스트 파일**:
- `src/components/archive/__tests__/ArchiveList.test.tsx`
- `src/components/archive/__tests__/ArchiveDetail.test.tsx`

**테스트 케이스**:
- 렌더링 테스트
- 사용자 상호작용
- 상태 변화

---

## 2. 기술 스택

### 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.x | UI 컴포넌트 |
| TypeScript | 5.x | 타입 안전성 |
| Zustand | 4.x | 상태 관리 |
| Tailwind CSS | 3.x | 스타일링 |
| react-markdown | 9.x | Markdown 렌더링 |

### 백엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Express | 4.x | API 서버 |
| Node.js | 20.x | 런타임 |
| uuid | latest | ID 생성 |

### 테스트

| 기술 | 버전 | 용도 |
|------|------|------|
| Vitest | latest | 단위/통합 테스트 |
| React Testing Library | latest | 컴포넌트 테스트 |

---

## 3. 의존성 관리

### 신규 의존성

없음 - 기존 패키지 활용

### 기존 의존성 활용

- `uuid` - 이미 설치됨 (taskStorage.ts)
- `zustand` - 이미 설치됨 (taskStore.ts)
- `react-markdown` - 이미 설치됨 (DocumentEditor.tsx)

---

## 4. 리스크 및 완화 전략

### 4.1 데이터 손실 리스크

**리스크**: 아카이브/복원 중 파일 손실

**완화 전략**:
- 트랜잭션 패턴: 복사 → 검증 → 삭제 순서
- 에러 발생 시 원본 유지
- 작업 전 데이터 무결성 검증

### 4.2 동시성 리스크

**리스크**: 동시 아카이브/복원 요청 충돌

**완화 전략**:
- 낙관적 UI 업데이트 + 서버 응답 후 확정
- 실패 시 롤백
- 버튼 비활성화 (작업 중)

### 4.3 대용량 데이터 리스크

**리스크**: 아카이브 목록 증가에 따른 성능 저하

**완화 전략**:
- 페이지네이션 구현 (Phase 2)
- 가상 스크롤 (필요시)
- 인덱싱 최적화

---

## 5. 품질 기준

### 5.1 테스트 커버리지

- **목표**: 85% 이상
- **필수 커버리지**:
  - archiveStorage.ts: 90%+
  - archiveService.ts: 85%+
  - archiveStore.ts: 85%+

### 5.2 성능 기준

- 아카이브 목록 로딩: < 500ms (100개 기준)
- 아카이브/복원 작업: < 2s
- UI 반응성: < 100ms

### 5.3 코드 품질

- TypeScript strict mode 통과
- ESLint 경고 0개
- 일관된 네이밍 컨벤션

---

## 6. 구현 순서 요약

1. **Phase 1**: 백엔드 API
   - archiveStorage.ts
   - archives.ts 라우트
   - Express 통합

2. **Phase 2**: 프론트엔드 상태
   - 타입 정의 추가
   - archiveStore.ts
   - archiveService.ts

3. **Phase 3**: UI 컴포넌트
   - ArchiveList.tsx
   - ArchiveDetail.tsx
   - ArchiveCard.tsx
   - ArchiveConfirmDialog.tsx
   - KanbanCard.tsx 수정

4. **Phase 4**: 통합 및 테스트
   - 네비게이션 통합
   - 단위/통합/컴포넌트 테스트
   - E2E 플로우 검증

---

## 7. 체크리스트

### Phase 1 체크리스트

- [ ] archiveStorage.ts 생성
- [ ] archives.ts 라우트 생성
- [ ] Express 서버에 라우트 등록
- [ ] API 엔드포인트 테스트

### Phase 2 체크리스트

- [ ] ArchiveState 타입 추가
- [ ] archiveStore.ts 생성
- [ ] archiveService.ts 생성
- [ ] 스토어 액션 테스트

### Phase 3 체크리스트

- [ ] ArchiveList.tsx 구현
- [ ] ArchiveDetail.tsx 구현
- [ ] ArchiveCard.tsx 구현
- [ ] ArchiveConfirmDialog.tsx 구현
- [ ] KanbanCard.tsx 아카이브 버튼 추가

### Phase 4 체크리스트

- [ ] 네비게이션 메뉴 추가
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 컴포넌트 테스트 작성
- [ ] E2E 플로우 검증
- [ ] 코드 리뷰 완료
