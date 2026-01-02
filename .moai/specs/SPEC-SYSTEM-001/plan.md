# SPEC-SYSTEM-001: 구현 계획 (Implementation Plan)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SYSTEM-001 |
| 제목 | 시스템 문서 관리 기능 구현 계획 |
| 생성일 | 2026-01-02 |
| 관련 SPEC | SPEC-SYSTEM-001/spec.md |

---

## 1. 마일스톤 (Milestones)

### Primary Goal: Backend API 구현 (Phase 3.1 Backend)

**목표**: Express 기반 시스템 문서 CRUD API 엔드포인트 구현

**구현 태스크**:

1. server/routes/systems.ts 구현
   - GET /api/projects/:projectId/systems - 시스템 문서 목록 조회
   - GET /api/projects/:projectId/systems/:id - 시스템 문서 상세 조회
   - POST /api/projects/:projectId/systems - 시스템 문서 생성
   - PUT /api/projects/:projectId/systems/:id - 시스템 문서 수정
   - DELETE /api/projects/:projectId/systems/:id - 시스템 문서 삭제
   - GET /api/projects/:projectId/systems/categories - 카테고리 목록
   - GET /api/projects/:projectId/systems/tags - 태그 목록

2. 파일 시스템 유틸리티 구현
   - server/utils/systemStorage.ts 생성
   - systems.json 읽기/쓰기
   - 개별 마크다운 파일 읽기/쓰기
   - 메타데이터와 콘텐츠 동기화

3. server/index.ts 라우트 등록
   - /api/projects/:projectId/systems 라우트 추가

**완료 기준**:
- 모든 API 엔드포인트가 정상 동작
- curl/Postman으로 테스트 가능
- 에러 처리 및 응답 형식 표준화

---

### Secondary Goal: 상태 관리 구현 (Phase 3.1 State)

**목표**: Zustand 기반 시스템 문서 상태 관리 구현

**구현 태스크**:

1. src/store/systemStore.ts 구현
   - SystemStore 인터페이스 구현
   - fetchDocuments: 프로젝트별 문서 로드
   - createDocument: 문서 생성
   - updateDocument: 문서 수정
   - deleteDocument: 문서 삭제
   - 필터링 상태 관리 (searchQuery, selectedTags)
   - UI 상태 관리 (expandedCategories, previewDocumentId)

2. src/services/systemDocService.ts 구현
   - API 호출 함수
   - 타입 안전한 응답 처리
   - 에러 핸들링

**완료 기준**:
- Store 액션이 API와 정상 연동
- 프로젝트 전환 시 문서 목록 갱신
- 필터링 상태 관리 동작

---

### Tertiary Goal: 시스템 사이드바 UI (Phase 3.2)

**목표**: E+A 패턴 기반 시스템 문서 사이드바 구현

**구현 태스크**:

1. src/components/system/SystemSidebar.tsx 구현
   - 사이드바 레이아웃 (Tailwind CSS)
   - 검색 입력 필드
   - 태그 필터 버튼
   - 카테고리별 아코디언 목록
   - "문서 추가" 버튼

2. src/components/system/SystemList.tsx 구현
   - 카테고리별 그룹화 로직
   - 아코디언 펼치기/접기
   - 문서 카운트 표시

3. src/components/system/SystemCard.tsx 구현
   - 문서 카드 UI
   - 이름, 카테고리 뱃지, 태그
   - 미리보기/수정/삭제 버튼

**완료 기준**:
- 사이드바가 레이아웃에 통합됨
- 카테고리별 그룹화 동작
- 펼치기/접기 애니메이션

---

### Fourth Goal: 문서 CRUD 모달 (Phase 3.2 Modal)

**목표**: 시스템 문서 생성/수정/미리보기 모달 구현

**구현 태스크**:

1. src/components/system/SystemCreateModal.tsx 구현
   - 모달 레이아웃
   - 폼 필드: name (필수), category (필수), tags, dependencies
   - 마크다운 에디터 통합 (content)
   - 유효성 검사
   - 제출 처리

2. src/components/system/SystemEditModal.tsx 구현
   - 기존 데이터 로드
   - 폼 필드 동일
   - 변경 감지 및 저장

3. src/components/system/SystemPreview.tsx 구현
   - 마크다운 렌더링 (react-markdown)
   - 메타데이터 표시 (카테고리, 태그, 의존성)
   - 수정/닫기 버튼

4. 공통 컴포넌트 확인
   - MarkdownEditor.tsx 구현 또는 확인
   - 실시간 미리보기 지원

**완료 기준**:
- 모달이 정상적으로 열리고 닫힘
- 마크다운 에디터 동작
- 문서 생성/수정 후 목록 업데이트

---

### Fifth Goal: 검색 및 필터링 (Phase 3.3)

**목표**: 키워드 검색 및 태그 기반 필터링 구현

**구현 태스크**:

1. 검색 기능 구현
   - 검색어 입력 debounce (300ms)
   - 문서 이름, 태그 매칭
   - 검색 결과 하이라이트 (선택)

2. 태그 필터 구현
   - 태그 목록 표시 (사용 빈도순)
   - 다중 태그 선택
   - 필터 초기화 버튼

3. 성능 최적화
   - 100개 이상 문서 검색 성능 확인
   - 필요 시 가상화 적용 (react-virtual)

**완료 기준**:
- 검색어 입력 시 실시간 필터링
- 다중 태그 필터 동작
- 100개 문서 기준 500ms 이내 응답

---

## 2. 기술적 접근 방식 (Technical Approach)

### 2.1 Backend API 구조

```typescript
// server/routes/systems.ts
import { Router, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllSystemDocuments,
  getSystemDocumentById,
  saveSystemDocument,
  deleteSystemDocument,
  getCategories,
  getTags,
} from '../utils/systemStorage';

const router = Router({ mergeParams: true }); // projectId 접근

// GET /api/projects/:projectId/systems
router.get('/', async (req, res) => {
  const { projectId } = req.params;
  // systems.json + 개별 .md 파일 읽기
  // 메타데이터 + content 병합
});

// POST /api/projects/:projectId/systems
router.post('/', async (req, res) => {
  const { projectId } = req.params;
  // 1. UUID 생성
  // 2. systems.json에 메타데이터 추가
  // 3. {id}.md 파일 생성
});

// PUT /api/projects/:projectId/systems/:id
router.put('/:id', async (req, res) => {
  const { projectId, id } = req.params;
  // 1. 문서 존재 확인
  // 2. systems.json 업데이트
  // 3. {id}.md 파일 업데이트
});

// DELETE /api/projects/:projectId/systems/:id
router.delete('/:id', async (req, res) => {
  const { projectId, id } = req.params;
  // 1. 문서 존재 확인
  // 2. systems.json에서 제거
  // 3. {id}.md 파일 삭제
});

export default router;
```

### 2.2 파일 저장 유틸리티

```typescript
// server/utils/systemStorage.ts
import fs from 'fs/promises';
import path from 'path';

const WORKSPACE_PATH = path.join(process.cwd(), 'workspace', 'projects');

function getSystemsPath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'systems');
}

function getMetadataPath(projectId: string): string {
  return path.join(getSystemsPath(projectId), 'systems.json');
}

function getContentPath(projectId: string, documentId: string): string {
  return path.join(getSystemsPath(projectId), `${documentId}.md`);
}

export async function getAllSystemDocuments(projectId: string): Promise<SystemDocument[]> {
  // 1. systems.json 읽기
  // 2. 각 문서의 .md 파일 읽어서 content 추가
  // 3. 병합된 배열 반환
}

export async function saveSystemDocument(
  projectId: string,
  document: SystemDocument
): Promise<void> {
  // 1. systems.json에 메타데이터 저장 (content 제외)
  // 2. {id}.md에 content 저장
}

export async function deleteSystemDocument(
  projectId: string,
  documentId: string
): Promise<void> {
  // 1. systems.json에서 제거
  // 2. {id}.md 파일 삭제
}
```

### 2.3 Zustand Store 구조

```typescript
// src/store/systemStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SystemDocument, SystemDocumentState } from '../types';
import * as systemDocService from '../services/systemDocService';

interface SystemStore extends SystemDocumentState {
  // Additional state
  searchQuery: string;
  selectedTags: string[];
  expandedCategories: string[];
  previewDocumentId: string | null;

  // Actions
  fetchDocuments: (projectId: string) => Promise<void>;
  createDocument: (projectId: string, data: CreateSystemDto) => Promise<void>;
  updateDocument: (projectId: string, id: string, data: UpdateSystemDto) => Promise<void>;
  deleteDocument: (projectId: string, id: string) => Promise<void>;

  // Filter actions
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;

  // UI actions
  toggleCategory: (category: string) => void;
  setPreviewDocument: (id: string | null) => void;

  // Computed getters
  getFilteredDocuments: () => SystemDocument[];
  getCategories: () => string[];
  getAllTags: () => string[];
}

function filterDocuments(
  documents: SystemDocument[],
  searchQuery: string,
  selectedTags: string[]
): SystemDocument[] {
  return documents.filter(doc => {
    // 검색어 필터
    const matchesSearch = !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // 태그 필터
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => doc.tags.includes(tag));

    return matchesSearch && matchesTags;
  });
}

export const useSystemStore = create<SystemStore>()(
  devtools((set, get) => ({
    // Initial state
    documents: [],
    selectedDocumentIds: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedTags: [],
    expandedCategories: [],
    previewDocumentId: null,

    // Actions implementation...
  }), { name: 'SystemStore' })
);
```

### 2.4 컴포넌트 구조

```
SystemSidebar
├── 헤더
│   ├── 제목: "시스템 문서"
│   └── 접기 버튼
├── 검색 영역
│   ├── SearchInput (검색어 입력)
│   └── 태그 필터 버튼
├── 태그 필터 패널 (토글)
│   └── 태그 칩 목록
├── 카테고리별 목록 (SystemList)
│   ├── 카테고리 헤더 (펼치기/접기)
│   └── 문서 카드 목록 (SystemCard)
└── 문서 추가 버튼

SystemCard
├── 문서 이름
├── 카테고리 뱃지
├── 태그 목록 (최대 3개 + more)
└── 액션 버튼
    ├── 미리보기 (눈 아이콘)
    ├── 수정 (연필 아이콘)
    └── 삭제 (휴지통 아이콘)

SystemCreateModal / SystemEditModal
├── 헤더: "시스템 문서 추가/수정"
├── 폼
│   ├── 이름 입력 (필수)
│   ├── 카테고리 선택 (드롭다운)
│   ├── 태그 입력 (TagInput)
│   ├── 의존 문서 선택 (다중 선택)
│   └── 마크다운 에디터 (MarkdownEditor)
└── 푸터: 취소 | 저장

SystemPreview
├── 헤더
│   ├── 문서 이름
│   └── 닫기 버튼
├── 메타데이터
│   ├── 카테고리 뱃지
│   ├── 태그 목록
│   └── 의존 문서 링크
├── 마크다운 렌더링 영역
└── 푸터: 수정 버튼
```

### 2.5 E+A 패턴 설계

E+A (Expand + Action) 패턴은 사이드바에서 다음과 같이 적용:

**Expand (확장)**:
- 카테고리 헤더 클릭 시 해당 카테고리 문서 목록 펼침/접힘
- 검색/필터 시 매칭 카테고리만 자동 확장
- 사이드바 자체도 접기/펼치기 가능

**Action (액션)**:
- 각 문서 카드에 미리보기/수정/삭제 액션
- 사이드바 하단에 "문서 추가" 고정 버튼
- 검색 초기화 버튼

---

## 3. 아키텍처 설계 방향 (Architecture Design)

### 3.1 데이터 흐름

```
User Action (사이드바/모달)
    ↓
React Component (SystemSidebar/Modal)
    ↓
Zustand Store Action (systemStore)
    ↓
Service Layer (systemDocService.ts)
    ↓
Express API (/api/projects/:projectId/systems)
    ↓
File System (workspace/projects/{projectId}/systems/)
    ↓
Response
    ↓
Zustand State Update
    ↓
React Re-render
```

### 3.2 컴포넌트 의존성

```
App.tsx
└── Layout.tsx
    ├── Header.tsx
    │   └── ProjectSelector.tsx (기존)
    ├── SystemSidebar.tsx (신규)
    │   ├── SystemList.tsx
    │   │   └── SystemCard.tsx
    │   ├── SystemCreateModal.tsx
    │   ├── SystemEditModal.tsx
    │   └── SystemPreview.tsx
    └── MainContent.tsx
        └── KanbanBoard.tsx (후속 SPEC)
```

### 3.3 프로젝트 전환 시 동작

```typescript
// projectStore에서 프로젝트 선택 시
selectProject: (id: string | null) => {
  set(state => ({
    currentProjectId: id,
    currentProject: computeCurrentProject(state.projects, id),
  }));

  // 시스템 문서 로드 트리거
  if (id) {
    useSystemStore.getState().fetchDocuments(id);
  } else {
    useSystemStore.getState().clearDocuments();
  }
}
```

### 3.4 에러 처리 전략

**Frontend**:
- try-catch 블록으로 API 호출 감싸기
- Zustand store에 error 상태 관리
- Toast 컴포넌트로 사용자 알림
- 로딩 상태 표시

**Backend**:
- 표준화된 에러 응답 (ApiResponse 형식)
- HTTP 상태 코드: 400, 404, 500
- 상세 에러 메시지 포함
- 파일 시스템 에러 처리

---

## 4. 리스크 및 대응 방안 (Risks and Mitigations)

### 4.1 기술적 리스크

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|----------|
| 메타데이터-콘텐츠 동기화 실패 | Medium | High | 트랜잭션성 저장 로직 구현 |
| 마크다운 에디터 미구현 | Low | Medium | 기존 MarkdownEditor 확인 또는 신규 구현 |
| 100개+ 문서 렌더링 성능 | Medium | Medium | 가상 스크롤링 적용 (react-virtual) |
| 파일 시스템 동시 접근 | Low | Medium | 단일 사용자 환경으로 제한 |

### 4.2 UI/UX 리스크

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|----------|
| 사이드바 레이아웃 충돌 | Medium | Low | 기존 레이아웃 구조 분석 후 통합 |
| 태그 자동완성 복잡도 | Low | Low | 기본 기능 우선, 자동완성은 선택 |
| 마크다운 미리보기 지연 | Low | Medium | debounce 적용, 캐싱 |

### 4.3 데이터 리스크

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|----------|
| 의존 문서 삭제 시 참조 무결성 | Medium | Medium | 삭제 전 의존성 체크 및 경고 |
| 저장 실패 시 데이터 손상 | Low | High | 백업 후 저장, 롤백 로직 |

---

## 5. 검증 계획 (Verification Plan)

### 5.1 API 테스트

```bash
# 시스템 문서 목록 조회
curl http://localhost:3001/api/projects/{projectId}/systems

# 시스템 문서 생성
curl -X POST http://localhost:3001/api/projects/{projectId}/systems \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Character System",
    "category": "System",
    "tags": ["core", "player"],
    "content": "# Character System\n\nThis is the character system.",
    "dependencies": []
  }'

# 시스템 문서 수정
curl -X PUT http://localhost:3001/api/projects/{projectId}/systems/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Character System v2"}'

# 시스템 문서 삭제
curl -X DELETE http://localhost:3001/api/projects/{projectId}/systems/{id}

# 카테고리 목록
curl http://localhost:3001/api/projects/{projectId}/systems/categories

# 태그 목록
curl http://localhost:3001/api/projects/{projectId}/systems/tags
```

### 5.2 UI 테스트 체크리스트

- [ ] 사이드바 표시/숨기기 동작
- [ ] 카테고리 펼치기/접기 동작
- [ ] 문서 검색 실시간 필터링
- [ ] 태그 필터 다중 선택
- [ ] 문서 생성 모달 열기/닫기
- [ ] 필수 필드 유효성 검사
- [ ] 마크다운 에디터 동작
- [ ] 문서 미리보기 동작
- [ ] 문서 수정 저장
- [ ] 삭제 확인 다이얼로그
- [ ] 프로젝트 전환 시 문서 목록 갱신

---

## 6. 다음 단계 (Next Steps)

### 6.1 후속 SPEC

| SPEC ID | 제목 | 의존성 |
|---------|------|--------|
| SPEC-REFERENCE-001 | 참조 시스템 선택 (E+A 패턴) | SPEC-SYSTEM-001 |
| SPEC-KANBAN-001 | 칸반 보드 UI | SPEC-PROJECT-001 |
| SPEC-TASK-001 | 태스크 관리 | SPEC-SYSTEM-001, SPEC-KANBAN-001 |
| SPEC-DISCOVERY-001 | 관련 시스템 자동 발견 | SPEC-SYSTEM-001, SPEC-TASK-001 |

### 6.2 구현 명령

```bash
# SPEC-SYSTEM-001 구현 시작
/moai:2-run SPEC-SYSTEM-001
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
