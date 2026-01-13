# SPEC-DOCUMENT-001: 문서 생성 및 편집 파이프라인

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-DOCUMENT-001 |
| 제목 | Document Generation and Editing Pipeline |
| 상태 | Completed |
| 우선순위 | HIGH |
| 생성일 | 2026-01-07 |
| 관련 기능 | PRD Feature 7 - 설계문서 초안 생성 및 편집 |
| 담당 에이전트 | code-frontend |
| 의존성 | SPEC-QA-001 (Q&A 시스템), SPEC-TASK-001 (태스크 관리) |

---

## 개요

### 배경

AI Workflow Kanban 프로젝트의 핵심 워크플로우 중 하나인 "설계문서 초안 생성 및 편집" 기능을 구현합니다. Q&A 답변 기반으로 AI가 생성한 설계문서 초안을 사용자가 직접 편집하거나 AI 수정 요청을 통해 개선할 수 있는 완전한 문서 편집 파이프라인을 제공합니다.

### 목표

1. AI 생성 문서의 미리보기 및 직접 편집 기능 제공
2. AI 수정 요청을 통한 반복적 문서 개선 지원
3. 문서 버전 히스토리 관리 및 추적
4. 승인 워크플로우를 통한 다음 단계 진행

---

## 요구사항 (EARS 형식)

### REQ-DOC-001: 문서 미리보기 (Ubiquitous)

시스템은 **항상** 마크다운 형식의 설계문서를 렌더링된 형태로 미리보기를 제공해야 한다.

**근거**: 사용자가 생성된 문서의 최종 형태를 확인할 수 있어야 함
**검증 방법**: react-markdown + remark-gfm을 사용한 렌더링 테스트

### REQ-DOC-002: 직접 편집 모드 (Event-Driven)

**WHEN** 사용자가 "직접 편집" 버튼을 클릭 **THEN** 시스템은 마크다운 에디터를 활성화하여 문서 내용을 직접 수정할 수 있게 해야 한다.

**근거**: 사용자가 AI 생성 내용을 즉시 수정할 수 있어야 함
**검증 방법**: 편집 모드 전환 및 내용 저장 테스트

### REQ-DOC-003: AI 수정 요청 모드 (Event-Driven)

**WHEN** 사용자가 수정 요청 텍스트를 입력하고 "수정 요청" 버튼을 클릭 **THEN** 시스템은 Claude Code Headless를 호출하여 요청에 따라 문서를 수정해야 한다.

**근거**: 사용자가 자연어로 수정 방향을 지시할 수 있어야 함
**검증 방법**: 수정 요청 전송 및 응답 처리 테스트

### REQ-DOC-004: 버전 히스토리 관리 (Ubiquitous)

시스템은 **항상** 문서의 모든 수정 이력을 버전 히스토리로 저장하고 조회할 수 있게 해야 한다.

**근거**: 변경 추적 및 이전 버전 복원 필요
**검증 방법**: 버전 목록 조회 및 복원 테스트

### REQ-DOC-005: 버전 비교 (Event-Driven)

**WHEN** 사용자가 버전 히스토리에서 특정 버전을 선택 **THEN** 시스템은 현재 버전과의 차이점을 시각적으로 표시해야 한다.

**근거**: 변경 사항을 명확히 파악할 수 있어야 함
**검증 방법**: diff 표시 기능 테스트

### REQ-DOC-006: 문서 승인 (Event-Driven)

**WHEN** 사용자가 "승인" 버튼을 클릭 **THEN** 시스템은 현재 문서를 최종 확정하고 다음 칸반 단계로 진행할 수 있게 해야 한다.

**근거**: 검토 완료 후 워크플로우 진행 필요
**검증 방법**: 승인 후 태스크 상태 변경 테스트

### REQ-DOC-007: 분할 뷰 지원 (State-Driven)

**IF** 편집 모드가 활성화된 상태 **THEN** 시스템은 에디터(좌측)와 미리보기(우측)를 분할 뷰로 동시에 표시해야 한다.

**근거**: 편집과 동시에 결과를 확인할 수 있어야 함
**검증 방법**: 분할 뷰 레이아웃 렌더링 테스트

### REQ-DOC-008: 로딩 상태 표시 (State-Driven)

**IF** AI 문서 생성 또는 수정이 진행 중인 상태 **THEN** 시스템은 로딩 인디케이터를 표시하고 사용자 입력을 비활성화해야 한다.

**근거**: 진행 상태를 명확히 전달하고 중복 요청 방지
**검증 방법**: 로딩 상태 UI 테스트

### REQ-DOC-009: 저장되지 않은 변경 경고 (Unwanted Behavior)

시스템은 저장되지 않은 변경 사항이 있을 때 사용자가 페이지를 떠나는 것을 **허용하지 않아야 한다** (확인 없이).

**근거**: 작업 내용 손실 방지
**검증 방법**: 브라우저 이탈 시 경고 다이얼로그 테스트

### REQ-DOC-010: 자동 저장 (Optional)

**가능하면** 시스템은 편집 중인 내용을 주기적으로 자동 저장하여 데이터 손실을 방지해야 한다.

**근거**: 사용자 편의성 향상
**검증 방법**: 자동 저장 간격 및 복구 테스트

---

## 기술 명세

### 컴포넌트 구조

```
/src/components/document/
├── DocumentPreview.tsx      # 마크다운 렌더링 미리보기 (신규)
├── DocumentEditor.tsx       # 분할 뷰 편집기 (신규)
├── RevisionPanel.tsx        # AI 수정 요청 패널 (신규)
├── VersionHistory.tsx       # 버전 히스토리 관리 (신규)
├── QAFormModal.tsx          # Q&A 폼 (기존)
├── CategorySelector.tsx     # 카테고리 선택기 (기존)
├── QuestionStep.tsx         # 질문 단계 (기존)
└── ProgressIndicator.tsx    # 진행 표시기 (기존)
```

### 컴포넌트 세부 명세

#### 1. DocumentPreview.tsx

**목적**: 마크다운 문서를 렌더링된 HTML로 표시

**Props 인터페이스**:
```typescript
interface DocumentPreviewProps {
  content: string;
  className?: string;
  showLineNumbers?: boolean;
}
```

**주요 기능**:
- react-markdown + remark-gfm 기반 렌더링
- 코드 블록 구문 강조
- 반응형 레이아웃

#### 2. DocumentEditor.tsx

**목적**: 분할 뷰 마크다운 편집기

**Props 인터페이스**:
```typescript
interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onApprove: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}
```

**주요 기능**:
- 좌측: MarkdownEditor (raw 편집)
- 우측: DocumentPreview (실시간 미리보기)
- 저장/승인 버튼
- 편집/미리보기 모드 전환

#### 3. RevisionPanel.tsx

**목적**: AI 수정 요청 입력 및 처리

**Props 인터페이스**:
```typescript
interface RevisionPanelProps {
  taskId: string;
  currentContent: string;
  onRevisionComplete: (newContent: string) => void;
  isLoading?: boolean;
}
```

**주요 기능**:
- 수정 요청 텍스트 입력 (textarea)
- 수정 요청 제출 버튼
- 로딩 상태 표시
- 에러 처리 및 재시도

#### 4. VersionHistory.tsx

**목적**: 문서 버전 히스토리 관리

**Props 인터페이스**:
```typescript
interface VersionHistoryProps {
  taskId: string;
  documentType: 'design' | 'prd' | 'prototype';
  onVersionSelect: (version: Revision) => void;
  onRestore: (version: Revision) => void;
}
```

**주요 기능**:
- 버전 목록 표시 (시간순)
- 버전 간 diff 비교
- 이전 버전 복원
- 현재 버전 표시

### 상태 관리

기존 `taskStore.ts`에 다음 상태/액션 추가:

```typescript
interface DocumentEditorState {
  editMode: 'preview' | 'edit' | 'revision';
  unsavedChanges: boolean;
  currentVersion: number;
  isRevisionLoading: boolean;
}

interface DocumentEditorActions {
  setEditMode: (mode: 'preview' | 'edit' | 'revision') => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  submitRevision: (taskId: string, feedback: string) => Promise<void>;
  approveDocument: (taskId: string) => Promise<void>;
  restoreVersion: (taskId: string, version: number) => Promise<void>;
}
```

### 의존성

**기존 활용**:
- `MarkdownEditor.tsx` - 마크다운 입력 컴포넌트
- `taskStore.ts` - 태스크 상태 관리
- `claudeCodeService.ts` - AI 호출 (스텁 가능)

**신규 의존성 없음** (기존 패키지 활용):
- react-markdown (설치됨)
- remark-gfm (설치됨)

---

## 제약사항

### 기술적 제약

1. **기존 컴포넌트 패턴 준수**: 프로젝트의 기존 컴포넌트 구조 및 스타일링 패턴 유지
2. **Zustand 스토어 패턴**: 기존 스토어 구조와 일관성 유지
3. **Tailwind CSS**: 기존 스타일링 방식 준수
4. **TypeScript Strict Mode**: 타입 안전성 보장

### 비즈니스 제약

1. **Claude Code Headless 의존**: AI 수정 기능은 claudeCodeService에 의존 (초기 스텁 가능)
2. **파일 시스템 기반 저장**: workspace 디렉토리에 문서 저장

---

## 추적성 태그

| 관련 항목 | 참조 |
|----------|------|
| PRD 요구사항 | product.md Feature 7 |
| 구조 명세 | structure.md /src/components/document/ |
| 기술 스택 | tech.md React 18.x, TypeScript 5.x |
| 의존 SPEC | SPEC-QA-001, SPEC-TASK-001 |
| 테스트 명세 | acceptance.md |
| 구현 계획 | plan.md |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-07 | workflow-spec | 초기 SPEC 작성 |
| 1.0.0 | 2026-01-07 | Completed | Implementation completed with 81 passing tests |
