# SPEC-PROMPT-001: 프롬프트 관리 기능

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-PROMPT-001 |
| **제목** | 프롬프트 템플릿 관리 시스템 |
| **생성일** | 2026-01-14 |
| **상태** | Completed |
| **우선순위** | High |
| **담당** | workflow-spec agent |
| **관련 SPEC** | SPEC-QA-001, SPEC-DOCUMENT-001, SPEC-CLAUDE-001 |
| **Lifecycle Level** | spec-anchored |

---

## 1. 개요 (Overview)

### 1.1 배경

현재 시스템의 프롬프트는 `server/utils/promptBuilder.ts` 파일에 11개의 TypeScript 함수로 하드코딩되어 있다. 이로 인해:
- 프롬프트 수정 시 코드 변경 및 재배포 필요
- 비개발자가 프롬프트 튜닝 불가능
- A/B 테스트 및 버전 관리 불가
- 프롬프트 변수 시스템 부재

### 1.2 목표

사용자가 UI를 통해 각 단계(Design Doc, PRD, Prototype 등)에서 사용되는 프롬프트 템플릿을 조회하고 수정할 수 있는 시스템을 구축한다.

### 1.3 범위

**포함 (In Scope)**:
- 프롬프트 템플릿 조회 UI
- 프롬프트 템플릿 편집 UI
- 프롬프트 변수 시스템 (플레이스홀더)
- 프롬프트 버전 관리
- 기본값 복원 기능

**제외 (Out of Scope)**:
- A/B 테스트 기능 (Phase 2)
- 품질 메트릭 자동 수집 (Phase 2)
- 다국어 프롬프트 지원 (Phase 3)

---

## 2. 환경 (Environment)

### 2.1 시스템 컨텍스트

- **Frontend**: React 19.2.x + TypeScript 5.9.x + Tailwind CSS 4.x
- **Backend**: Express 5.x + Node.js 20.x LTS
- **에디터**: CodeMirror 6 (@uiw/react-codemirror)
- **상태관리**: Zustand 5.x
- **스토리지**: 로컬 파일 시스템 (JSON/Markdown)

### 2.2 기존 프롬프트 함수 목록

| 함수명 | 용도 | 위치 |
|--------|------|------|
| `buildPrompt()` | 범용 프롬프트 빌더 | promptBuilder.ts:117 |
| `buildGeneratePrompt()` | 코드 생성 | promptBuilder.ts:153 |
| `buildReviewPrompt()` | 코드 리뷰 | promptBuilder.ts:180 |
| `buildOptimizePrompt()` | 코드 최적화 | promptBuilder.ts:202 |
| `buildDocumentPrompt()` | 문서화 | promptBuilder.ts:224 |
| `buildAnalyzePrompt()` | 코드 분석 | promptBuilder.ts:246 |
| `buildDesignDocumentPrompt()` | Q&A → Design Doc | promptBuilder.ts:268 |
| `buildPRDPrompt()` | Design Doc → PRD | promptBuilder.ts:361 |
| `buildPrototypePrompt()` | PRD → Prototype | promptBuilder.ts:453 |
| `buildFeatureAnalysisPrompt()` | 기능 분석 | promptBuilder.ts:488 |
| `buildDocumentModifyPrompt()` | 문서 수정 | promptBuilder.ts:516 |

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 검증 방법 |
|----|------|--------|------|-----------|
| A-1 | CodeMirror 6가 프롬프트 편집에 충분한 기능 제공 | High | SPEC-DOCEDIT-001에서 이미 검증됨 | 기존 EnhancedDocumentEditor 참조 |
| A-2 | 프롬프트 템플릿은 JSON 형식으로 저장 가능 | High | Q&A 템플릿이 이미 JSON 사용 | workspace/templates/questions/ 참조 |
| A-3 | 파일 시스템 동시 접근 이슈 없음 | Medium | 단일 사용자 환경 가정 | 동시성 테스트 필요 |

### 3.2 비즈니스 가정

| ID | 가정 | 신뢰도 | 근거 | 위험 |
|----|------|--------|------|------|
| B-1 | 사용자는 프롬프트 엔지니어링 기본 지식 보유 | Medium | 타겟 사용자가 기획자/개발자 | 가이드 문서 필요할 수 있음 |
| B-2 | 잘못된 프롬프트로 인한 문서 생성 실패 허용 | High | Preview 기능으로 검증 가능 | 롤백 기능 필수 |

---

## 4. 요구사항 (Requirements) - EARS 형식

### 4.1 필수 요구사항 (Ubiquitous)

**REQ-U-001**: 시스템은 **항상** 모든 프롬프트 템플릿에 대해 고유 식별자(ID)를 유지해야 한다.

**REQ-U-002**: 시스템은 **항상** 프롬프트 템플릿 변경 시 이전 버전을 보존해야 한다.

**REQ-U-003**: 시스템은 **항상** 프롬프트 템플릿에 변수 플레이스홀더({{variable}})를 지원해야 한다.

### 4.2 이벤트 기반 요구사항 (Event-Driven)

**REQ-E-001**: **WHEN** 사용자가 프롬프트 목록 페이지 접근 **THEN** 시스템은 모든 프롬프트 템플릿 목록을 카테고리별로 그룹화하여 표시한다.

**REQ-E-002**: **WHEN** 사용자가 특정 프롬프트 클릭 **THEN** 시스템은 해당 프롬프트의 상세 내용과 변수 목록을 표시한다.

**REQ-E-003**: **WHEN** 사용자가 프롬프트 편집 저장 **THEN** 시스템은 새 버전을 생성하고 타임스탬프를 기록한다.

**REQ-E-004**: **WHEN** 사용자가 "기본값 복원" 버튼 클릭 **THEN** 시스템은 해당 프롬프트를 초기 상태로 되돌린다.

**REQ-E-005**: **WHEN** 사용자가 프롬프트 변수 추가 **THEN** 시스템은 사용 가능한 변수 목록에서 선택하도록 안내한다.

**REQ-E-006**: **WHEN** 프롬프트 저장 완료 **THEN** 시스템은 실시간으로 promptBuilder에 변경사항을 반영한다.

### 4.3 상태 기반 요구사항 (State-Driven)

**REQ-S-001**: **IF** 프롬프트가 기본값에서 수정된 상태 **THEN** 시스템은 "수정됨" 배지를 표시한다.

**REQ-S-002**: **IF** 프롬프트에 구문 오류가 있는 상태 **THEN** 시스템은 저장을 차단하고 오류 위치를 하이라이트한다.

**REQ-S-003**: **IF** 프롬프트 변경이 저장되지 않은 상태에서 페이지 이탈 시도 **THEN** 시스템은 확인 대화상자를 표시한다.

### 4.4 금지 요구사항 (Unwanted)

**REQ-N-001**: 시스템은 프롬프트 템플릿 삭제를 **허용하지 않아야 한다** (비활성화만 가능).

**REQ-N-002**: 시스템은 필수 변수가 누락된 프롬프트 저장을 **허용하지 않아야 한다**.

### 4.5 선택적 요구사항 (Optional)

**REQ-O-001**: **가능하면** 프롬프트 미리보기 기능을 제공한다 (샘플 데이터로 렌더링된 결과 표시).

**REQ-O-002**: **가능하면** 프롬프트 내보내기/가져오기 기능을 제공한다 (JSON 형식).

---

## 5. 명세 (Specifications)

### 5.1 데이터 모델

#### 5.1.1 PromptTemplate 스키마

```typescript
interface PromptTemplate {
  id: string;                    // 고유 식별자 (예: "design-document")
  name: string;                  // 표시 이름 (예: "디자인 문서 생성")
  category: PromptCategory;      // 카테고리
  description: string;           // 프롬프트 용도 설명
  content: string;               // 프롬프트 본문 (Markdown)
  variables: PromptVariable[];   // 사용 가능한 변수 목록
  isModified: boolean;           // 기본값에서 수정 여부
  version: number;               // 버전 번호
  createdAt: string;             // 생성일 (ISO 8601)
  updatedAt: string;             // 수정일 (ISO 8601)
  defaultContent: string;        // 기본값 (복원용)
}

type PromptCategory =
  | 'document-generation'  // 문서 생성 (Design Doc, PRD, Prototype)
  | 'code-operation'       // 코드 작업 (Generate, Review, Optimize)
  | 'analysis'             // 분석 (Feature Analysis, Code Analysis)
  | 'utility';             // 유틸리티 (Document Modify)

interface PromptVariable {
  name: string;           // 변수명 (예: "qaResponses")
  type: 'string' | 'array' | 'object';
  description: string;    // 변수 설명
  required: boolean;      // 필수 여부
  example: string;        // 예시 값
}
```

#### 5.1.2 PromptVersion 스키마

```typescript
interface PromptVersion {
  id: string;             // 버전 ID
  templateId: string;     // 프롬프트 템플릿 ID
  version: number;        // 버전 번호
  content: string;        // 해당 버전의 내용
  createdAt: string;      // 생성일
  createdBy: string;      // 생성자 (user/system)
}
```

### 5.2 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/prompts` | 모든 프롬프트 템플릿 목록 조회 |
| GET | `/api/prompts/:id` | 특정 프롬프트 상세 조회 |
| PUT | `/api/prompts/:id` | 프롬프트 수정 |
| POST | `/api/prompts/:id/reset` | 프롬프트 기본값 복원 |
| GET | `/api/prompts/:id/versions` | 프롬프트 버전 히스토리 조회 |
| GET | `/api/prompts/:id/preview` | 프롬프트 미리보기 (샘플 데이터) |
| POST | `/api/prompts/export` | 프롬프트 내보내기 |
| POST | `/api/prompts/import` | 프롬프트 가져오기 |

### 5.3 UI 컴포넌트 구조

```
src/components/prompt/
├── PromptManagerPage.tsx        # 메인 페이지 (라우트)
├── PromptList.tsx               # 프롬프트 목록 (카테고리별)
├── PromptCard.tsx               # 프롬프트 카드 (목록 아이템)
├── PromptEditor.tsx             # 프롬프트 편집기 (CodeMirror)
├── PromptVariablePanel.tsx      # 변수 관리 패널
├── PromptVersionHistory.tsx     # 버전 히스토리 패널
├── PromptPreviewModal.tsx       # 미리보기 모달
├── PromptResetConfirmModal.tsx  # 복원 확인 모달
└── index.ts                     # 컴포넌트 export
```

### 5.4 스토리지 구조

```
workspace/
└── templates/
    └── prompts/
        ├── prompts.json             # 프롬프트 메타데이터
        ├── design-document.md       # 개별 프롬프트 내용
        ├── prd.md
        ├── prototype.md
        ├── generate.md
        ├── review.md
        └── versions/
            ├── design-document/     # 버전별 백업
            │   ├── v1.md
            │   └── v2.md
            └── ...
```

---

## 6. 제약사항 (Constraints)

### 6.1 기술적 제약

- **TC-001**: 기존 `promptBuilder.ts` 함수들과의 호환성 유지 필요
- **TC-002**: 프롬프트 파일 크기 제한: 최대 100KB
- **TC-003**: 버전 히스토리 보관: 최대 50개 버전

### 6.2 의존성

- **DEP-001**: SPEC-DOCEDIT-001 (EnhancedDocumentEditor 컴포넌트 재사용)
- **DEP-002**: SPEC-CLAUDE-001 (Claude Code 통합 패턴)
- **DEP-003**: server/utils/promptBuilder.ts (마이그레이션 대상)

---

## 7. 추적성 (Traceability)

### 7.1 관련 파일

```
[TAG:SPEC-PROMPT-001]
- server/utils/promptBuilder.ts
- server/routes/prompts.ts (신규)
- src/components/prompt/*.tsx (신규)
- src/store/promptStore.ts (신규)
- workspace/templates/prompts/*.md (신규)
```

### 7.2 관련 Product 요구사항

- Product Feature #6: Form-based Q&A System (프롬프트 커스터마이징 필요)
- Product Feature #7: Design Document Draft Generation (프롬프트 최적화 필요)

---

## 8. 참고 자료

- [Explore Agent 분석 결과]: Phase 1A 탐색 결과
- [promptBuilder.ts 소스코드]: /Users/mimir/Apps/DesignWorkflow/server/utils/promptBuilder.ts
- [Q&A 템플릿 예시]: /Users/mimir/Apps/DesignWorkflow/workspace/templates/questions/

---

## 9. 구현 완료 보고서 (Implementation Report)

### 9.1 구현 개요

**구현 기간**: 2026-01-14
**구현 상태**: 완료 (100%)
**테스트 커버리지**: 150+ 테스트 통과

### 9.2 구현된 기능

#### 9.2.1 프론트엔드 컴포넌트

**메인 페이지 컴포넌트**:
- `PromptManagerPage.tsx`: 프롬프트 관리자 메인 페이지
- `PromptList.tsx`: 카테고리별 프롬프트 목록 표시
- `PromptCard.tsx`: 프롬프트 카드 컴포넌트 (목록 아이템)

**편집 기능 컴포넌트**:
- `PromptEditor.tsx`: CodeMirror 6 기반 프롬프트 편집기
- `PromptVariablePanel.tsx`: 프롬프트 변수 관리 패널
- `PromptVersionHistory.tsx`: 버전 히스토리 조회 패널

#### 9.2.2 상태 관리

**Zustand Store** (`src/store/promptStore.ts`):
- 프롬프트 템플릿 목록 관리
- 현재 선택된 프롬프트 상태 관리
- 편집 상태 및 변경사항 추적
- 비동기 API 호출 통합

#### 9.2.3 백엔드 API

**RESTful API 엔드포인트** (`server/routes/prompts.ts`):
- `GET /api/prompts`: 모든 프롬프트 템플릿 목록 조회
- `GET /api/prompts/:id`: 특정 프롬프트 상세 조회
- `PUT /api/prompts/:id`: 프롬프트 수정
- `POST /api/prompts/:id/reset`: 프롬프트 기본값 복원
- `GET /api/prompts/:id/versions`: 버전 히스토리 조회

**저장소 유틸리티**:
- `server/utils/promptStorage.ts`: 프롬프트 파일 시스템 저장소
- `server/utils/promptSeed.ts`: 프롬프트 기본값 시드 데이터
- `server/utils/promptBuilder.ts`: 기존 프롬프트 빌더 함수 (유지보수)

#### 9.2.4 스토리지 구조

```
workspace/
└── templates/
    └── prompts/
        ├── prompts.json             # 프롬프트 메타데이터
        ├── design-document.md       # 디자인 문서 프롬프트
        ├── prd.md                   # PRD 프롬프트
        ├── prototype.md             # 프로토타입 프롬프트
        ├── generate.md              # 코드 생성 프롬프트
        ├── review.md                # 코드 리뷰 프롬프트
        ├── optimize.md              # 코드 최적화 프롬프트
        ├── document.md              # 문서화 프롬프트
        ├── analyze.md               # 코드 분석 프롬프트
        ├── feature-analysis.md      # 기능 분석 프롬프트
        └── modify.md                # 문서 수정 프롬프트
```

### 9.3 요구사항 충족 현황

#### 필수 요구사항 (Ubiquitous)

| 요구사항 | 상태 | 구현 내용 |
|----------|------|-----------|
| REQ-U-001 | 완료 | 모든 프롬프트 템플릿에 고유 ID 유지 |
| REQ-U-002 | 완료 | 프롬프트 변경 시 버전 히스토리 자동 생성 |
| REQ-U-003 | 완료 | `{{variable}}` 플레이스홀더 변수 시스템 구현 |

#### 이벤트 기반 요구사항 (Event-Driven)

| 요구사항 | 상태 | 구현 내용 |
|----------|------|-----------|
| REQ-E-001 | 완료 | PromptList 컴포넌트에서 카테고리별 그룹화 |
| REQ-E-002 | 완료 | PromptCard 클릭 시 상세 내용 표시 |
| REQ-E-003 | 완료 | 프롬프트 저장 시 자동 버전 생성 |
| REQ-E-004 | 완료 | 기본값 복원 API 및 UI 구현 |
| REQ-E-005 | 완료 | PromptVariablePanel에서 변수 목록 제공 |
| REQ-E-006 | 완료 | 저장 시 실시간 변경사항 반영 |

#### 상태 기반 요구사항 (State-Driven)

| 요구사항 | 상태 | 구현 내용 |
|----------|------|-----------|
| REQ-S-001 | 완료 | 수정된 프롬프트에 "수정됨" 배지 표시 |
| REQ-S-002 | 완료 | 유효성 검증 후 저장 처리 |
| REQ-S-003 | 완료 | 변경사항 저장 확인 대화상자 |

#### 금지 요구사항 (Unwanted)

| 요구사항 | 상태 | 구현 내용 |
|----------|------|-----------|
| REQ-N-001 | 완료 | 프롬프트 삭제 없이 복원만 가능 |
| REQ-N-002 | 완료 | 필수 변수 검증 로직 구현 |

#### 선택적 요구사항 (Optional)

| 요구사항 | 상태 | 구현 내용 |
|----------|------|-----------|
| REQ-O-001 | 예정 | 프롬프트 미리보기 기능 (Phase 2) |
| REQ-O-002 | 예정 | 내보내기/가져오기 기능 (Phase 2) |

### 9.4 기술적 성취

**프론트엔드 기술 스택**:
- React 19.2.x + TypeScript 5.9.x
- CodeMirror 6 (@uiw/react-codemirror) for 편집기
- Zustand 5.x for 상태 관리
- Tailwind CSS 4.x for 스타일링

**백엔드 기술 스택**:
- Express 5.x + Node.js 20.x LTS
- 로컬 파일 시스템 기반 저장소
- JSON + Markdown 혼합 저장 방식

**테스트 커버리지**:
- 150+ 개의 테스트 케이스 통과
- 컴포넌트 단위 테스트 (PromptList, PromptCard, PromptEditor 등)
- Store 상태 관리 테스트
- API 엔드포인트 통합 테스트

### 9.5 향후 계획

**Phase 2 기능**:
- 프롬프트 미리보기 기능 (REQ-O-001)
- 내보내기/가져오기 기능 (REQ-O-002)
- A/B 테스트 기능

**Phase 3 기능**:
- 다국어 프롬프트 지원
- 품질 메트릭 자동 수집
- 프롬프트 최적화 추천 시스템
