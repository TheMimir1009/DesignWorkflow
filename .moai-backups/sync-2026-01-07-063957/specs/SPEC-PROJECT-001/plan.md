# SPEC-PROJECT-001: 구현 계획 (Implementation Plan)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-PROJECT-001 |
| 제목 | 프로젝트(게임) 관리 기능 구현 계획 |
| 생성일 | 2026-01-02 |
| 관련 SPEC | SPEC-PROJECT-001/spec.md |

---

## 1. 마일스톤 (Milestones)

### Primary Goal: Backend API 구현 (Phase 2.1 Backend)

**목표**: Express 기반 프로젝트 CRUD API 엔드포인트 구현

**구현 태스크**:

1. 패키지 의존성 설치
   - uuid 패키지 설치 (프로젝트 ID 생성용)
   - 명령어: `npm install uuid && npm install -D @types/uuid`

2. server/routes/projects.ts 구현
   - GET /api/projects - 프로젝트 목록 조회
   - GET /api/projects/:id - 프로젝트 상세 조회
   - POST /api/projects - 프로젝트 생성
   - PUT /api/projects/:id - 프로젝트 수정
   - DELETE /api/projects/:id - 프로젝트 삭제

3. 파일 시스템 유틸리티 구현
   - workspace/projects/ 디렉토리 관리
   - project.json 읽기/쓰기
   - 프로젝트 디렉토리 구조 초기화

4. server/index.ts 라우트 등록
   - /api/projects 라우트 추가
   - CORS 및 JSON 미들웨어 설정

**완료 기준**:
- 모든 API 엔드포인트가 정상 동작
- Postman/curl로 테스트 가능
- 에러 처리 및 응답 형식 표준화

---

### Secondary Goal: 상태 관리 구현 (Phase 2.1 State)

**목표**: Zustand 기반 프로젝트 상태 관리 구현

**구현 태스크**:

1. Zustand 패키지 설치 확인
   - 없을 경우: `npm install zustand`

2. src/store/projectStore.ts 구현
   - ProjectStore 인터페이스 구현
   - fetchProjects: API 호출 및 상태 업데이트
   - createProject: 프로젝트 생성 및 자동 선택
   - updateProject: 프로젝트 수정
   - deleteProject: 프로젝트 삭제 및 자동 선택
   - selectProject: 현재 프로젝트 설정
   - currentProject: computed getter

3. src/services/projectService.ts 구현
   - API 호출 함수 (axios 또는 fetch)
   - 타입 안전한 응답 처리
   - 에러 핸들링

**완료 기준**:
- Store 액션이 API와 정상 연동
- 상태 변경이 컴포넌트에 반영
- 에러 상태 관리 동작

---

### Tertiary Goal: 프로젝트 선택 UI (Phase 2.2)

**목표**: 헤더 드롭다운 기반 프로젝트 선택기 구현

**구현 태스크**:

1. src/components/project/ProjectSelector.tsx 구현
   - 드롭다운 UI (Tailwind CSS)
   - 프로젝트 목록 표시
   - 현재 선택 프로젝트 표시
   - 프로젝트 없음 상태 처리

2. src/components/layout/Header.tsx 수정
   - ProjectSelector 컴포넌트 통합
   - 레이아웃 조정

3. 키보드 네비게이션 구현
   - ESC로 드롭다운 닫기
   - 화살표 키로 항목 이동
   - Enter로 선택

**완료 기준**:
- 드롭다운이 정상 동작
- 프로젝트 전환 시 상태 업데이트
- 키보드 접근성 지원

---

### Fourth Goal: 프로젝트 생성 모달 (Phase 2.1 UI)

**목표**: 새 프로젝트 생성 모달 구현

**구현 태스크**:

1. src/components/project/ProjectCreateModal.tsx 구현
   - 모달 레이아웃 (Tailwind CSS)
   - 폼 필드: name (필수), description, techStack, categories
   - 유효성 검사
   - 제출 처리

2. 기술 스택 입력 컴포넌트
   - TagInput 형태로 여러 기술 추가
   - 자주 사용되는 기술 추천 (엔진, 서버 등)

3. 카테고리 입력 컴포넌트
   - TagInput 형태로 카테고리 추가
   - 기본 카테고리 추천 (시스템, 콘텐츠, UI 등)

4. ProjectSelector에 "새 프로젝트" 버튼 추가
   - 버튼 클릭 시 모달 열기

**완료 기준**:
- 모달이 정상적으로 열리고 닫힘
- 유효성 검사 동작
- 프로젝트 생성 후 자동 선택

---

### Fifth Goal: 프로젝트 설정/삭제 (Phase 2.3)

**목표**: 프로젝트 설정 수정 및 삭제 기능 구현

**구현 태스크**:

1. src/components/project/ProjectSettingsModal.tsx 구현
   - 탭 구조: 기본 정보 | 기술 스택 | 카테고리 | 위험 영역
   - 기존 정보 로드 및 수정
   - 저장 버튼 (변경사항 있을 때만 활성화)

2. 삭제 기능 구현
   - ConfirmDialog 사용
   - 삭제 확인 메시지 (프로젝트명 입력 요구)
   - 관련 데이터 삭제 처리

3. ProjectSelector에 설정 버튼 추가
   - 기어 아이콘
   - 버튼 클릭 시 설정 모달 열기

4. Toast 알림 구현
   - 저장 성공/실패 메시지
   - 삭제 성공 메시지

**완료 기준**:
- 설정 모달이 정상 동작
- 프로젝트 수정 후 상태 업데이트
- 삭제 확인 및 데이터 정리

---

## 2. 기술적 접근 방식 (Technical Approach)

### 2.1 Backend API 구조

```typescript
// server/routes/projects.ts
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace', 'projects');

// GET /api/projects
router.get('/', async (req, res) => {
  // workspace/projects/ 디렉토리 스캔
  // 각 project.json 읽어서 배열로 반환
});

// POST /api/projects
router.post('/', async (req, res) => {
  // 1. UUID 생성
  // 2. 디렉토리 구조 생성
  // 3. project.json 저장
  // 4. 빈 하위 폴더 생성 (systems, tasks, archives)
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  // 1. 프로젝트 존재 확인
  // 2. project.json 업데이트
  // 3. updatedAt 갱신
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  // 1. 프로젝트 존재 확인
  // 2. 전체 프로젝트 디렉토리 삭제 (재귀)
});

export default router;
```

### 2.2 Zustand Store 구조

```typescript
// src/store/projectStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as projectService from '../services/projectService';

interface ProjectStore {
  // State
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectDto) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string) => void;

  // Computed
  get currentProject(): Project | null;
}

export const useProjectStore = create<ProjectStore>()(
  devtools((set, get) => ({
    projects: [],
    currentProjectId: null,
    isLoading: false,
    error: null,

    fetchProjects: async () => {
      set({ isLoading: true, error: null });
      try {
        const projects = await projectService.getProjects();
        set({ projects, isLoading: false });
        // 첫 번째 프로젝트 자동 선택
        if (projects.length > 0 && !get().currentProjectId) {
          set({ currentProjectId: projects[0].id });
        }
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    // ... 기타 액션 구현
  }))
);
```

### 2.3 컴포넌트 구조

```
ProjectSelector (드롭다운)
├── 현재 프로젝트 표시
├── 드롭다운 메뉴
│   ├── 프로젝트 목록
│   ├── 구분선
│   └── "새 프로젝트" 버튼
└── 설정 버튼 (기어 아이콘)

ProjectCreateModal
├── 헤더: "새 프로젝트 만들기"
├── 폼
│   ├── 이름 입력 (필수)
│   ├── 설명 입력 (선택)
│   ├── 기술 스택 태그 입력
│   └── 카테고리 태그 입력
└── 푸터: 취소 | 생성

ProjectSettingsModal
├── 헤더: "{프로젝트명} 설정"
├── 탭 네비게이션
│   ├── 기본 정보 탭
│   ├── 기술 스택 탭
│   ├── 카테고리 탭
│   └── 위험 영역 탭 (삭제)
└── 푸터: 취소 | 저장
```

### 2.4 파일 저장 구조

프로젝트 생성 시 초기화되는 디렉토리 구조:

```
workspace/projects/{project_id}/
├── project.json
│   {
│     "id": "uuid",
│     "name": "Project Name",
│     "description": "",
│     "techStack": [],
│     "categories": [],
│     "defaultReferences": [],
│     "createdAt": "ISO8601",
│     "updatedAt": "ISO8601"
│   }
├── RootRule.md (빈 파일)
├── systems/
│   └── systems.json (빈 배열 [])
├── tasks/
└── archives/
```

---

## 3. 아키텍처 설계 방향 (Architecture Design)

### 3.1 데이터 흐름

```
User Action
    ↓
React Component (ProjectSelector/Modal)
    ↓
Zustand Store Action
    ↓
Service Layer (projectService.ts)
    ↓
Express API (/api/projects)
    ↓
File System (workspace/projects/)
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
    └── Header.tsx
        └── ProjectSelector.tsx
            ├── ProjectCreateModal.tsx
            └── ProjectSettingsModal.tsx
                └── ConfirmDialog.tsx (common)
```

### 3.3 에러 처리 전략

**Frontend**:
- try-catch 블록으로 API 호출 감싸기
- Zustand store에 error 상태 관리
- Toast 컴포넌트로 사용자 알림

**Backend**:
- 표준화된 에러 응답 (ApiResponse 형식)
- HTTP 상태 코드: 400 (잘못된 요청), 404 (찾을 수 없음), 500 (서버 오류)
- 상세 에러 메시지 포함

---

## 4. 리스크 및 대응 방안 (Risks and Mitigations)

### 4.1 기술적 리스크

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|----------|
| Zustand 미설치 | Low | Medium | 구현 전 패키지 확인 및 설치 |
| 파일 시스템 권한 문제 | Low | High | workspace 디렉토리 권한 확인 |
| 동시 파일 접근 충돌 | Low | Medium | 단일 사용자 환경으로 제한 |

### 4.2 UI/UX 리스크

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|----------|
| 드롭다운 외부 클릭 처리 | Medium | Low | useClickOutside 훅 구현 |
| 키보드 접근성 미지원 | Low | Medium | 표준 키보드 이벤트 핸들링 |
| 폼 유효성 검사 누락 | Low | Medium | 단계별 검증 구현 |

### 4.3 데이터 리스크

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|----------|
| 프로젝트 삭제 시 데이터 유실 | Low | High | 삭제 확인 다이얼로그 필수화 |
| 저장 실패 시 데이터 손상 | Low | High | 임시 파일 작성 후 교체 |

---

## 5. 검증 계획 (Verification Plan)

### 5.1 API 테스트

```bash
# 프로젝트 목록 조회
curl http://localhost:3001/api/projects

# 프로젝트 생성
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Test"}'

# 프로젝트 수정
curl -X PUT http://localhost:3001/api/projects/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# 프로젝트 삭제
curl -X DELETE http://localhost:3001/api/projects/{id}
```

### 5.2 UI 테스트 체크리스트

- [ ] 프로젝트 없을 때 빈 상태 메시지 표시
- [ ] 드롭다운 열기/닫기 동작
- [ ] 프로젝트 선택 시 상태 업데이트
- [ ] 새 프로젝트 모달 열기/닫기
- [ ] 필수 필드 유효성 검사
- [ ] 프로젝트 생성 후 자동 선택
- [ ] 설정 모달 열기/닫기
- [ ] 프로젝트 수정 저장
- [ ] 삭제 확인 다이얼로그
- [ ] 삭제 후 다른 프로젝트 자동 선택

---

## 6. 다음 단계 (Next Steps)

### 6.1 후속 SPEC

| SPEC ID | 제목 | 의존성 |
|---------|------|--------|
| SPEC-SYSTEM-001 | 시스템 문서 관리 | SPEC-PROJECT-001 |
| SPEC-KANBAN-001 | 칸반 보드 UI | SPEC-PROJECT-001 |
| SPEC-TASK-001 | 태스크 관리 | SPEC-PROJECT-001, SPEC-KANBAN-001 |

### 6.2 구현 명령

```bash
# SPEC-PROJECT-001 구현 시작
/moai:2-run SPEC-PROJECT-001
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
