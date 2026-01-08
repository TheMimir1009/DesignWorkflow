---
id: SPEC-ARCHIVE-001
version: "1.0.0"
status: "draft"
created: "2026-01-08"
updated: "2026-01-08"
author: "MoAI-ADK"
priority: "high"
---

# SPEC-ARCHIVE-001: 아카이브 기능 (Archive Feature)

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-08 | MoAI-ADK | 초기 SPEC 작성 |

---

## 1. 개요

### 1.1 기능 설명

Prototype 개발 완료 후 태스크를 아카이브하여 칸반 보드를 정리하는 기능입니다.

### 1.2 사용자 스토리

> "기획자로서, 완료된 기획 태스크를 아카이브하여 칸반 보드를 깔끔하게 유지하고 싶습니다."

### 1.3 문제 해결

- Prototype 단계 완료 후 태스크가 보드에 쌓이는 문제 해결
- 완료된 작업과 진행 중인 작업의 시각적 구분 제공
- 과거 기획 문서 참조 기능 제공

### 1.4 범위

**포함 범위**:
- 태스크 아카이브 기능
- 아카이브 목록 조회
- 아카이브 상세 조회 (모든 문서)
- 아카이브 복원 기능
- 아카이브 영구 삭제 (관리자)

**제외 범위**:
- 아카이브 데이터 외부 내보내기
- 아카이브 일괄 처리
- 아카이브 자동화 규칙

---

## 2. 요구사항 (EARS 형식)

### 2.1 Ubiquitous Requirements (항상 적용)

**REQ-U-001**: 시스템은 아카이브된 모든 태스크의 원본 데이터(Feature List, Design Doc, PRD, Prototype)를 무손실로 보존해야 한다.

**REQ-U-002**: 아카이브 목록은 아카이브 날짜 기준 최신순(내림차순)으로 정렬되어야 한다.

**REQ-U-003**: 시스템은 아카이브 작업에 대한 확인 다이얼로그를 표시해야 한다.

### 2.2 Event-Driven Requirements (이벤트 기반)

**REQ-E-001**: 사용자가 Prototype 컬럼의 "아카이브" 버튼을 클릭하면, 시스템은 확인 다이얼로그를 표시해야 한다.

**REQ-E-002**: 사용자가 아카이브 확인 다이얼로그에서 "확인"을 클릭하면, 시스템은:
- 태스크 데이터를 아카이브 저장소로 이동
- 태스크의 `isArchived` 플래그를 `true`로 설정
- 칸반 보드에서 해당 태스크를 숨김

**REQ-E-003**: 사용자가 아카이브 목록에서 "복원" 버튼을 클릭하면, 시스템은:
- 태스크를 Prototype 상태로 칸반 보드에 복원
- `isArchived` 플래그를 `false`로 설정
- 아카이브 목록에서 해당 태스크를 제거

**REQ-E-004**: 사용자가 아카이브 목록에서 "영구 삭제" 버튼을 클릭하면, 시스템은 확인 후 아카이브 데이터를 완전히 삭제해야 한다.

### 2.3 Unwanted Behavior Requirements (방지해야 할 동작)

**REQ-W-001**: 시스템은 Prototype 상태가 아닌 태스크(featurelist, design, prd)에 아카이브 버튼을 표시해서는 안 된다.

**REQ-W-002**: 시스템은 아카이브/복원 과정에서 문서 데이터(Feature List, Design Doc, PRD, Prototype)가 손실되어서는 안 된다.

**REQ-W-003**: 시스템은 확인 다이얼로그 없이 영구 삭제를 수행해서는 안 된다.

### 2.4 State-Driven Requirements (상태 기반)

**REQ-S-001**: 태스크가 아카이브 상태(`isArchived: true`)일 때, 시스템은 칸반 보드의 모든 컬럼에서 해당 태스크를 숨겨야 한다.

**REQ-S-002**: 아카이브 뷰가 활성화되어 있을 때, 시스템은 현재 프로젝트의 모든 아카이브된 태스크 목록을 표시해야 한다.

**REQ-S-003**: 아카이브 상세 뷰가 열려 있을 때, 시스템은 해당 태스크의 모든 문서(Feature List, Design Doc, PRD, Prototype)를 탭 형태로 표시해야 한다.

### 2.5 Optional Features (선택적 기능)

**REQ-O-001**: 관리자 권한이 있을 때, 시스템은 아카이브된 태스크의 영구 삭제 옵션을 제공할 수 있다.

**REQ-O-002**: 시스템은 아카이브 목록에서 키워드 검색 기능을 제공할 수 있다.

**REQ-O-003**: 시스템은 아카이브 목록에서 날짜 범위 필터 기능을 제공할 수 있다.

---

## 3. 기술 아키텍처

### 3.1 컴포넌트 구조

```
/src/components/archive/
├── ArchiveList.tsx          # 아카이브 목록 뷰
├── ArchiveDetail.tsx        # 아카이브 상세 뷰
├── ArchiveCard.tsx          # 아카이브 목록 카드
└── ArchiveConfirmDialog.tsx # 아카이브/삭제 확인 다이얼로그

/src/store/
└── archiveStore.ts          # Zustand 상태 관리

/src/services/
└── archiveService.ts        # API 서비스

/server/routes/
└── archives.ts              # Express API 라우트

/server/utils/
└── archiveStorage.ts        # 파일 시스템 저장소
```

### 3.2 데이터 모델

기존 타입 활용 (`src/types/index.ts`):

```typescript
// 이미 정의된 Archive 인터페이스 (lines 119-125)
interface Archive {
  id: string;
  taskId: string;
  projectId: string;
  task: Task;           // 전체 태스크 데이터 스냅샷
  archivedAt: string;   // 아카이브 일시
}

// 추가 필요: ArchiveState 인터페이스
interface ArchiveState {
  archives: Archive[];
  selectedArchiveId: string | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}
```

### 3.3 API 엔드포인트

| Method | Endpoint | 설명 | 요청 본문 | 응답 |
|--------|----------|------|-----------|------|
| POST | `/api/projects/:projectId/tasks/:taskId/archive` | 태스크 아카이브 | - | `Archive` |
| GET | `/api/projects/:projectId/archives` | 목록 조회 | - | `Archive[]` |
| GET | `/api/projects/:projectId/archives/:archiveId` | 상세 조회 | - | `Archive` |
| POST | `/api/projects/:projectId/archives/:archiveId/restore` | 복원 | - | `Task` |
| DELETE | `/api/projects/:projectId/archives/:archiveId` | 영구 삭제 | - | `{ success: boolean }` |

### 3.4 저장소 구조

```
/workspace/projects/{projectId}/
├── tasks/
│   └── tasks.json           # 활성 태스크 (isArchived: false)
└── archives/
    ├── archives.json        # 아카이브 메타데이터 목록
    └── {taskId}/            # 개별 아카이브 태스크 데이터
        ├── task.json        # 태스크 메타데이터 스냅샷
        ├── feature_list.md  # Feature List 문서
        ├── design_doc.md    # Design Document
        ├── prd.md           # PRD 문서
        └── prototype.html   # Prototype 파일
```

### 3.5 의존성

**기존 모듈 의존성**:
- `src/types/index.ts` - Task, Archive 인터페이스
- `src/store/taskStore.ts` - 태스크 상태 관리 패턴 참조
- `server/utils/taskStorage.ts` - 파일 저장소 패턴 참조
- `src/services/taskService.ts` - API 서비스 패턴 참조

**외부 라이브러리**:
- `uuid` - 아카이브 ID 생성
- `zustand` - 상태 관리
- `react-markdown` - 문서 렌더링

---

## 4. UI/UX 명세

### 4.1 아카이브 버튼 (KanbanCard)

- **위치**: Prototype 컬럼의 칸반 카드 우측 상단
- **아이콘**: 아카이브 박스 아이콘
- **조건**: `status === 'prototype'` 인 경우에만 표시
- **동작**: 클릭 시 확인 다이얼로그 표시

### 4.2 아카이브 목록 뷰 (ArchiveList)

- **접근**: 사이드바 또는 헤더의 "아카이브" 메뉴
- **표시 항목**:
  - 태스크 제목
  - 아카이브 날짜
  - 참조 시스템 태그 (최대 3개)
  - 문서 완성도 아이콘
- **액션 버튼**: 복원, 상세 보기, 삭제
- **검색**: 제목 기반 키워드 검색

### 4.3 아카이브 상세 뷰 (ArchiveDetail)

- **레이아웃**: 모달 또는 슬라이드 패널
- **탭 구성**:
  - Feature List
  - Design Document
  - PRD
  - Prototype
- **문서 렌더링**: Markdown → HTML (react-markdown)
- **액션**: 복원 버튼

### 4.4 확인 다이얼로그

**아카이브 확인**:
- 제목: "태스크를 아카이브하시겠습니까?"
- 설명: "아카이브된 태스크는 칸반 보드에서 숨겨집니다. 언제든지 복원할 수 있습니다."
- 버튼: [취소] [아카이브]

**복원 확인**:
- 제목: "태스크를 복원하시겠습니까?"
- 설명: "태스크가 Prototype 컬럼으로 복원됩니다."
- 버튼: [취소] [복원]

**삭제 확인**:
- 제목: "아카이브를 영구 삭제하시겠습니까?"
- 설명: "이 작업은 되돌릴 수 없습니다. 모든 문서가 영구적으로 삭제됩니다."
- 버튼: [취소] [삭제] (빨간색)

---

## 5. 비기능 요구사항

### 5.1 성능

- 아카이브 목록 로딩: 500ms 이내 (100개 아카이브 기준)
- 아카이브/복원 작업: 2초 이내

### 5.2 데이터 무결성

- 아카이브 작업 중 오류 발생 시 롤백
- 문서 데이터 무손실 보장

### 5.3 동시성

- 동일 태스크 동시 아카이브 방지
- 낙관적 업데이트 + 롤백 패턴

### 5.4 접근성

- 키보드 네비게이션 지원
- 스크린 리더 호환성

---

## 6. 관련 문서

- [PRD - Feature 9: Archive Feature](../../project/product.md)
- [프로젝트 구조](../../project/structure.md)
- [기술 스택](../../project/tech.md)
- [SPEC-TASK-001: 태스크 관리](../SPEC-TASK-001/spec.md)
- [SPEC-KANBAN-001: 칸반 보드](../SPEC-KANBAN-001/spec.md)
