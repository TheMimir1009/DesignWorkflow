# SPEC-REFERENCE-001: 참조 시스템 선택 (E+A 패턴)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-REFERENCE-001 |
| 제목 | 참조 시스템 선택 (Reference System Selection with E+A Pattern) |
| PRD Phase | Feature 3 |
| 생성일 | 2026-01-02 |
| 상태 | Planned |
| 우선순위 | High |
| 의존성 | SPEC-PROJECT-001 (완료), SPEC-SYSTEM-001 (가정: 시스템 문서 타입 및 스토어 정의됨) |
| 담당 에이전트 | expert-frontend, expert-backend |

---

## 1. 개요 (Overview)

### 1.1 배경

AI Workflow Kanban 시스템에서 새로운 기획 문서를 작성할 때 기존 시스템 문서(Character.md, Combat.md 등)를 참조해야 합니다. 사용자는 헤더 태그바와 접이식 사이드바를 통해 참조할 시스템 문서를 쉽게 선택하고 관리할 수 있어야 합니다. 이 기능은 E+A(Expand + Add) 패턴을 따르며, 헤더에서의 빠른 태그 관리와 사이드바에서의 상세 탐색을 모두 지원합니다.

### 1.2 목표

- 헤더에 선택된 참조 시스템 태그 표시 및 빠른 제거 기능
- 태그 추가 버튼 클릭 시 검색 드롭다운 표시
- 접이식 사이드바에서 체크박스 기반 시스템 선택
- 카테고리별 접기/펼치기 및 검색/태그 필터링
- 시스템 문서 미리보기 (눈 버튼)
- 프로젝트별 "기본 참조 시스템" 설정

### 1.3 범위

**포함**:
- 헤더 ReferenceTagBar 컴포넌트 (선택된 태그 표시)
- 시스템 문서 선택 사이드바 (SystemSidebar 확장)
- 검색 드롭다운 컴포넌트
- 시스템 문서 미리보기 모달
- referenceStore (Zustand 상태 관리)
- 기본 참조 시스템 API 엔드포인트

**제외**:
- 시스템 문서 CRUD (SPEC-SYSTEM-001에서 처리)
- 칸반 보드 연동 (SPEC-KANBAN-001에서 처리)
- 관련 시스템 자동 발견 (SPEC-DISCOVERY-001에서 처리)

---

## 2. 환경 (Environment)

### 2.1 기술 스택

**프론트엔드**:
- React 18.x
- TypeScript 5.x
- Zustand (상태 관리)
- Tailwind CSS 3.x

**백엔드**:
- Node.js 20.x LTS
- Express 4.x
- TypeScript 5.x

**저장소**:
- 파일 기반 저장 (workspace/projects/)
- JSON 메타데이터

### 2.2 기존 타입 정의

```typescript
// src/types/index.ts (기존 정의 활용)
export interface SystemDocument {
  id: string;
  projectId: string;
  name: string;
  category: string;
  tags: string[];
  content: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemDocumentState {
  documents: SystemDocument[];
  selectedDocumentIds: string[];
  isLoading: boolean;
  error: string | null;
}

// 신규 정의 필요
export interface ReferenceState {
  selectedReferences: string[];      // 현재 선택된 참조 시스템 ID 목록
  defaultReferences: string[];        // 프로젝트 기본 참조 시스템
  isLoading: boolean;
  error: string | null;
}
```

### 2.3 디렉토리 구조

```
src/
  components/
    system/
      SystemSidebar.tsx           # E+A 패턴 사이드바 (신규/확장)
      SystemList.tsx              # 카테고리별 시스템 목록 (확장)
      SystemCard.tsx              # 시스템 문서 카드 (확장)
      SystemPreview.tsx           # 시스템 문서 미리보기 모달 (신규)
      ReferenceTagBar.tsx         # 헤더 참조 태그바 (신규)
      ReferenceSearchDropdown.tsx # 검색 드롭다운 (신규)
    layout/
      Header.tsx                  # 헤더 (ReferenceTagBar 통합)
  store/
    systemStore.ts                # 시스템 문서 스토어 (확장)
    referenceStore.ts             # 참조 선택 스토어 (신규)

server/
  routes/
    systems.ts                    # 시스템 문서 API (확장)
    references.ts                 # 참조 설정 API (신규)
```

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [HIGH] SPEC-PROJECT-001 구현이 완료되어 프로젝트 선택 기능이 동작함
- [HIGH] 시스템 문서 타입(SystemDocument)이 정의되어 있음
- [MEDIUM] systemStore에 documents 배열과 selectedDocumentIds가 존재함
- [MEDIUM] 시스템 문서 API (/api/systems)가 구현되어 있거나 구현 예정임

### 3.2 비즈니스 가정

- [HIGH] 단일 프로젝트 내 시스템 문서 수는 100개 이하
- [MEDIUM] 카테고리 수는 10개 이하
- [LOW] 동시에 선택되는 참조 시스템은 20개 이하

### 3.3 사용자 가정

- [HIGH] 사용자는 시스템 문서의 카테고리와 태그 개념을 이해함
- [MEDIUM] 사용자는 드래그 없이 체크박스 클릭으로 선택하는 것을 선호함

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항 (EARS 형식)

#### FR-001: 헤더 참조 태그바

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 선택된 참조 시스템을 `[시스템명 x]` 형식의 태그로 표시해야 한다
- 시스템은 **항상** 태그바 우측에 `[+ Add]` 버튼을 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 태그의 x 버튼을 클릭하면 **THEN** 해당 참조 시스템이 선택 해제된다
- **WHEN** 사용자가 `[+ Add]` 버튼을 클릭하면 **THEN** ReferenceSearchDropdown이 표시된다
- **WHEN** 참조 시스템이 추가되면 **THEN** 태그바에 새 태그가 즉시 표시된다
- **WHEN** 참조 시스템이 제거되면 **THEN** 태그바에서 해당 태그가 즉시 사라진다

**State-Driven (IF-THEN)**:
- **IF** 선택된 참조 시스템이 없으면 **THEN** 태그바에 "참조 시스템을 선택하세요" placeholder를 표시한다
- **IF** 선택된 참조 시스템이 5개를 초과하면 **THEN** 초과분은 `+N more` 형태로 축약 표시한다

#### FR-002: 검색 드롭다운

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 검색어를 입력하면 **THEN** 시스템 문서 목록이 이름/태그 기준으로 필터링된다
- **WHEN** 사용자가 검색 결과의 시스템을 클릭하면 **THEN** 해당 시스템이 참조에 추가된다
- **WHEN** 사용자가 드롭다운 외부를 클릭하면 **THEN** 드롭다운이 닫힌다
- **WHEN** 사용자가 ESC 키를 누르면 **THEN** 드롭다운이 닫힌다

**State-Driven (IF-THEN)**:
- **IF** 검색 결과가 없으면 **THEN** "검색 결과가 없습니다" 메시지를 표시한다
- **IF** 시스템이 이미 선택되어 있으면 **THEN** 해당 항목에 체크 표시를 한다

**Unwanted (시스템은 하지 않아야 한다)**:
- 시스템은 검색어 입력 중 과도한 API 호출을 **하지 않아야 한다** (300ms 디바운스 적용)

#### FR-003: 접이식 사이드바 (SystemSidebar)

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 카테고리별로 시스템 문서를 그룹화하여 표시해야 한다
- 시스템은 **항상** 각 시스템 문서 옆에 체크박스를 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 카테고리 헤더를 클릭하면 **THEN** 해당 카테고리가 접히거나 펼쳐진다
- **WHEN** 사용자가 시스템 문서의 체크박스를 클릭하면 **THEN** 해당 시스템이 참조에 추가/제거된다
- **WHEN** 사용자가 사이드바 토글 버튼을 클릭하면 **THEN** 사이드바가 접히거나 펼쳐진다
- **WHEN** 사용자가 검색 입력란에 텍스트를 입력하면 **THEN** 시스템 목록이 필터링된다
- **WHEN** 사용자가 태그 필터를 선택하면 **THEN** 해당 태그를 가진 시스템만 표시된다

**State-Driven (IF-THEN)**:
- **IF** 현재 프로젝트가 없으면 **THEN** 사이드바에 "프로젝트를 선택하세요" 메시지를 표시한다
- **IF** 시스템 문서가 없으면 **THEN** "시스템 문서가 없습니다" 메시지를 표시한다
- **IF** 사이드바가 접힌 상태이면 **THEN** 아이콘만 표시되는 축소 모드로 전환한다

#### FR-004: 시스템 문서 미리보기

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 눈 아이콘 버튼을 클릭하면 **THEN** SystemPreview 모달이 열린다
- **WHEN** 사용자가 모달의 닫기 버튼이나 ESC를 누르면 **THEN** 모달이 닫힌다
- **WHEN** 사용자가 모달에서 "참조에 추가" 버튼을 클릭하면 **THEN** 해당 시스템이 참조에 추가된다

**State-Driven (IF-THEN)**:
- **IF** 시스템 문서 내용이 로딩 중이면 **THEN** 로딩 스피너를 표시한다
- **IF** 시스템이 이미 참조에 추가되어 있으면 **THEN** 버튼을 "이미 추가됨"으로 비활성화한다

#### FR-005: 기본 참조 시스템 설정

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 프로젝트의 defaultReferences를 로컬 저장소와 동기화해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 새 태스크가 생성되면 **THEN** 프로젝트의 기본 참조 시스템이 자동으로 적용된다
- **WHEN** 사용자가 "기본값으로 저장" 버튼을 클릭하면 **THEN** 현재 선택된 참조가 기본값으로 저장된다
- **WHEN** 사용자가 ProjectSettingsModal에서 기본 참조를 수정하면 **THEN** 변경사항이 저장된다

**State-Driven (IF-THEN)**:
- **IF** 프로젝트에 기본 참조가 설정되어 있으면 **THEN** 태스크 생성 시 자동 적용 안내를 표시한다

### 4.2 비기능 요구사항

#### NFR-001: 성능

- 시스템 문서 목록 로드: 500ms 이내
- 검색 결과 표시: 입력 후 300ms 이내 (디바운스 포함)
- 참조 추가/제거 UI 반영: 100ms 이내
- 사이드바 접기/펼치기 애니메이션: 200ms

#### NFR-002: 사용성

- 태그 클릭 영역은 최소 32x32px
- 체크박스 클릭 영역은 최소 40x40px
- 사이드바 너비: 펼침 시 280px, 접힘 시 48px
- 키보드 네비게이션 지원 (Tab, Enter, Escape)

#### NFR-003: 접근성

- ARIA 라벨 및 역할 적용
- 키보드만으로 모든 기능 접근 가능
- 포커스 인디케이터 명확히 표시

---

## 5. 제약사항 (Constraints)

### 5.1 기술적 제약

- Zustand 상태 관리 패턴 준수
- Express 서버를 통한 파일 I/O 필수
- 기존 Header.tsx 구조 유지하며 확장

### 5.2 UI 제약

- Tailwind CSS 유틸리티 클래스 사용
- 반응형 디자인 (최소 너비 1024px)
- 다크 테마 (bg-gray-900 기반) 유지

### 5.3 API 제약

- RESTful API 설계 원칙 준수
- JSON 응답 형식 표준화 (ApiResponse<T> 타입 사용)
- 에러 코드 표준화 (400, 404, 500)

---

## 6. 명세 (Specifications)

### 6.1 API 엔드포인트

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/projects/:projectId/systems | 시스템 문서 목록 조회 | - | ApiResponse<SystemDocument[]> |
| GET | /api/projects/:projectId/systems/:id | 시스템 문서 상세 조회 | - | ApiResponse<SystemDocument> |
| GET | /api/projects/:projectId/default-references | 기본 참조 시스템 조회 | - | ApiResponse<string[]> |
| PUT | /api/projects/:projectId/default-references | 기본 참조 시스템 설정 | { referenceIds: string[] } | ApiResponse<string[]> |

### 6.2 컴포넌트 명세

#### ReferenceTagBar.tsx

```typescript
interface ReferenceTagBarProps {
  onAddClick: () => void;
}

// Features:
// - 선택된 참조 시스템 태그 표시
// - 태그 x 버튼 클릭 시 제거
// - [+ Add] 버튼
// - 5개 초과 시 +N more 표시
```

#### ReferenceSearchDropdown.tsx

```typescript
interface ReferenceSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

// Features:
// - 검색 입력란
// - 필터링된 시스템 목록 표시
// - 선택 시 참조 추가
// - 외부 클릭 또는 ESC로 닫기
```

#### SystemSidebar.tsx

```typescript
interface SystemSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Features:
// - 카테고리별 접이식 목록
// - 체크박스 선택
// - 검색 및 태그 필터
// - 눈 버튼으로 미리보기
// - 접힘/펼침 토글
```

#### SystemPreview.tsx

```typescript
interface SystemPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  systemId: string;
}

// Features:
// - 시스템 문서 내용 미리보기 (마크다운 렌더링)
// - "참조에 추가" 버튼
// - ESC 또는 닫기 버튼으로 닫기
```

### 6.3 Zustand Store 명세

```typescript
// referenceStore.ts
interface ReferenceStore extends ReferenceState {
  // Actions
  addReference: (systemId: string) => void;
  removeReference: (systemId: string) => void;
  setReferences: (systemIds: string[]) => void;
  clearReferences: () => void;
  loadDefaultReferences: (projectId: string) => Promise<void>;
  saveAsDefault: (projectId: string) => Promise<void>;
  applyDefaultReferences: () => void;
}

// systemStore.ts 확장
interface SystemStore extends SystemDocumentState {
  // 기존 Actions...

  // 신규 Actions
  fetchSystems: (projectId: string) => Promise<void>;
  getSystemsByCategory: () => Record<string, SystemDocument[]>;
  searchSystems: (query: string) => SystemDocument[];
  filterByTags: (tags: string[]) => SystemDocument[];
}
```

### 6.4 UI 레이아웃 명세

```
+------------------------------------------------------------------+
|  [Logo]  |  [ProjectSelector]  |  [ReferenceTagBar]  |  [Menu]   | <- Header
|          |                     |  [Char x][Combat x][+ Add]      |
+------------------------------------------------------------------+
|  [<<]  |                                                          |
| -------|                                                          |
| Search |                                                          |
| -------|                                                          |
| [v] Category A                                                    |
|   [ ] System 1 [eye]                                              |
|   [x] System 2 [eye]                                              |
| [>] Category B                                                    |
| -------|                     Main Content Area                    |
| Tags:  |                                                          |
| [tag1][tag2]                                                      |
| -------|                                                          |
| [Save as Default]                                                 |
+--------+----------------------------------------------------------+
  Sidebar (280px / 48px)
```

---

## 7. 추적성 (Traceability)

### 7.1 PRD 매핑

| 요구사항 | PRD 항목 | 수락 기준 |
|----------|----------|-----------|
| FR-001 | Feature 3 - 헤더 태그 표시 | AC-001 ~ AC-003 |
| FR-002 | Feature 3 - [+ Add] 검색 드롭다운 | AC-004 ~ AC-006 |
| FR-003 | Feature 3 - 사이드바 체크박스 선택 | AC-007 ~ AC-010 |
| FR-004 | Feature 3 - 눈 버튼 미리보기 | AC-011, AC-012 |
| FR-005 | Feature 3 - 기본 참조 설정 | AC-013, AC-014 |

### 7.2 파일 매핑

| 컴포넌트 | 파일 경로 | 담당 |
|----------|-----------|------|
| ReferenceTagBar | src/components/system/ReferenceTagBar.tsx | expert-frontend |
| ReferenceSearchDropdown | src/components/system/ReferenceSearchDropdown.tsx | expert-frontend |
| SystemSidebar | src/components/system/SystemSidebar.tsx | expert-frontend |
| SystemPreview | src/components/system/SystemPreview.tsx | expert-frontend |
| referenceStore | src/store/referenceStore.ts | expert-frontend |
| systemStore | src/store/systemStore.ts | expert-frontend |
| Header (확장) | src/components/layout/Header.tsx | expert-frontend |
| systems route | server/routes/systems.ts | expert-backend |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
