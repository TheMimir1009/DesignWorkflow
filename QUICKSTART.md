# DesignWorkflow - Claude Code 빠른 시작 가이드

## 🚀 한 줄 요약

게임 기획 문서를 AI로 자동 생성하는 칸반 보드 시스템

```
Feature List → (Q&A) → Design Doc → PRD → Prototype Code
```

---

## 📦 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Zustand, Tailwind, @dnd-kit |
| Backend | Express 5, TypeScript, tsx, File System JSON |
| AI | OpenAI, Gemini, LM Studio (다중 지원) |

---

## 🏃 빠른 시작 (5분)

```bash
# 1. 프로젝트 생성
npm create vite@latest design-workflow -- --template react-ts
cd design-workflow

# 2. 의존성 설치
npm install zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-markdown remark-gfm recharts uuid
npm install express cors
npm install -D @types/express @types/cors @types/uuid tsx concurrently
npm install -D tailwindcss @tailwindcss/vite

# 3. 폴더 구조 생성
mkdir -p src/{types,store,services,kanban,qa,llm,project,system,dashboard,layout}
mkdir -p server/{routes,utils,llmProviders}
mkdir -p workspace/{projects,pipelines,templates/questions}
```

---

## 📁 핵심 파일 구조

```
src/
├── types/           # 타입 정의
│   ├── index.ts     # Project, Task, SystemDocument
│   ├── qa.ts        # Question, QASession
│   ├── llm.ts       # LLMProvider, ProjectLLMSettings
│   └── passthrough.ts
├── store/           # Zustand 상태 관리
├── services/        # API 통신 레이어
├── kanban/          # 칸반 보드 컴포넌트
├── qa/              # Q&A 모달
└── ...

server/
├── index.ts         # Express 진입점
├── routes/          # API 라우트
├── utils/           # Storage, Provider, PromptBuilder
└── llmProviders/    # OpenAI, Gemini 등
```

---

## 🔗 API-Service-Store 연결 규칙

| Store Method | Service Method | API Endpoint |
|--------------|----------------|--------------|
| `projectStore.fetchProjects()` | `projectService.getProjects()` | `GET /api/projects` |
| `taskStore.fetchTasks(pid)` | `taskService.getTasks(pid)` | `GET /api/projects/:pid/tasks` |
| `qaStore.loadQuestions()` | `qaService.getQuestions()` | `GET /api/question-library/questions` |
| `qaStore.startSession()` | `qaService.createSession()` | `POST /api/qa-sessions` |

---

## ⚠️ 핵심 린트 규칙

```typescript
// ✅ 타입 import
import type { Task, Project } from '../types';

// ✅ 서버 파일 import (.ts 확장자 필수)
import { sendSuccess } from '../utils/response.ts';

// ✅ 사용하지 않는 파라미터
function handler(_req: Request, res: Response) { }
```

---

## 🔴 삭제 금지 파일

```
Entry Points:      src/main.tsx, src/App.tsx, server/index.ts
Core Types:        src/types/index.ts, qa.ts, llm.ts, passthrough.ts
Core Modules:      *Store.ts, *Service.ts, server/routes/*.ts
```

---

## 📋 구현 Phase 순서

| Phase | 내용 | 핵심 파일 |
|-------|------|----------|
| 1 | 초기화 | types/*.ts, server/index.ts, vite.config.ts |
| 2 | 프로젝트 | projectStorage, projectsRouter, projectStore |
| 3 | 칸반 | taskStorage, tasksRouter, KanbanBoard |
| 4 | Q&A | qaStorage, questionsRouter, QAFormModal |
| 5 | LLM | llmProvider, generateRouter, llmSettingsStore |
| 6 | Passthrough | passthroughRunner, passthroughRouter |
| 7 | 시스템문서 | systemStorage, systemsRouter, SystemSidebar |
| 8 | 대시보드 | dashboardRouter, DashboardPanel |

---

## 🤖 Claude Code 시작 프롬프트

```
이 프로젝트는 DesignWorkflow - 게임 기획 문서 AI 생성 시스템입니다.

PRD-DesignWorkflow-Implementation-Guide-v2.md를 참조하여 
Phase 1부터 순차적으로 구현해주세요.

핵심 규칙:
1. Critical Files 삭제 금지
2. API-Service-Store Connection Map 참조
3. 린트 규칙 준수 (import type, .ts 확장자)
4. 각 Phase 완료 후 npm run lint 확인
```

---

## ✅ 완료 체크리스트

- [ ] `npm run start` → 프론트 + 백엔드 동시 실행
- [ ] 프로젝트 생성 → 태스크 생성 → 칸반 이동
- [ ] Feature → Design 시 Q&A 모달 표시
- [ ] Q&A 완료 → Design Doc AI 생성
- [ ] Design → PRD → Prototype 자동 생성

---

**Document**: PRD-DesignWorkflow-Implementation-Guide-v2.md (4,889줄)  
**Last Updated**: 2026-01-15
