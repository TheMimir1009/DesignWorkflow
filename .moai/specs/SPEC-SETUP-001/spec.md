# SPEC-SETUP-001: 개발 환경 구축 (Part A)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SETUP-001 |
| 제목 | AI Workflow Kanban - 개발 환경 구축 |
| 상태 | Completed |
| 우선순위 | High |
| 생성일 | 2026-01-02 |
| 범위 | PRD Phase 1.1 - 1.4 |
| 태그 | `setup`, `environment`, `typescript`, `vite`, `react` |

---

## 1. 개요 (Overview)

### 1.1 목적

AI Workflow Kanban 프로젝트의 개발 환경을 구축한다. Vite + React + TypeScript 기반의 프론트엔드 프로젝트를 초기화하고, 핵심 타입 정의 및 디렉토리 구조를 설정한다.

### 1.2 범위

PRD의 Part A (Phase 1.1 - 1.4)에 해당하는 개발 환경 구축 작업:
- Phase 1.1: 프로젝트 초기화 (Vite + React + TypeScript + Tailwind CSS)
- Phase 1.2: CLAUDE.md 작성
- Phase 1.3: 디렉토리 구조 생성
- Phase 1.4: TypeScript 타입 정의

### 1.3 이해관계자

- 개발자: 개발 환경 설정 및 구현
- 기획자: 칸반 워크플로우 활용

---

## 2. 환경 (Environment)

### 2.1 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 20.x LTS | 런타임 환경 |
| React | 18.x | UI 컴포넌트 라이브러리 |
| Vite | Latest | 빌드 도구 및 개발 서버 |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 3.x | 유틸리티 기반 CSS 프레임워크 |

### 2.2 사전 요구사항

- Node.js 20.x LTS 설치
- npm 또는 yarn 패키지 매니저
- Claude Code CLI 설치

### 2.3 개발 환경

- OS: macOS, Windows, Linux
- IDE: VS Code 권장 (Claude Code 통합)
- 터미널: bash, zsh, PowerShell

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [ASM-001] Node.js 20.x LTS가 개발 환경에 설치되어 있다
  - 신뢰도: High
  - 근거: PRD 요구사항에 명시됨
  - 검증 방법: `node --version` 명령으로 확인

- [ASM-002] Vite는 React + TypeScript 템플릿을 지원한다
  - 신뢰도: High
  - 근거: Vite 공식 문서에서 지원 확인
  - 검증 방법: `npm create vite@latest` 실행

- [ASM-003] Tailwind CSS 3.x는 Vite와 호환된다
  - 신뢰도: High
  - 근거: Tailwind CSS 공식 문서에서 Vite 가이드 제공
  - 검증 방법: 공식 설치 가이드 따름

### 3.2 비즈니스 가정

- [ASM-004] 개발자는 React 및 TypeScript 기본 지식을 보유한다
  - 신뢰도: Medium
  - 근거: 타겟 사용자 정의

---

## 4. 요구사항 (Requirements)

### 4.1 Ubiquitous Requirements (항상 활성)

- [REQ-U-001] 시스템은 **항상** TypeScript strict mode를 사용해야 한다
  - WHY: 타입 안전성 보장 및 런타임 오류 방지
  - IMPACT: 개발 시 타입 오류 조기 발견

- [REQ-U-002] 시스템은 **항상** ESLint 및 Prettier 설정을 포함해야 한다
  - WHY: 코드 품질 및 일관성 유지
  - IMPACT: 팀 협업 시 코드 스타일 충돌 방지

### 4.2 Event-Driven Requirements (이벤트 기반)

- [REQ-E-001] **WHEN** `npm run dev` 명령 실행 **THEN** Vite 개발 서버가 시작되어 브라우저에서 애플리케이션 접근 가능해야 한다
  - WHY: 개발 중 실시간 미리보기 필요
  - IMPACT: 개발 생산성 향상

- [REQ-E-002] **WHEN** 프로젝트 초기화 완료 **THEN** 브라우저에 "AI Workflow Kanban" 텍스트가 표시되어야 한다
  - WHY: 프로젝트 초기화 성공 확인
  - IMPACT: 개발 환경 정상 동작 검증

- [REQ-E-003] **WHEN** TypeScript 컴파일 실행 **THEN** 타입 오류 없이 컴파일 완료되어야 한다
  - WHY: 타입 정의 정확성 확인
  - IMPACT: 런타임 오류 방지

### 4.3 State-Driven Requirements (조건 기반)

- [REQ-S-001] **IF** 개발 환경 **THEN** Hot Module Replacement (HMR)이 활성화되어야 한다
  - WHY: 코드 변경 시 빠른 반영 필요
  - IMPACT: 개발 속도 향상

- [REQ-S-002] **IF** TypeScript 파일 수정 **THEN** 실시간 타입 검사가 수행되어야 한다
  - WHY: 타입 오류 즉시 피드백
  - IMPACT: 디버깅 시간 단축

### 4.4 Optional Requirements (선택적)

- [REQ-O-001] **가능하면** VS Code 확장 프로그램 권장 목록을 제공한다
  - WHY: 개발 환경 일관성
  - IMPACT: 팀원 온보딩 시간 단축

### 4.5 Unwanted Requirements (금지)

- [REQ-N-001] 시스템은 동기적 파일 I/O (`fs.readFileSync` 등)를 사용**하지 않아야 한다**
  - WHY: 블로킹 연산 방지
  - IMPACT: 서버 응답성 유지

---

## 5. 명세 (Specifications)

### 5.1 Phase 1.1: 프로젝트 초기화

#### 5.1.1 프로젝트 생성

```bash
npm create vite@latest ai-workflow-kanban -- --template react-ts
cd ai-workflow-kanban
npm install
```

#### 5.1.2 Tailwind CSS 설치 및 설정

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 5.1.3 Tailwind 설정 파일 (tailwind.config.js)

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### 5.1.4 기본 App.tsx

```typescript
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">
        AI Workflow Kanban
      </h1>
    </div>
  )
}

export default App
```

### 5.2 Phase 1.2: CLAUDE.md 작성

#### 5.2.1 필수 섹션

| 섹션 | 내용 |
|------|------|
| Project Context | 프로젝트 개요 및 목적 |
| Tech Stack | 기술 스택 요약 |
| Architecture Overview | 아키텍처 다이어그램 |
| Key Directories | 주요 디렉토리 설명 |
| Commands | 실행 명령어 목록 |
| Coding Standards | 코딩 규칙 |
| Do Not | 금지 사항 |

### 5.3 Phase 1.3: 디렉토리 구조

#### 5.3.1 생성할 디렉토리

```
/ai-workflow-kanban
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── project/
│   │   ├── system/
│   │   ├── kanban/
│   │   ├── task/
│   │   ├── document/
│   │   ├── archive/
│   │   └── common/
│   ├── services/
│   ├── prompts/
│   ├── types/
│   └── store/
├── server/
│   ├── routes/
│   └── utils/
└── workspace/  (gitignore에 추가)
    ├── projects/
    └── templates/
        └── questions/
```

#### 5.3.2 .gitignore 설정

```
node_modules/
dist/
workspace/
.env
*.local
```

### 5.4 Phase 1.4: TypeScript 타입 정의

#### 5.4.1 핵심 타입 (src/types/index.ts)

```typescript
// Project (게임 단위)
interface Project {
  id: string;
  name: string;
  description?: string;
  techStack: {
    engine: string;
    server: string;
    etc?: string;
  };
  categories: string[];
  defaultReferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

// System Document (관련 기획서)
interface SystemDocument {
  id: string;
  projectId: string;
  name: string;
  category: string;
  tags: string[];
  content: string;
  dependencies: string[];
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task (칸반 카드)
interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  references: string[];
  featureList?: FeatureList;
  designDocument?: DesignDocument;
  prd?: PRD;
  prototype?: Prototype;
  archive?: Archive;
  createdAt: Date;
  updatedAt: Date;
}

// Task Status
type TaskStatus =
  | 'feature_list'
  | 'design_doc'
  | 'prd'
  | 'prototype'
  | 'archived';

// Feature List
interface FeatureList {
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Design Document
interface DesignDocument {
  qaCategory: QACategory;
  qaAnswers: QAAnswer[];
  draft: string;
  revisions: Revision[];
  isApproved: boolean;
  approvedAt?: Date;
}

// Q&A Category
type QACategory = 'game_mechanic' | 'economy' | 'growth';

// Q&A Answer
interface QAAnswer {
  questionId: string;
  question: string;
  answer: string;
}

// Revision
interface Revision {
  id: string;
  version: number;
  type: 'ai_request' | 'manual_edit';
  feedback?: string;
  content: string;
  createdAt: Date;
}

// PRD
interface PRD {
  content: string;
  createdAt: Date;
}

// Prototype
interface Prototype {
  htmlPath: string;
  createdAt: Date;
}

// Archive
interface Archive {
  isArchived: boolean;
  archivedAt: Date;
}

// Question Template
interface QuestionTemplate {
  category: string;
  displayName: string;
  questions: Question[];
}

// Question
interface Question {
  id: string;
  question: string;
  hint?: string;
  type: 'text' | 'textarea';
}
```

---

## 6. 의존성 (Dependencies)

### 6.1 외부 의존성

| 패키지 | 용도 | 필수 여부 |
|--------|------|----------|
| react | UI 컴포넌트 | 필수 |
| react-dom | React DOM 렌더링 | 필수 |
| typescript | 타입 시스템 | 필수 |
| vite | 빌드 도구 | 필수 |
| tailwindcss | CSS 프레임워크 | 필수 |
| postcss | CSS 처리 | 필수 |
| autoprefixer | CSS 벤더 프리픽스 | 필수 |

### 6.2 내부 의존성

- 없음 (기초 환경 구축)

### 6.3 후속 SPEC 의존성

- SPEC-SETUP-001 완료 후 Part B (프로젝트 관리) 진행 가능
- 타입 정의는 모든 후속 SPEC에서 참조

---

## 7. 제약사항 (Constraints)

### 7.1 기술적 제약

- Node.js 20.x LTS 필수
- TypeScript strict mode 필수
- Vite 빌드 도구 사용 필수

### 7.2 품질 제약

- TypeScript 컴파일 오류 0건
- ESLint 경고 0건

### 7.3 시간 제약

- 없음 (우선순위 기반 마일스톤)

---

## 8. 추적성 (Traceability)

### 8.1 PRD 매핑

| 요구사항 | PRD 섹션 | Phase |
|----------|----------|-------|
| 프로젝트 초기화 | 3 (기술 스택), 4.1 | Phase 1.1 |
| CLAUDE.md 작성 | 6 (CLAUDE.md 설계) | Phase 1.2 |
| 디렉토리 구조 | 4.1 (파일 구조) | Phase 1.3 |
| 타입 정의 | 4.2 (데이터 구조) | Phase 1.4 |

### 8.2 관련 문서

- PRD: ai-workflow-kanban-prd_4.md
- 기술 스택: .moai/project/tech.md
- 프로젝트 구조: .moai/project/structure.md

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
