# DesignWorkflow - 신규 구현 PRD

**Version**: 2.0.0  
**Purpose**: Claude Code / AI 코딩 도구를 사용한 처음부터 구현용  
**Last Updated**: 2026-01-15

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [데이터 모델](#3-데이터-모델)
4. [구현 Phase](#4-구현-phase)
5. [API 명세](#5-api-명세)
6. [화면 명세](#6-화면-명세)
7. [시드 데이터](#7-시드-데이터)
8. [AI 코딩 규칙](#8-ai-코딩-규칙)

---

## 1. 프로젝트 개요

### 1.1 제품 비전

**DesignWorkflow**는 게임 기획 문서 생성을 위한 AI 기반 워크플로우 시스템입니다.

```
사용자 흐름:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Feature     │    │   Design     │    │     PRD      │    │  Prototype   │
│   List       │ → │   Document   │ → │   Document   │ → │    Code      │
│              │    │              │    │              │    │              │
│ (사용자 입력) │    │ (Q&A + AI)   │    │  (AI 생성)   │    │  (AI 생성)   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 1.2 핵심 기능

| 기능 | 설명 |
|------|------|
| **칸반 보드** | 4단계 워크플로우 시각화 (Feature → Design → PRD → Prototype) |
| **Q&A 시스템** | Design 단계 진입 시 카테고리별 질문 응답 |
| **AI 문서 생성** | LLM을 활용한 Design Doc, PRD, Prototype 자동 생성 |
| **다중 LLM 지원** | OpenAI, Gemini, Claude Code, LM Studio |
| **참조 문서 관리** | 시스템 문서를 참조하여 AI 컨텍스트 강화 |
| **프롬프트 관리** | 문서 생성용 프롬프트 템플릿 커스터마이징 |

### 1.3 사용자 유형

| 사용자 | 주요 사용 기능 |
|--------|---------------|
| 게임 기획자 | 피처 등록, Q&A 응답, 생성된 문서 검토/수정 |
| 프로젝트 매니저 | 대시보드 모니터링, 프로젝트 설정 |
| 개발자 | 생성된 Prototype 코드 활용 |

---

## 2. 기술 스택

### 2.1 프론트엔드

```json
{
  "framework": "React 19",
  "language": "TypeScript 5.9",
  "buildTool": "Vite 7",
  "stateManagement": "Zustand 5",
  "styling": "Tailwind CSS 4",
  "dragAndDrop": "@dnd-kit/core, @dnd-kit/sortable",
  "codeEditor": "@uiw/react-codemirror",
  "markdown": "react-markdown + remark-gfm",
  "charts": "recharts"
}
```

### 2.2 백엔드

```json
{
  "runtime": "Node.js (ESM)",
  "framework": "Express 5",
  "language": "TypeScript 5.9",
  "executor": "tsx",
  "storage": "File System (JSON)",
  "auth": "jsonwebtoken + bcrypt"
}
```

### 2.3 프로젝트 초기화 명령어

```bash
# 1. Vite 프로젝트 생성
npm create vite@latest design-workflow -- --template react-ts

# 2. 의존성 설치
cd design-workflow
npm install zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-markdown remark-gfm recharts
npm install @uiw/react-codemirror @codemirror/lang-markdown @codemirror/lang-json
npm install express cors uuid bcrypt jsonwebtoken
npm install -D @types/express @types/cors @types/uuid @types/bcrypt @types/jsonwebtoken
npm install -D tsx concurrently
npm install -D tailwindcss @tailwindcss/vite autoprefixer

# 3. Tailwind 설정
npx tailwindcss init -p
```

### 2.4 package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "server": "tsx server/index.ts",
    "start": "concurrently -n \"API,WEB\" -c \"yellow,cyan\" \"npm run server\" \"npm run dev\"",
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

### 2.5 폴더 구조

```
design-workflow/
├── src/
│   ├── main.tsx                 # React 진입점
│   ├── App.tsx                  # 라우팅 루트
│   ├── index.css                # 글로벌 스타일
│   │
│   ├── types/                   # 타입 정의
│   │   ├── index.ts             # 핵심 타입 (Project, Task 등)
│   │   ├── llm.ts               # LLM 관련 타입
│   │   ├── qa.ts                # Q&A 관련 타입
│   │   └── passthrough.ts       # 파이프라인 타입
│   │
│   ├── store/                   # Zustand 스토어
│   │   ├── projectStore.ts
│   │   ├── taskStore.ts
│   │   ├── qaStore.ts
│   │   ├── llmSettingsStore.ts
│   │   └── passthroughStore.ts
│   │
│   ├── services/                # API 통신 레이어
│   │   ├── projectService.ts
│   │   ├── taskService.ts
│   │   ├── qaService.ts
│   │   ├── llmSettingsService.ts
│   │   └── passthroughService.ts
│   │
│   ├── kanban/                  # 칸반 보드 컴포넌트
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── KanbanCard.tsx
│   │
│   ├── qa/                      # Q&A 컴포넌트
│   │   └── QAFormModal.tsx
│   │
│   ├── llm/                     # LLM 설정 컴포넌트
│   │   └── LLMSettingsPanel.tsx
│   │
│   ├── project/                 # 프로젝트 관리 컴포넌트
│   │   ├── ProjectSelector.tsx
│   │   └── ProjectSettingsModal.tsx
│   │
│   ├── system/                  # 시스템 문서 컴포넌트
│   │   ├── SystemSidebar.tsx
│   │   └── SystemCard.tsx
│   │
│   └── layout/                  # 레이아웃 컴포넌트
│       └── Header.tsx
│
├── server/
│   ├── index.ts                 # Express 진입점
│   │
│   ├── routes/                  # API 라우트
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── qa-sessions.ts
│   │   ├── questions.ts
│   │   ├── systems.ts
│   │   ├── llmSettings.ts
│   │   ├── generate.ts
│   │   └── passthrough.ts
│   │
│   ├── utils/                   # 유틸리티
│   │   ├── projectStorage.ts
│   │   ├── taskStorage.ts
│   │   ├── qaStorage.ts
│   │   ├── systemStorage.ts
│   │   ├── llmSettingsStorage.ts
│   │   ├── llmProvider.ts
│   │   ├── promptBuilder.ts
│   │   └── response.ts
│   │
│   └── llmProviders/            # LLM 프로바이더
│       ├── base.ts
│       ├── openai.ts
│       ├── gemini.ts
│       └── lmstudio.ts
│
├── workspace/                   # 런타임 데이터 (Git 제외)
│   ├── projects/
│   └── templates/
│       └── questions/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 3. 데이터 모델

### 3.1 핵심 엔티티 관계도

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Project   │ 1───* │    Task     │ 1───1 │  QASession  │
│             │       │             │       │             │
│ - id        │       │ - id        │       │ - id        │
│ - name      │       │ - projectId │       │ - taskId    │
│ - techStack │       │ - title     │       │ - answers   │
└─────────────┘       │ - status    │       └─────────────┘
       │              │ - featureList│
       │              │ - designDoc │
       │              │ - prd       │
       │              │ - prototype │
       │              └─────────────┘
       │
       │ 1───*  ┌─────────────┐
       └───────│SystemDocument│
               │             │
               │ - id        │
               │ - projectId │
               │ - name      │
               │ - content   │
               └─────────────┘
```

### 3.2 타입 정의 (src/types/index.ts)

```typescript
// ============================================
// Project
// ============================================
export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  categories: string[];
  defaultReferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  techStack?: string[];
  categories?: string[];
}

// ============================================
// Task
// ============================================
export type TaskStatus = 'featurelist' | 'design' | 'prd' | 'prototype';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  featureList: string;
  designDocument: string | null;
  prd: string | null;
  prototype: string | null;
  references: string[];
  qaAnswers: QAAnswer[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  projectId: string;
  title: string;
  featureList: string;
  references?: string[];
}

export interface QAAnswer {
  questionId: string;
  category: string;
  question: string;
  answer: string;
  answeredAt: string;
}

// ============================================
// SystemDocument (참조 문서)
// ============================================
export interface SystemDocument {
  id: string;
  projectId: string;
  name: string;
  category: string;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemDocumentDto {
  projectId: string;
  name: string;
  category: string;
  tags?: string[];
  content: string;
}

// ============================================
// API Response
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
```

### 3.3 Q&A 타입 정의 (src/types/qa.ts)

```typescript
// ============================================
// Question
// ============================================
export type QACategory = 'game-mechanic' | 'economy' | 'growth';

export interface Question {
  id: string;
  categoryId: QACategory;
  text: string;
  description?: string;
  placeholder?: string;
  isRequired: boolean;
  order: number;
}

export interface QuestionCategory {
  id: QACategory;
  name: string;
  description: string;
  icon: string;
}

// ============================================
// QA Session
// ============================================
export type QASessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface QASession {
  id: string;
  taskId: string;
  projectId: string;
  category: QACategory;
  answers: Record<string, string>;
  status: QASessionStatus;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateQASessionDto {
  taskId: string;
  projectId: string;
}

export interface UpdateQASessionDto {
  answers?: Record<string, string>;
  currentStep?: number;
  status?: QASessionStatus;
}
```

### 3.4 LLM 타입 정의 (src/types/llm.ts)

```typescript
// ============================================
// LLM Provider
// ============================================
export type LLMProvider = 'openai' | 'gemini' | 'claude-code' | 'lmstudio';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'untested' | 'testing';

export interface LLMProviderSettings {
  provider: LLMProvider;
  apiKey: string;
  endpoint?: string;
  isEnabled: boolean;
  connectionStatus: ConnectionStatus;
  lastTestedAt?: string;
  errorMessage?: string;
}

export interface LLMModelConfig {
  provider: LLMProvider;
  modelId: string;
  temperature: number;
  maxTokens: number;
}

// ============================================
// Project LLM Settings
// ============================================
export interface TaskStageConfig {
  designDoc: LLMModelConfig | null;
  prd: LLMModelConfig | null;
  prototype: LLMModelConfig | null;
  defaultModel: LLMModelConfig;
}

export interface ProjectLLMSettings {
  projectId: string;
  providers: LLMProviderSettings[];
  taskStageConfig: TaskStageConfig;
  updatedAt: string;
}

// ============================================
// Connection Test
// ============================================
export interface ConnectionTestResult {
  success: boolean;
  status: ConnectionStatus;
  latency?: number;
  error?: string;
  timestamp: string;
}

// ============================================
// Helpers
// ============================================
export const VALID_PROVIDERS: LLMProvider[] = ['openai', 'gemini', 'claude-code', 'lmstudio'];

export function isValidProvider(provider: string): provider is LLMProvider {
  return VALID_PROVIDERS.includes(provider as LLMProvider);
}

export function createDefaultProjectLLMSettings(projectId: string): ProjectLLMSettings {
  return {
    projectId,
    providers: [
      { provider: 'openai', apiKey: '', isEnabled: false, connectionStatus: 'untested' },
      { provider: 'gemini', apiKey: '', isEnabled: false, connectionStatus: 'untested' },
      { provider: 'claude-code', apiKey: '', isEnabled: false, connectionStatus: 'untested' },
      { provider: 'lmstudio', apiKey: '', endpoint: 'http://localhost:1234/v1', isEnabled: false, connectionStatus: 'untested' },
    ],
    taskStageConfig: {
      designDoc: null,
      prd: null,
      prototype: null,
      defaultModel: { provider: 'openai', modelId: 'gpt-4o-mini', temperature: 0.7, maxTokens: 4096 },
    },
    updatedAt: new Date().toISOString(),
  };
}
```

### 3.5 Passthrough 타입 정의 (src/types/passthrough.ts)

```typescript
// ============================================
// Pipeline Stage
// ============================================
export type PassthroughStageName = 'design_doc' | 'prd' | 'prototype';
export type PassthroughStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type PassthroughPipelineStatus = 'idle' | 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface PassthroughStage {
  id: string;
  name: PassthroughStageName;
  displayName: string;
  status: PassthroughStageStatus;
  startedAt: string | null;
  completedAt: string | null;
  error: PassthroughStageError | null;
  progress: number;
}

export interface PassthroughStageError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
}

// ============================================
// Pipeline
// ============================================
export interface PassthroughPipeline {
  id: string;
  taskId: string;
  status: PassthroughPipelineStatus;
  currentStage: PassthroughStageName | null;
  stages: PassthroughStage[];
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface StartPipelineDto {
  taskId: string;
  stages?: PassthroughStageName[];
}

// ============================================
// Helpers
// ============================================
export function createInitialStages(): PassthroughStage[] {
  return [
    { id: '', name: 'design_doc', displayName: 'Design Document', status: 'pending', startedAt: null, completedAt: null, error: null, progress: 0 },
    { id: '', name: 'prd', displayName: 'PRD', status: 'pending', startedAt: null, completedAt: null, error: null, progress: 0 },
    { id: '', name: 'prototype', displayName: 'Prototype', status: 'pending', startedAt: null, completedAt: null, error: null, progress: 0 },
  ];
}
```

---

## 4. 구현 Phase

### 4.1 Phase 개요

| Phase | 내용 | 예상 기간 |
|-------|------|----------|
| Phase 1 | 프로젝트 초기화 & 기본 인프라 | Day 1 |
| Phase 2 | 프로젝트 관리 (CRUD) | Day 2 |
| Phase 3 | 태스크 & 칸반 보드 | Day 3-4 |
| Phase 4 | Q&A 시스템 | Day 5 |
| Phase 5 | LLM 연동 & AI 생성 | Day 6-7 |
| Phase 6 | Passthrough 파이프라인 | Day 8 |
| Phase 7 | 시스템 문서 & 참조 | Day 9 |
| Phase 8 | 대시보드 & 마무리 | Day 10 |

---

### 4.2 Phase 1: 프로젝트 초기화 & 기본 인프라

#### Step 1-1: Vite 프로젝트 생성

```bash
npm create vite@latest design-workflow -- --template react-ts
cd design-workflow
```

#### Step 1-2: 의존성 설치

```bash
# 프론트엔드
npm install zustand
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-markdown remark-gfm
npm install recharts
npm install uuid

# 백엔드
npm install express cors
npm install -D @types/express @types/cors @types/uuid
npm install -D tsx concurrently

# Tailwind
npm install -D tailwindcss @tailwindcss/vite autoprefixer
```

#### Step 1-3: 기본 타입 정의 생성

파일: `src/types/index.ts`
- 위 3.2절의 타입 정의 전체 복사

파일: `src/types/qa.ts`
- 위 3.3절의 타입 정의 전체 복사

파일: `src/types/llm.ts`
- 위 3.4절의 타입 정의 전체 복사

#### Step 1-4: Express 서버 기본 구조

파일: `server/index.ts`

```typescript
import express, { type Express } from 'express';
import cors from 'cors';

export function createApp(): Express {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  return app;
}

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

파일: `server/utils/response.ts`

```typescript
import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T): void {
  res.json({ success: true, data, error: null });
}

export function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ success: false, data: null, error: message });
}
```

#### Step 1-5: Vite 프록시 설정

파일: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

#### Step 1-6: 기본 App 구조

파일: `src/App.tsx`

```typescript
import { useState } from 'react';

function App() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">DesignWorkflow</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentProjectId ? (
          <div>칸반 보드 영역</div>
        ) : (
          <div>프로젝트를 선택하세요</div>
        )}
      </main>
    </div>
  );
}

export default App;
```

#### Phase 1 완료 체크리스트

- [ ] `npm run dev` 실행 시 React 앱 로드됨
- [ ] `npm run server` 실행 시 서버 시작됨
- [ ] `curl http://localhost:3001/api/health` 응답 확인
- [ ] 타입 파일들 생성 완료 (index.ts, qa.ts, llm.ts)

---

### 4.3 Phase 2: 프로젝트 관리

#### Step 2-1: 프로젝트 Storage 구현

파일: `server/utils/projectStorage.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Project, CreateProjectDto } from '../../src/types/index.ts';

const WORKSPACE_PATH = path.join(process.cwd(), 'workspace');
const PROJECTS_PATH = path.join(WORKSPACE_PATH, 'projects');

async function ensureDirectories(): Promise<void> {
  await fs.mkdir(PROJECTS_PATH, { recursive: true });
}

export async function getAllProjects(): Promise<Project[]> {
  await ensureDirectories();
  
  try {
    const entries = await fs.readdir(PROJECTS_PATH, { withFileTypes: true });
    const projects: Project[] = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(PROJECTS_PATH, entry.name, 'project.json');
        try {
          const content = await fs.readFile(projectPath, 'utf-8');
          projects.push(JSON.parse(content));
        } catch {
          // Skip invalid projects
        }
      }
    }
    
    return projects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projectPath = path.join(PROJECTS_PATH, id, 'project.json');
  
  try {
    const content = await fs.readFile(projectPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function createProject(data: CreateProjectDto): Promise<Project> {
  await ensureDirectories();
  
  const project: Project = {
    id: uuidv4(),
    name: data.name,
    description: data.description || '',
    techStack: data.techStack || [],
    categories: data.categories || [],
    defaultReferences: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const projectDir = path.join(PROJECTS_PATH, project.id);
  await fs.mkdir(projectDir, { recursive: true });
  await fs.mkdir(path.join(projectDir, 'tasks'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'systems'), { recursive: true });
  
  await fs.writeFile(
    path.join(projectDir, 'project.json'),
    JSON.stringify(project, null, 2)
  );
  
  // Initialize empty tasks file
  await fs.writeFile(
    path.join(projectDir, 'tasks', 'tasks.json'),
    '[]'
  );
  
  return project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const project = await getProjectById(id);
  if (!project) return null;
  
  const updatedProject: Project = {
    ...project,
    ...updates,
    id: project.id, // Prevent ID change
    updatedAt: new Date().toISOString(),
  };
  
  await fs.writeFile(
    path.join(PROJECTS_PATH, id, 'project.json'),
    JSON.stringify(updatedProject, null, 2)
  );
  
  return updatedProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projectDir = path.join(PROJECTS_PATH, id);
  
  try {
    await fs.rm(projectDir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}
```

#### Step 2-2: 프로젝트 API 라우트

파일: `server/routes/projects.ts`

```typescript
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../utils/projectStorage.ts';

export const projectsRouter = Router();

// GET /api/projects
projectsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await getAllProjects();
    sendSuccess(res, projects);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch projects');
  }
});

// GET /api/projects/:id
projectsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }
    sendSuccess(res, project);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch project');
  }
});

// POST /api/projects
projectsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      sendError(res, 400, 'Project name is required');
      return;
    }
    
    const project = await createProject(req.body);
    res.status(201).json({ success: true, data: project, error: null });
  } catch (error) {
    sendError(res, 500, 'Failed to create project');
  }
});

// PUT /api/projects/:id
projectsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await updateProject(req.params.id, req.body);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }
    sendSuccess(res, project);
  } catch (error) {
    sendError(res, 500, 'Failed to update project');
  }
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteProject(req.params.id);
    if (!deleted) {
      sendError(res, 404, 'Project not found');
      return;
    }
    sendSuccess(res, { deleted: true });
  } catch (error) {
    sendError(res, 500, 'Failed to delete project');
  }
});
```

#### Step 2-3: 서버에 라우트 등록

파일: `server/index.ts` 업데이트

```typescript
import express, { type Express } from 'express';
import cors from 'cors';
import { projectsRouter } from './routes/projects.ts';

export function createApp(): Express {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  // Routes
  app.use('/api/projects', projectsRouter);
  
  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  return app;
}

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Step 2-4: 프론트엔드 Service 구현

파일: `src/services/projectService.ts`

```typescript
import type { Project, CreateProjectDto, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error || 'Unknown error');
  }
  return json.data as T;
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects`);
  return handleResponse<Project[]>(response);
}

export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`);
  return handleResponse<Project>(response);
}

export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Project>(response);
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Project>(response);
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ deleted: boolean }>(response);
}
```

#### Step 2-5: 프론트엔드 Store 구현

파일: `src/store/projectStore.ts`

```typescript
import { create } from 'zustand';
import type { Project, CreateProjectDto } from '../types';
import * as projectService from '../services/projectService';

interface ProjectStoreState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

interface ProjectStoreActions {
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  selectProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

type ProjectStore = ProjectStoreState & ProjectStoreActions;

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectService.getProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  selectProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectService.getProject(id);
      set({ currentProject: project, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectService.createProject(data);
      const { projects } = get();
      set({ projects: [project, ...projects], isLoading: false });
      return project;
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await projectService.updateProject(id, data);
      const { projects, currentProject } = get();
      set({
        projects: projects.map((p) => (p.id === id ? updated : p)),
        currentProject: currentProject?.id === id ? updated : currentProject,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.deleteProject(id);
      const { projects, currentProject } = get();
      set({
        projects: projects.filter((p) => p.id !== id),
        currentProject: currentProject?.id === id ? null : currentProject,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
```

#### Step 2-6: ProjectSelector 컴포넌트

파일: `src/project/ProjectSelector.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';

export function ProjectSelector() {
  const {
    projects,
    currentProject,
    isLoading,
    fetchProjects,
    selectProject,
    createProject,
  } = useProjectStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const project = await createProject({ name: newProjectName });
      selectProject(project.id);
      setShowCreateModal(false);
      setNewProjectName('');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <select
        value={currentProject?.id || ''}
        onChange={(e) => e.target.value && selectProject(e.target.value)}
        className="px-3 py-2 border rounded-lg bg-white"
        disabled={isLoading}
      >
        <option value="">프로젝트 선택...</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      
      <button
        onClick={() => setShowCreateModal(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        새 프로젝트
      </button>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">새 프로젝트 생성</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="프로젝트 이름"
              className="w-full px-3 py-2 border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Phase 2 완료 체크리스트

- [ ] `POST /api/projects` 프로젝트 생성 동작
- [ ] `GET /api/projects` 프로젝트 목록 조회 동작
- [ ] ProjectSelector에서 프로젝트 선택 가능
- [ ] 새 프로젝트 생성 모달 동작

---

### 4.4 Phase 3: 태스크 & 칸반 보드

#### Step 3-1: Task Storage 구현

파일: `server/utils/taskStorage.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Task, CreateTaskDto, TaskStatus } from '../../src/types/index.ts';

const WORKSPACE_PATH = path.join(process.cwd(), 'workspace', 'projects');

function getTasksPath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'tasks', 'tasks.json');
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  try {
    const content = await fs.readFile(getTasksPath(projectId), 'utf-8');
    return JSON.parse(content) as Task[];
  } catch {
    return [];
  }
}

export async function getTaskById(id: string): Promise<{ task: Task; projectId: string } | null> {
  const projectsDir = WORKSPACE_PATH;
  
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const tasks = await getTasksByProject(entry.name);
        const task = tasks.find((t) => t.id === id);
        if (task) {
          return { task, projectId: entry.name };
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return null;
}

export async function createTask(data: CreateTaskDto): Promise<Task> {
  const task: Task = {
    id: uuidv4(),
    projectId: data.projectId,
    title: data.title,
    status: 'featurelist',
    featureList: data.featureList,
    designDocument: null,
    prd: null,
    prototype: null,
    references: data.references || [],
    qaAnswers: [],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tasks = await getTasksByProject(data.projectId);
  tasks.push(task);
  await saveTasks(data.projectId, tasks);

  return task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const result = await getTaskById(id);
  if (!result) return null;

  const { task, projectId } = result;
  const updatedTask: Task = {
    ...task,
    ...updates,
    id: task.id,
    projectId: task.projectId,
    updatedAt: new Date().toISOString(),
  };

  const tasks = await getTasksByProject(projectId);
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    await saveTasks(projectId, tasks);
  }

  return updatedTask;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
  return updateTask(id, { status });
}

export async function deleteTask(id: string): Promise<boolean> {
  const result = await getTaskById(id);
  if (!result) return false;

  const { projectId } = result;
  const tasks = await getTasksByProject(projectId);
  const filtered = tasks.filter((t) => t.id !== id);
  await saveTasks(projectId, filtered);

  return true;
}

async function saveTasks(projectId: string, tasks: Task[]): Promise<void> {
  const tasksPath = getTasksPath(projectId);
  const dir = path.dirname(tasksPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2));
}
```

#### Step 3-2: Task API 라우트

파일: `server/routes/tasks.ts`

```typescript
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../utils/taskStorage.ts';
import type { TaskStatus } from '../../src/types/index.ts';

export const tasksRouter = Router();

// GET /api/projects/:projectId/tasks
export async function getProjectTasks(req: Request, res: Response): Promise<void> {
  try {
    const tasks = await getTasksByProject(req.params.projectId);
    sendSuccess(res, tasks.filter((t) => !t.isArchived));
  } catch (error) {
    sendError(res, 500, 'Failed to fetch tasks');
  }
}

// POST /api/projects/:projectId/tasks
export async function createProjectTask(req: Request, res: Response): Promise<void> {
  try {
    const { title, featureList } = req.body;
    
    if (!title) {
      sendError(res, 400, 'Title is required');
      return;
    }
    
    const task = await createTask({
      projectId: req.params.projectId,
      title,
      featureList: featureList || '',
      references: req.body.references,
    });
    
    res.status(201).json({ success: true, data: task, error: null });
  } catch (error) {
    sendError(res, 500, 'Failed to create task');
  }
}

// GET /api/tasks/:id
tasksRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getTaskById(req.params.id);
    if (!result) {
      sendError(res, 404, 'Task not found');
      return;
    }
    sendSuccess(res, result.task);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch task');
  }
});

// PUT /api/tasks/:id
tasksRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await updateTask(req.params.id, req.body);
    if (!task) {
      sendError(res, 404, 'Task not found');
      return;
    }
    sendSuccess(res, task);
  } catch (error) {
    sendError(res, 500, 'Failed to update task');
  }
});

// PUT /api/tasks/:id/status
tasksRouter.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body as { status: TaskStatus };
    
    if (!status) {
      sendError(res, 400, 'Status is required');
      return;
    }
    
    const task = await updateTaskStatus(req.params.id, status);
    if (!task) {
      sendError(res, 404, 'Task not found');
      return;
    }
    sendSuccess(res, task);
  } catch (error) {
    sendError(res, 500, 'Failed to update task status');
  }
});

// DELETE /api/tasks/:id
tasksRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteTask(req.params.id);
    if (!deleted) {
      sendError(res, 404, 'Task not found');
      return;
    }
    sendSuccess(res, { deleted: true });
  } catch (error) {
    sendError(res, 500, 'Failed to delete task');
  }
});
```

#### Step 3-3: Task Service

파일: `src/services/taskService.ts`

```typescript
import type { Task, CreateTaskDto, TaskStatus, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error || 'Unknown error');
  }
  return json.data as T;
}

export async function getTasks(projectId: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`);
  return handleResponse<Task[]>(response);
}

export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`);
  return handleResponse<Task>(response);
}

export async function createTask(data: CreateTaskDto): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${data.projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(response);
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(response);
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ deleted: boolean }>(response);
}
```

#### Step 3-4: Task Store

파일: `src/store/taskStore.ts`

```typescript
import { create } from 'zustand';
import type { Task, CreateTaskDto, TaskStatus } from '../types';
import * as taskService from '../services/taskService';

interface TaskStoreState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  generatingTaskIds: string[];
}

interface TaskStoreActions {
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (data: CreateTaskDto) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setGenerating: (taskId: string, generating: boolean) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  clearError: () => void;
}

type TaskStore = TaskStoreState & TaskStoreActions;

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  generatingTaskIds: [],

  fetchTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getTasks(projectId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const task = await taskService.createTask(data);
      const { tasks } = get();
      set({ tasks: [...tasks, task], isLoading: false });
      return task;
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },

  updateTask: async (id, data) => {
    try {
      const updated = await taskService.updateTask(id, data);
      const { tasks } = get();
      set({ tasks: tasks.map((t) => (t.id === id ? updated : t)) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const updated = await taskService.updateTaskStatus(id, status);
      const { tasks } = get();
      set({ tasks: tasks.map((t) => (t.id === id ? updated : t)) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteTask: async (id) => {
    try {
      await taskService.deleteTask(id);
      const { tasks } = get();
      set({ tasks: tasks.filter((t) => t.id !== id) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setGenerating: (taskId, generating) => {
    const { generatingTaskIds } = get();
    if (generating) {
      set({ generatingTaskIds: [...generatingTaskIds, taskId] });
    } else {
      set({ generatingTaskIds: generatingTaskIds.filter((id) => id !== taskId) });
    }
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status);
  },

  clearError: () => set({ error: null }),
}));
```

#### Step 3-5: 칸반 보드 컴포넌트

파일: `src/kanban/KanbanBoard.tsx`

```typescript
import { useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import type { Task, TaskStatus } from '../types';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'featurelist', title: 'Feature List' },
  { id: 'design', title: 'Design Document' },
  { id: 'prd', title: 'PRD' },
  { id: 'prototype', title: 'Prototype' },
];

export function KanbanBoard() {
  const { currentProject } = useProjectStore();
  const { tasks, fetchTasks, updateTaskStatus, generatingTaskIds } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (currentProject) {
      fetchTasks(currentProject.id);
    }
  }, [currentProject, fetchTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);

    if (task && task.status !== newStatus) {
      // featurelist → design 이동 시 Q&A 필요
      if (task.status === 'featurelist' && newStatus === 'design') {
        // TODO: Q&A 모달 오픈 (Phase 4에서 구현)
        console.log('Q&A 모달 오픈 필요:', taskId);
      }
      
      updateTaskStatus(taskId, newStatus);
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        프로젝트를 선택하세요
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasks.filter((t) => t.status === column.id)}
            generatingTaskIds={generatingTaskIds}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <KanbanCard
            task={activeTask}
            isGenerating={generatingTaskIds.includes(activeTask.id)}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
```

파일: `src/kanban/KanbanColumn.tsx`

```typescript
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { Task, TaskStatus } from '../types';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  generatingTaskIds: string[];
}

export function KanbanColumn({ id, title, tasks, generatingTaskIds }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4
        ${isOver ? 'ring-2 ring-blue-400' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              isGenerating={generatingTaskIds.includes(task.id)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
```

파일: `src/kanban/KanbanCard.tsx`

```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';

interface KanbanCardProps {
  task: Task;
  isGenerating: boolean;
  isDragging?: boolean;
}

export function KanbanCard({ task, isGenerating, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg p-4 shadow-sm border cursor-grab
        ${isDragging ? 'opacity-50 rotate-3' : ''}
        ${isGenerating ? 'border-blue-400 animate-pulse' : 'border-gray-200'}
        hover:shadow-md transition-shadow
      `}
    >
      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
      
      {task.featureList && (
        <p className="text-sm text-gray-500 line-clamp-2">{task.featureList}</p>
      )}

      {isGenerating && (
        <div className="mt-2 flex items-center gap-2 text-blue-500 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          AI 생성 중...
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        {task.designDocument && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Design
          </span>
        )}
        {task.prd && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
            PRD
          </span>
        )}
        {task.prototype && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
            Code
          </span>
        )}
      </div>
    </div>
  );
}
```

#### Step 3-6: server/index.ts 업데이트

```typescript
import express, { type Express } from 'express';
import cors from 'cors';
import { projectsRouter } from './routes/projects.ts';
import { tasksRouter, getProjectTasks, createProjectTask } from './routes/tasks.ts';

export function createApp(): Express {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  // Routes
  app.use('/api/projects', projectsRouter);
  app.use('/api/tasks', tasksRouter);
  
  // Project-scoped task routes
  app.get('/api/projects/:projectId/tasks', getProjectTasks);
  app.post('/api/projects/:projectId/tasks', createProjectTask);
  
  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  return app;
}

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Phase 3 완료 체크리스트

- [ ] 칸반 보드 4개 컬럼 렌더링
- [ ] 태스크 생성 동작
- [ ] 드래그 앤 드롭으로 컬럼 이동
- [ ] 태스크 카드에 문서 상태 배지 표시

---

### 4.5 Phase 4: Q&A 시스템

#### Step 4-1: Q&A Storage 구현

파일: `server/utils/qaStorage.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { QASession, CreateQASessionDto, UpdateQASessionDto, QACategory } from '../../src/types/qa.ts';

const WORKSPACE_PATH = path.join(process.cwd(), 'workspace', 'projects');

function getSessionPath(projectId: string, sessionId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'qa-sessions', `${sessionId}.json`);
}

function getSessionsDir(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'qa-sessions');
}

export async function createQASession(taskId: string, category: QACategory): Promise<QASession> {
  // Find project ID from task
  const projectsDir = WORKSPACE_PATH;
  let projectId = '';
  
  const entries = await fs.readdir(projectsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const tasksPath = path.join(projectsDir, entry.name, 'tasks', 'tasks.json');
      try {
        const content = await fs.readFile(tasksPath, 'utf-8');
        const tasks = JSON.parse(content);
        if (tasks.some((t: { id: string }) => t.id === taskId)) {
          projectId = entry.name;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  if (!projectId) {
    throw new Error('Task not found');
  }

  const session: QASession = {
    id: uuidv4(),
    taskId,
    projectId,
    category,
    answers: {},
    status: 'in_progress',
    currentStep: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveQASession(session);
  return session;
}

export async function getQASessionById(sessionId: string): Promise<QASession | null> {
  const projectsDir = WORKSPACE_PATH;
  
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const sessionPath = getSessionPath(entry.name, sessionId);
        try {
          const content = await fs.readFile(sessionPath, 'utf-8');
          return JSON.parse(content);
        } catch {
          continue;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return null;
}

export async function getQASessionByTaskId(taskId: string): Promise<QASession | null> {
  const projectsDir = WORKSPACE_PATH;
  
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const sessionsDir = getSessionsDir(entry.name);
        try {
          const sessionFiles = await fs.readdir(sessionsDir);
          
          for (const file of sessionFiles) {
            if (file.endsWith('.json')) {
              const content = await fs.readFile(path.join(sessionsDir, file), 'utf-8');
              const session = JSON.parse(content) as QASession;
              if (session.taskId === taskId) {
                return session;
              }
            }
          }
        } catch {
          continue;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return null;
}

export async function updateQASession(sessionId: string, updates: UpdateQASessionDto): Promise<QASession | null> {
  const session = await getQASessionById(sessionId);
  if (!session) return null;

  const updatedSession: QASession = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveQASession(updatedSession);
  return updatedSession;
}

export async function saveQASession(session: QASession): Promise<void> {
  const sessionsDir = getSessionsDir(session.projectId);
  await fs.mkdir(sessionsDir, { recursive: true });
  
  const sessionPath = getSessionPath(session.projectId, session.id);
  await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
}

export async function completeQASession(sessionId: string): Promise<QASession | null> {
  return updateQASession(sessionId, {
    status: 'completed',
  });
}
```

#### Step 4-2: Question Loader

파일: `server/utils/questionLoader.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import type { Question, QuestionCategory, QACategory } from '../../src/types/qa.ts';

const TEMPLATES_PATH = path.join(process.cwd(), 'workspace', 'templates', 'questions');

export async function loadQuestionTemplate(category: QACategory): Promise<Question[]> {
  const filePath = path.join(TEMPLATES_PATH, `${category}.json`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data.questions || [];
  } catch {
    // Return default questions if template not found
    return getDefaultQuestions(category);
  }
}

export function getAvailableCategories(): QuestionCategory[] {
  return [
    {
      id: 'game-mechanic',
      name: '게임 메카닉',
      description: '핵심 게임플레이 메커니즘에 대한 질문',
      icon: '🎮',
    },
    {
      id: 'economy',
      name: '경제 시스템',
      description: '게임 내 경제와 보상 시스템에 대한 질문',
      icon: '💰',
    },
    {
      id: 'growth',
      name: '성장 시스템',
      description: '캐릭터/계정 성장과 진행에 대한 질문',
      icon: '📈',
    },
  ];
}

function getDefaultQuestions(category: QACategory): Question[] {
  const baseQuestions: Record<QACategory, Question[]> = {
    'game-mechanic': [
      { id: 'gm-1', categoryId: 'game-mechanic', text: '이 기능의 핵심 게임플레이 루프는 무엇인가요?', isRequired: true, order: 1 },
      { id: 'gm-2', categoryId: 'game-mechanic', text: '플레이어가 이 기능을 통해 얻는 재미 요소는 무엇인가요?', isRequired: true, order: 2 },
      { id: 'gm-3', categoryId: 'game-mechanic', text: '기존 시스템과 어떻게 연동되나요?', isRequired: false, order: 3 },
    ],
    'economy': [
      { id: 'ec-1', categoryId: 'economy', text: '이 기능에서 사용되는 재화는 무엇인가요?', isRequired: true, order: 1 },
      { id: 'ec-2', categoryId: 'economy', text: '재화 획득/소비 밸런스는 어떻게 설계하나요?', isRequired: true, order: 2 },
      { id: 'ec-3', categoryId: 'economy', text: '과금 요소가 있다면 어떻게 설계하나요?', isRequired: false, order: 3 },
    ],
    'growth': [
      { id: 'gr-1', categoryId: 'growth', text: '이 기능의 성장 곡선은 어떻게 설계하나요?', isRequired: true, order: 1 },
      { id: 'gr-2', categoryId: 'growth', text: '단계별 해금 요소는 무엇인가요?', isRequired: true, order: 2 },
      { id: 'gr-3', categoryId: 'growth', text: '최종 목표(End Goal)는 무엇인가요?', isRequired: false, order: 3 },
    ],
  };

  return baseQuestions[category] || [];
}
```

#### Step 4-3: Q&A API 라우트

파일: `server/routes/qa-sessions.ts`

```typescript
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  createQASession,
  getQASessionById,
  updateQASession,
  completeQASession,
} from '../utils/qaStorage.ts';
import type { QACategory } from '../../src/types/qa.ts';

export const qaSessionsRouter = Router();

// POST /api/qa-sessions
qaSessionsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId, projectId } = req.body;
    
    if (!taskId) {
      sendError(res, 400, 'taskId is required');
      return;
    }
    
    // Default category
    const category: QACategory = 'game-mechanic';
    const session = await createQASession(taskId, category);
    
    res.status(201).json({ success: true, data: session, error: null });
  } catch (error) {
    sendError(res, 500, 'Failed to create Q&A session');
  }
});

// GET /api/qa-sessions/:id
qaSessionsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await getQASessionById(req.params.id);
    if (!session) {
      sendError(res, 404, 'Session not found');
      return;
    }
    sendSuccess(res, session);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch session');
  }
});

// PUT /api/qa-sessions/:id
qaSessionsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await updateQASession(req.params.id, req.body);
    if (!session) {
      sendError(res, 404, 'Session not found');
      return;
    }
    sendSuccess(res, session);
  } catch (error) {
    sendError(res, 500, 'Failed to update session');
  }
});

// POST /api/qa-sessions/:id/complete
qaSessionsRouter.post('/:id/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await completeQASession(req.params.id);
    if (!session) {
      sendError(res, 404, 'Session not found');
      return;
    }
    sendSuccess(res, session);
  } catch (error) {
    sendError(res, 500, 'Failed to complete session');
  }
});
```

파일: `server/routes/questions.ts`

```typescript
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { loadQuestionTemplate, getAvailableCategories } from '../utils/questionLoader.ts';
import type { QACategory } from '../../src/types/qa.ts';

export const questionsRouter = Router();

// GET /api/question-library/questions
questionsRouter.get('/questions', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories: QACategory[] = ['game-mechanic', 'economy', 'growth'];
    const allQuestions = [];
    
    for (const category of categories) {
      const questions = await loadQuestionTemplate(category);
      allQuestions.push(...questions);
    }
    
    sendSuccess(res, allQuestions);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch questions');
  }
});

// GET /api/question-library/categories
questionsRouter.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = getAvailableCategories();
    sendSuccess(res, categories);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch categories');
  }
});

// GET /api/question-library/questions/:category
questionsRouter.get('/questions/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.params.category as QACategory;
    const questions = await loadQuestionTemplate(category);
    sendSuccess(res, questions);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch questions');
  }
});
```

#### Step 4-4: Q&A Service

파일: `src/services/qaService.ts`

```typescript
import type { Question, QASession, QACategory, CreateQASessionDto, UpdateQASessionDto } from '../types/qa';
import type { ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error || 'Unknown error');
  }
  return json.data as T;
}

export async function getQuestions(): Promise<Question[]> {
  const response = await fetch(`${API_BASE_URL}/api/question-library/questions`);
  return handleResponse<Question[]>(response);
}

export async function getCategories(): Promise<{ id: QACategory; name: string }[]> {
  const response = await fetch(`${API_BASE_URL}/api/question-library/categories`);
  return handleResponse<{ id: QACategory; name: string }[]>(response);
}

export async function createSession(data: CreateQASessionDto): Promise<QASession> {
  const response = await fetch(`${API_BASE_URL}/api/qa-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<QASession>(response);
}

export async function getSession(sessionId: string): Promise<QASession> {
  const response = await fetch(`${API_BASE_URL}/api/qa-sessions/${sessionId}`);
  return handleResponse<QASession>(response);
}

export async function updateSession(sessionId: string, data: UpdateQASessionDto): Promise<QASession> {
  const response = await fetch(`${API_BASE_URL}/api/qa-sessions/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<QASession>(response);
}

export async function completeSession(sessionId: string): Promise<QASession> {
  const response = await fetch(`${API_BASE_URL}/api/qa-sessions/${sessionId}/complete`, {
    method: 'POST',
  });
  return handleResponse<QASession>(response);
}
```

#### Step 4-5: Q&A Store

파일: `src/store/qaStore.ts`

```typescript
import { create } from 'zustand';
import type { Question, QASession, QACategory } from '../types/qa';
import * as qaService from '../services/qaService';

interface QAStoreState {
  questions: Question[];
  currentSession: QASession | null;
  answers: Record<string, string>;
  currentStep: number;
  selectedCategory: QACategory | null;
  isLoading: boolean;
  error: string | null;
}

interface QAStoreActions {
  loadQuestions: () => Promise<void>;
  startSession: (taskId: string, projectId: string) => Promise<void>;
  setAnswer: (questionId: string, answer: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeSession: () => Promise<void>;
  resetSession: () => void;
  calculateProgress: () => number;
}

type QAStore = QAStoreState & QAStoreActions;

export const useQAStore = create<QAStore>((set, get) => ({
  questions: [],
  currentSession: null,
  answers: {},
  currentStep: 0,
  selectedCategory: null,
  isLoading: false,
  error: null,

  loadQuestions: async () => {
    set({ isLoading: true, error: null });
    try {
      const questions = await qaService.getQuestions();
      set({ questions, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  startSession: async (taskId, projectId) => {
    set({ isLoading: true, error: null, currentStep: 0, answers: {} });
    try {
      const questions = await qaService.getQuestions();
      const session = await qaService.createSession({ taskId, projectId });
      
      set({
        questions,
        currentSession: session,
        selectedCategory: session.category,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  setAnswer: (questionId, answer) => {
    const { answers, currentSession } = get();
    const newAnswers = { ...answers, [questionId]: answer };
    set({ answers: newAnswers });

    // Update session on server
    if (currentSession) {
      qaService.updateSession(currentSession.id, { answers: newAnswers }).catch(console.error);
    }
  },

  nextStep: () => {
    const { currentStep, questions } = get();
    if (currentStep < questions.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  completeSession: async () => {
    const { currentSession, answers } = get();
    if (!currentSession) return;

    set({ isLoading: true });
    try {
      await qaService.updateSession(currentSession.id, { answers });
      const completed = await qaService.completeSession(currentSession.id);
      set({ currentSession: completed, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  resetSession: () => {
    set({
      currentSession: null,
      answers: {},
      currentStep: 0,
      selectedCategory: null,
      error: null,
    });
  },

  calculateProgress: () => {
    const { questions, answers } = get();
    if (questions.length === 0) return 0;
    
    const requiredQuestions = questions.filter((q) => q.isRequired);
    if (requiredQuestions.length === 0) return 100;
    
    const answered = requiredQuestions.filter((q) => answers[q.id]?.trim());
    return Math.round((answered.length / requiredQuestions.length) * 100);
  },
}));
```

#### Step 4-6: QAFormModal 컴포넌트

파일: `src/qa/QAFormModal.tsx`

```typescript
import { useEffect } from 'react';
import { useQAStore } from '../store/qaStore';

interface QAFormModalProps {
  isOpen: boolean;
  taskId: string;
  projectId: string;
  onComplete: () => void;
  onClose: () => void;
}

export function QAFormModal({ isOpen, taskId, projectId, onComplete, onClose }: QAFormModalProps) {
  const {
    questions,
    answers,
    currentStep,
    isLoading,
    startSession,
    setAnswer,
    nextStep,
    prevStep,
    completeSession,
    resetSession,
    calculateProgress,
  } = useQAStore();

  useEffect(() => {
    if (isOpen && taskId) {
      startSession(taskId, projectId);
    }
    return () => {
      if (!isOpen) resetSession();
    };
  }, [isOpen, taskId, projectId]);

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];
  const progress = calculateProgress();
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = !currentQuestion?.isRequired || answers[currentQuestion?.id]?.trim();

  const handleComplete = async () => {
    await completeSession();
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Q&A 응답</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {currentStep + 1} / {questions.length} 질문 ({progress}% 완료)
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : currentQuestion ? (
            <div>
              <label className="block mb-4">
                <span className="text-lg font-medium text-gray-900">
                  {currentQuestion.text}
                  {currentQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
                </span>
                {currentQuestion.description && (
                  <p className="text-sm text-gray-500 mt-1">{currentQuestion.description}</p>
                )}
              </label>
              
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder || '답변을 입력하세요...'}
                className="w-full h-40 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              질문을 불러오는 중...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            이전
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              나중에
            </button>
            
            {isLastStep ? (
              <button
                onClick={handleComplete}
                disabled={!canProceed || isLoading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
              >
                완료 & AI 생성
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                다음
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Phase 4 완료 체크리스트

- [ ] Q&A 세션 생성 API 동작
- [ ] 질문 목록 조회 API 동작
- [ ] QAFormModal에서 질문 표시
- [ ] 답변 저장 및 진행률 표시
- [ ] 완료 시 세션 상태 업데이트

---

### 4.6 Phase 5: LLM 연동 & AI 생성

#### Step 5-1: LLM Settings Storage

파일: `server/utils/llmSettingsStorage.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import type { ProjectLLMSettings, LLMProvider, LLMProviderSettings, TaskStageConfig } from '../../src/types/llm.ts';
import { createDefaultProjectLLMSettings } from '../../src/types/llm.ts';

const WORKSPACE_PATH = path.join(process.cwd(), 'workspace', 'projects');

function getSettingsPath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'llm-settings', 'settings.json');
}

export async function getLLMSettings(projectId: string): Promise<ProjectLLMSettings | null> {
  try {
    const content = await fs.readFile(getSettingsPath(projectId), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function getLLMSettingsOrDefault(projectId: string): Promise<ProjectLLMSettings> {
  const settings = await getLLMSettings(projectId);
  return settings || createDefaultProjectLLMSettings(projectId);
}

export async function saveLLMSettings(projectId: string, settings: ProjectLLMSettings): Promise<void> {
  const settingsPath = getSettingsPath(projectId);
  const dir = path.dirname(settingsPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
}

export async function updateProviderSettings(
  projectId: string,
  provider: LLMProvider,
  updates: Partial<Omit<LLMProviderSettings, 'provider'>>
): Promise<void> {
  const settings = await getLLMSettingsOrDefault(projectId);
  
  settings.providers = settings.providers.map((p) =>
    p.provider === provider ? { ...p, ...updates } : p
  );
  settings.updatedAt = new Date().toISOString();
  
  await saveLLMSettings(projectId, settings);
}

export async function updateTaskStageConfig(
  projectId: string,
  updates: Partial<TaskStageConfig>
): Promise<void> {
  const settings = await getLLMSettingsOrDefault(projectId);
  
  settings.taskStageConfig = { ...settings.taskStageConfig, ...updates };
  settings.updatedAt = new Date().toISOString();
  
  await saveLLMSettings(projectId, settings);
}
```

#### Step 5-2: LLM Provider 추상화

파일: `server/llmProviders/base.ts`

```typescript
export interface LLMGenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMGenerateResult {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ConnectionTestResult {
  success: boolean;
  status: 'connected' | 'error';
  latency?: number;
  error?: string;
  timestamp: string;
}

export abstract class BaseLLMProvider {
  protected apiKey: string;
  protected endpoint?: string;

  constructor(apiKey: string, endpoint?: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  abstract generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMGenerateResult>;
  abstract testConnection(): Promise<ConnectionTestResult>;
  abstract getAvailableModels(): Promise<string[]>;
}
```

파일: `server/llmProviders/openai.ts`

```typescript
import { BaseLLMProvider, type LLMGenerateOptions, type LLMGenerateResult, type ConnectionTestResult } from './base.ts';

export class OpenAIProvider extends BaseLLMProvider {
  private baseUrl = 'https://api.openai.com/v1';

  async generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMGenerateResult> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
    };
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const start = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      
      const latency = Date.now() - start;
      
      if (response.ok) {
        return { success: true, status: 'connected', latency, timestamp: new Date().toISOString() };
      } else {
        return { success: false, status: 'error', error: `HTTP ${response.status}`, timestamp: new Date().toISOString() };
      }
    } catch (error) {
      return { success: false, status: 'error', error: (error as Error).message, timestamp: new Date().toISOString() };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }
}
```

파일: `server/llmProviders/gemini.ts`

```typescript
import { BaseLLMProvider, type LLMGenerateOptions, type LLMGenerateResult, type ConnectionTestResult } from './base.ts';

export class GeminiProvider extends BaseLLMProvider {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  async generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMGenerateResult> {
    const model = 'gemini-1.5-flash';
    const response = await fetch(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.candidates[0].content.parts[0].text,
      model,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const start = Date.now();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.apiKey}`
      );
      
      const latency = Date.now() - start;
      
      if (response.ok) {
        return { success: true, status: 'connected', latency, timestamp: new Date().toISOString() };
      } else {
        return { success: false, status: 'error', error: `HTTP ${response.status}`, timestamp: new Date().toISOString() };
      }
    } catch (error) {
      return { success: false, status: 'error', error: (error as Error).message, timestamp: new Date().toISOString() };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];
  }
}
```

파일: `server/utils/llmProvider.ts`

```typescript
import type { LLMProviderSettings } from '../../src/types/llm.ts';
import { BaseLLMProvider } from '../llmProviders/base.ts';
import { OpenAIProvider } from '../llmProviders/openai.ts';
import { GeminiProvider } from '../llmProviders/gemini.ts';

export function createLLMProvider(settings: LLMProviderSettings): BaseLLMProvider {
  switch (settings.provider) {
    case 'openai':
      return new OpenAIProvider(settings.apiKey);
    case 'gemini':
      return new GeminiProvider(settings.apiKey);
    case 'lmstudio':
      return new OpenAIProvider(settings.apiKey, settings.endpoint);
    default:
      throw new Error(`Unsupported provider: ${settings.provider}`);
  }
}
```

#### Step 5-3: Prompt Builder

파일: `server/utils/promptBuilder.ts`

```typescript
export interface QAResponse {
  question: string;
  answer: string;
}

export function buildDesignDocumentPrompt(qaResponses: QAResponse[], featureList: string): string {
  const qaSection = qaResponses
    .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
    .join('\n\n');

  return `
다음 정보를 바탕으로 게임 기획 문서(Design Document)를 작성해주세요.

## 기능 개요
${featureList}

## Q&A 응답
${qaSection}

## 작성 요구사항
1. 마크다운 형식으로 작성
2. 다음 섹션을 포함:
   - 개요 (Overview)
   - 핵심 메카닉 (Core Mechanics)
   - 사용자 경험 흐름 (User Flow)
   - 기술적 요구사항 (Technical Requirements)
   - 밸런스 고려사항 (Balance Considerations)
3. 구체적이고 실행 가능한 내용으로 작성
4. 한국어로 작성

Design Document:
`;
}

export function buildPRDPrompt(designDocument: string, featureList: string): string {
  return `
다음 Design Document를 바탕으로 PRD(Product Requirements Document)를 작성해주세요.

## 기능 개요
${featureList}

## Design Document
${designDocument}

## 작성 요구사항
1. 마크다운 형식으로 작성
2. 다음 섹션을 포함:
   - 제품 개요 (Product Overview)
   - 기능 명세 (Functional Specifications)
   - 비기능 요구사항 (Non-functional Requirements)
   - 데이터 모델 (Data Model)
   - API 명세 (API Specifications)
   - UI/UX 요구사항 (UI/UX Requirements)
   - 테스트 시나리오 (Test Scenarios)
3. 개발팀이 바로 구현할 수 있는 수준으로 상세하게 작성
4. 한국어로 작성

PRD:
`;
}

export function buildPrototypePrompt(prd: string, featureList: string): string {
  return `
다음 PRD를 바탕으로 HTML/JavaScript 프로토타입을 생성해주세요.

## 기능 개요
${featureList}

## PRD
${prd}

## 생성 요구사항
1. 단일 HTML 파일로 생성 (인라인 CSS, JavaScript)
2. 핵심 기능이 동작하는 인터랙티브 프로토타입
3. Tailwind CSS CDN 사용 가능
4. 모바일/데스크톱 반응형
5. 주석으로 주요 로직 설명

Prototype Code:
`;
}
```

#### Step 5-4: Generate API

파일: `server/routes/generate.ts`

```typescript
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getTaskById, updateTask } from '../utils/taskStorage.ts';
import { getLLMSettingsOrDefault } from '../utils/llmSettingsStorage.ts';
import { createLLMProvider } from '../utils/llmProvider.ts';
import { buildDesignDocumentPrompt, buildPRDPrompt, buildPrototypePrompt } from '../utils/promptBuilder.ts';
import { getQASessionByTaskId } from '../utils/qaStorage.ts';

export const generateRouter = Router();

// POST /api/generate/design/:taskId
generateRouter.post('/design/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    
    const result = await getTaskById(taskId);
    if (!result) {
      sendError(res, 404, 'Task not found');
      return;
    }
    
    const { task, projectId } = result;
    
    // Get Q&A answers
    const session = await getQASessionByTaskId(taskId);
    const qaResponses = session?.answers
      ? Object.entries(session.answers).map(([questionId, answer]) => ({
          question: questionId,
          answer: answer as string,
        }))
      : [];
    
    // Get LLM settings
    const settings = await getLLMSettingsOrDefault(projectId);
    const modelConfig = settings.taskStageConfig.designDoc || settings.taskStageConfig.defaultModel;
    const providerSettings = settings.providers.find((p) => p.provider === modelConfig.provider);
    
    if (!providerSettings || !providerSettings.apiKey) {
      sendError(res, 400, 'LLM provider not configured');
      return;
    }
    
    // Generate
    const provider = createLLMProvider(providerSettings);
    const prompt = buildDesignDocumentPrompt(qaResponses, task.featureList);
    const generated = await provider.generate(prompt, {
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
    });
    
    // Update task
    const updated = await updateTask(taskId, {
      designDocument: generated.content,
      status: 'design',
    });
    
    sendSuccess(res, { task: updated, usage: generated.usage });
  } catch (error) {
    console.error('Design generation error:', error);
    sendError(res, 500, (error as Error).message);
  }
});

// POST /api/generate/prd/:taskId
generateRouter.post('/prd/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    
    const result = await getTaskById(taskId);
    if (!result) {
      sendError(res, 404, 'Task not found');
      return;
    }
    
    const { task, projectId } = result;
    
    if (!task.designDocument) {
      sendError(res, 400, 'Design document is required');
      return;
    }
    
    const settings = await getLLMSettingsOrDefault(projectId);
    const modelConfig = settings.taskStageConfig.prd || settings.taskStageConfig.defaultModel;
    const providerSettings = settings.providers.find((p) => p.provider === modelConfig.provider);
    
    if (!providerSettings || !providerSettings.apiKey) {
      sendError(res, 400, 'LLM provider not configured');
      return;
    }
    
    const provider = createLLMProvider(providerSettings);
    const prompt = buildPRDPrompt(task.designDocument, task.featureList);
    const generated = await provider.generate(prompt, {
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
    });
    
    const updated = await updateTask(taskId, {
      prd: generated.content,
      status: 'prd',
    });
    
    sendSuccess(res, { task: updated, usage: generated.usage });
  } catch (error) {
    console.error('PRD generation error:', error);
    sendError(res, 500, (error as Error).message);
  }
});

// POST /api/generate/prototype/:taskId
generateRouter.post('/prototype/:taskId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    
    const result = await getTaskById(taskId);
    if (!result) {
      sendError(res, 404, 'Task not found');
      return;
    }
    
    const { task, projectId } = result;
    
    if (!task.prd) {
      sendError(res, 400, 'PRD is required');
      return;
    }
    
    const settings = await getLLMSettingsOrDefault(projectId);
    const modelConfig = settings.taskStageConfig.prototype || settings.taskStageConfig.defaultModel;
    const providerSettings = settings.providers.find((p) => p.provider === modelConfig.provider);
    
    if (!providerSettings || !providerSettings.apiKey) {
      sendError(res, 400, 'LLM provider not configured');
      return;
    }
    
    const provider = createLLMProvider(providerSettings);
    const prompt = buildPrototypePrompt(task.prd, task.featureList);
    const generated = await provider.generate(prompt, {
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
    });
    
    const updated = await updateTask(taskId, {
      prototype: generated.content,
      status: 'prototype',
    });
    
    sendSuccess(res, { task: updated, usage: generated.usage });
  } catch (error) {
    console.error('Prototype generation error:', error);
    sendError(res, 500, (error as Error).message);
  }
});
```

#### Phase 5 완료 체크리스트

- [ ] LLM Settings 저장/조회 API 동작
- [ ] OpenAI/Gemini Provider 연동
- [ ] Design Document AI 생성 동작
- [ ] PRD AI 생성 동작
- [ ] Prototype AI 생성 동작

---

### 4.7 Phase 6: Passthrough 파이프라인

#### Step 6-1: Passthrough Storage

파일: `server/utils/passthroughStorage.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { PassthroughPipeline, PassthroughStage, PassthroughStageName } from '../../src/types/passthrough.ts';
import { createInitialStages } from '../../src/types/passthrough.ts';

const PIPELINES_PATH = path.join(process.cwd(), 'workspace', 'pipelines');

async function ensureDirectory(): Promise<void> {
  await fs.mkdir(PIPELINES_PATH, { recursive: true });
}

function getPipelinePath(id: string): string {
  return path.join(PIPELINES_PATH, `${id}.json`);
}

export async function createPipeline(taskId: string): Promise<PassthroughPipeline> {
  await ensureDirectory();
  
  const stages = createInitialStages().map((s) => ({ ...s, id: uuidv4() }));
  
  const pipeline: PassthroughPipeline = {
    id: uuidv4(),
    taskId,
    status: 'pending',
    currentStage: null,
    stages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  };
  
  await savePipeline(pipeline);
  return pipeline;
}

export async function getPipelineById(id: string): Promise<PassthroughPipeline | null> {
  try {
    const content = await fs.readFile(getPipelinePath(id), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function getPipelineByTaskId(taskId: string): Promise<PassthroughPipeline | null> {
  await ensureDirectory();
  
  try {
    const files = await fs.readdir(PIPELINES_PATH);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(PIPELINES_PATH, file), 'utf-8');
        const pipeline = JSON.parse(content) as PassthroughPipeline;
        if (pipeline.taskId === taskId) {
          return pipeline;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  
  return null;
}

export async function updatePipeline(id: string, updates: Partial<PassthroughPipeline>): Promise<PassthroughPipeline | null> {
  const pipeline = await getPipelineById(id);
  if (!pipeline) return null;
  
  const updated: PassthroughPipeline = {
    ...pipeline,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await savePipeline(updated);
  return updated;
}

export async function updateStage(
  pipelineId: string,
  stageName: PassthroughStageName,
  updates: Partial<PassthroughStage>
): Promise<PassthroughPipeline | null> {
  const pipeline = await getPipelineById(pipelineId);
  if (!pipeline) return null;
  
  pipeline.stages = pipeline.stages.map((s) =>
    s.name === stageName ? { ...s, ...updates } : s
  );
  pipeline.updatedAt = new Date().toISOString();
  
  await savePipeline(pipeline);
  return pipeline;
}

async function savePipeline(pipeline: PassthroughPipeline): Promise<void> {
  await ensureDirectory();
  await fs.writeFile(getPipelinePath(pipeline.id), JSON.stringify(pipeline, null, 2));
}
```

#### Step 6-2: Passthrough Runner

파일: `server/utils/passthroughRunner.ts`

```typescript
import type { PassthroughPipeline, PassthroughStageName } from '../../src/types/passthrough.ts';
import { updatePipeline, updateStage, getPipelineById } from './passthroughStorage.ts';
import { getTaskById, updateTask } from './taskStorage.ts';
import { getLLMSettingsOrDefault } from './llmSettingsStorage.ts';
import { createLLMProvider } from './llmProvider.ts';
import { buildDesignDocumentPrompt, buildPRDPrompt, buildPrototypePrompt } from './promptBuilder.ts';
import { getQASessionByTaskId } from './qaStorage.ts';

const STAGE_ORDER: PassthroughStageName[] = ['design_doc', 'prd', 'prototype'];

export async function runPipeline(pipelineId: string): Promise<void> {
  let pipeline = await getPipelineById(pipelineId);
  if (!pipeline) throw new Error('Pipeline not found');
  
  // Start pipeline
  pipeline = await updatePipeline(pipelineId, {
    status: 'running',
    startedAt: new Date().toISOString(),
  });
  
  if (!pipeline) throw new Error('Failed to start pipeline');
  
  const taskResult = await getTaskById(pipeline.taskId);
  if (!taskResult) throw new Error('Task not found');
  
  const { task, projectId } = taskResult;
  
  try {
    for (const stageName of STAGE_ORDER) {
      // Check if paused or cancelled
      const current = await getPipelineById(pipelineId);
      if (current?.status === 'paused' || current?.status === 'cancelled') {
        return;
      }
      
      await runStage(pipelineId, stageName, pipeline.taskId, projectId);
    }
    
    // Complete pipeline
    await updatePipeline(pipelineId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    await updatePipeline(pipelineId, {
      status: 'failed',
    });
    throw error;
  }
}

async function runStage(
  pipelineId: string,
  stageName: PassthroughStageName,
  taskId: string,
  projectId: string
): Promise<void> {
  // Update stage to running
  await updateStage(pipelineId, stageName, {
    status: 'running',
    startedAt: new Date().toISOString(),
    progress: 0,
  });
  
  await updatePipeline(pipelineId, { currentStage: stageName });
  
  try {
    const taskResult = await getTaskById(taskId);
    if (!taskResult) throw new Error('Task not found');
    
    const { task } = taskResult;
    const settings = await getLLMSettingsOrDefault(projectId);
    
    let modelConfig;
    switch (stageName) {
      case 'design_doc':
        modelConfig = settings.taskStageConfig.designDoc || settings.taskStageConfig.defaultModel;
        break;
      case 'prd':
        modelConfig = settings.taskStageConfig.prd || settings.taskStageConfig.defaultModel;
        break;
      case 'prototype':
        modelConfig = settings.taskStageConfig.prototype || settings.taskStageConfig.defaultModel;
        break;
    }
    
    const providerSettings = settings.providers.find((p) => p.provider === modelConfig.provider);
    if (!providerSettings || !providerSettings.apiKey) {
      throw new Error('LLM provider not configured');
    }
    
    const provider = createLLMProvider(providerSettings);
    let prompt: string;
    let updateField: string;
    let newStatus: 'design' | 'prd' | 'prototype';
    
    switch (stageName) {
      case 'design_doc': {
        const session = await getQASessionByTaskId(taskId);
        const qaResponses = session?.answers
          ? Object.entries(session.answers).map(([q, a]) => ({ question: q, answer: a as string }))
          : [];
        prompt = buildDesignDocumentPrompt(qaResponses, task.featureList);
        updateField = 'designDocument';
        newStatus = 'design';
        break;
      }
      case 'prd':
        if (!task.designDocument) throw new Error('Design document required');
        prompt = buildPRDPrompt(task.designDocument, task.featureList);
        updateField = 'prd';
        newStatus = 'prd';
        break;
      case 'prototype':
        if (!task.prd) throw new Error('PRD required');
        prompt = buildPrototypePrompt(task.prd, task.featureList);
        updateField = 'prototype';
        newStatus = 'prototype';
        break;
    }
    
    await updateStage(pipelineId, stageName, { progress: 50 });
    
    const generated = await provider.generate(prompt, {
      temperature: modelConfig.temperature,
      maxTokens: modelConfig.maxTokens,
    });
    
    await updateTask(taskId, { [updateField]: generated.content, status: newStatus });
    
    await updateStage(pipelineId, stageName, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      progress: 100,
    });
  } catch (error) {
    await updateStage(pipelineId, stageName, {
      status: 'failed',
      error: {
        code: 'GENERATION_ERROR',
        message: (error as Error).message,
        retryable: true,
      },
    });
    throw error;
  }
}
```

#### Step 6-3: Passthrough API

파일: `server/routes/passthrough.ts`

```typescript
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { createPipeline, getPipelineById, updatePipeline } from '../utils/passthroughStorage.ts';
import { runPipeline } from '../utils/passthroughRunner.ts';

export const passthroughRouter = Router();

// POST /api/passthrough/start
passthroughRouter.post('/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.body;
    
    if (!taskId) {
      sendError(res, 400, 'taskId is required');
      return;
    }
    
    const pipeline = await createPipeline(taskId);
    
    // Run pipeline in background
    runPipeline(pipeline.id).catch((error) => {
      console.error('Pipeline error:', error);
    });
    
    res.status(201).json({ success: true, data: pipeline, error: null });
  } catch (error) {
    sendError(res, 500, 'Failed to start pipeline');
  }
});

// GET /api/passthrough/:id
passthroughRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const pipeline = await getPipelineById(req.params.id);
    if (!pipeline) {
      sendError(res, 404, 'Pipeline not found');
      return;
    }
    sendSuccess(res, pipeline);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch pipeline');
  }
});

// POST /api/passthrough/:id/pause
passthroughRouter.post('/:id/pause', async (req: Request, res: Response): Promise<void> => {
  try {
    const pipeline = await updatePipeline(req.params.id, { status: 'paused' });
    if (!pipeline) {
      sendError(res, 404, 'Pipeline not found');
      return;
    }
    sendSuccess(res, pipeline);
  } catch (error) {
    sendError(res, 500, 'Failed to pause pipeline');
  }
});

// POST /api/passthrough/:id/resume
passthroughRouter.post('/:id/resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const pipeline = await updatePipeline(req.params.id, { status: 'running' });
    if (!pipeline) {
      sendError(res, 404, 'Pipeline not found');
      return;
    }
    
    // Resume pipeline
    runPipeline(req.params.id).catch(console.error);
    
    sendSuccess(res, pipeline);
  } catch (error) {
    sendError(res, 500, 'Failed to resume pipeline');
  }
});

// POST /api/passthrough/:id/cancel
passthroughRouter.post('/:id/cancel', async (req: Request, res: Response): Promise<void> => {
  try {
    const pipeline = await updatePipeline(req.params.id, { status: 'cancelled' });
    if (!pipeline) {
      sendError(res, 404, 'Pipeline not found');
      return;
    }
    sendSuccess(res, pipeline);
  } catch (error) {
    sendError(res, 500, 'Failed to cancel pipeline');
  }
});
```

#### Phase 6 완료 체크리스트

- [ ] 파이프라인 생성 및 시작 동작
- [ ] 단계별 순차 실행 (design → prd → prototype)
- [ ] 파이프라인 상태 조회
- [ ] 일시정지/재개/취소 동작

---

## 5. API 명세

### 5.1 API 엔드포인트 전체 목록

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **Projects** |
| GET | `/api/projects` | 프로젝트 목록 | - | `Project[]` |
| GET | `/api/projects/:id` | 프로젝트 조회 | - | `Project` |
| POST | `/api/projects` | 프로젝트 생성 | `CreateProjectDto` | `Project` |
| PUT | `/api/projects/:id` | 프로젝트 수정 | `Partial<Project>` | `Project` |
| DELETE | `/api/projects/:id` | 프로젝트 삭제 | - | `{ deleted: true }` |
| **Tasks** |
| GET | `/api/projects/:projectId/tasks` | 태스크 목록 | - | `Task[]` |
| POST | `/api/projects/:projectId/tasks` | 태스크 생성 | `CreateTaskDto` | `Task` |
| GET | `/api/tasks/:id` | 태스크 조회 | - | `Task` |
| PUT | `/api/tasks/:id` | 태스크 수정 | `Partial<Task>` | `Task` |
| PUT | `/api/tasks/:id/status` | 상태 변경 | `{ status }` | `Task` |
| DELETE | `/api/tasks/:id` | 태스크 삭제 | - | `{ deleted: true }` |
| **Q&A** |
| GET | `/api/question-library/questions` | 전체 질문 목록 | - | `Question[]` |
| GET | `/api/question-library/categories` | 카테고리 목록 | - | `QuestionCategory[]` |
| POST | `/api/qa-sessions` | 세션 생성 | `CreateQASessionDto` | `QASession` |
| GET | `/api/qa-sessions/:id` | 세션 조회 | - | `QASession` |
| PUT | `/api/qa-sessions/:id` | 세션 수정 | `UpdateQASessionDto` | `QASession` |
| POST | `/api/qa-sessions/:id/complete` | 세션 완료 | - | `QASession` |
| **LLM Settings** |
| GET | `/api/projects/:id/llm-settings` | 설정 조회 | - | `ProjectLLMSettings` |
| PUT | `/api/projects/:id/llm-settings` | 설정 수정 | `Partial<ProjectLLMSettings>` | `ProjectLLMSettings` |
| POST | `/api/projects/:id/llm-settings/test-connection/:provider` | 연결 테스트 | - | `ConnectionTestResult` |
| **AI Generation** |
| POST | `/api/generate/design/:taskId` | Design 생성 | - | `{ task, usage }` |
| POST | `/api/generate/prd/:taskId` | PRD 생성 | - | `{ task, usage }` |
| POST | `/api/generate/prototype/:taskId` | Prototype 생성 | - | `{ task, usage }` |
| **Passthrough** |
| POST | `/api/passthrough/start` | 파이프라인 시작 | `{ taskId }` | `PassthroughPipeline` |
| GET | `/api/passthrough/:id` | 파이프라인 조회 | - | `PassthroughPipeline` |
| POST | `/api/passthrough/:id/pause` | 일시정지 | - | `PassthroughPipeline` |
| POST | `/api/passthrough/:id/resume` | 재개 | - | `PassthroughPipeline` |
| POST | `/api/passthrough/:id/cancel` | 취소 | - | `PassthroughPipeline` |
| **Systems** |
| GET | `/api/projects/:projectId/systems` | 시스템 문서 목록 | - | `SystemDocument[]` |
| POST | `/api/projects/:projectId/systems` | 시스템 문서 생성 | `CreateSystemDocumentDto` | `SystemDocument` |
| PUT | `/api/projects/:projectId/systems/:id` | 시스템 문서 수정 | `Partial<SystemDocument>` | `SystemDocument` |
| DELETE | `/api/projects/:projectId/systems/:id` | 시스템 문서 삭제 | - | `{ deleted: true }` |

### 5.2 API Response 형식

모든 API는 다음 형식으로 응답합니다:

```typescript
// 성공 응답
{
  "success": true,
  "data": <실제 데이터>,
  "error": null
}

// 에러 응답
{
  "success": false,
  "data": null,
  "error": "에러 메시지"
}
```

### 5.3 HTTP 상태 코드

| 코드 | 의미 | 사용 상황 |
|------|------|----------|
| 200 | OK | 조회, 수정 성공 |
| 201 | Created | 생성 성공 |
| 400 | Bad Request | 필수 필드 누락, 유효성 검사 실패 |
| 404 | Not Found | 리소스 없음 |
| 500 | Internal Server Error | 서버 에러 |

---

## 6. 화면 명세

### 6.1 메인 레이아웃

```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Logo            │  │ ProjectSelector │  │ Settings Button │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Main Content Area                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Kanban Board                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │   │
│  │  │Feature  │ │ Design  │ │   PRD   │ │Prototype│         │   │
│  │  │ List    │ │   Doc   │ │         │ │         │         │   │
│  │  │         │ │         │ │         │ │         │         │   │
│  │  │ [Card]  │ │ [Card]  │ │ [Card]  │ │ [Card]  │         │   │
│  │  │ [Card]  │ │         │ │         │ │         │         │   │
│  │  │         │ │         │ │         │ │         │         │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 칸반 보드 동작 흐름

#### 초기 로드
```
1. App 마운트
   ↓
2. ProjectSelector: projectStore.fetchProjects() 호출
   ↓
3. 프로젝트 선택 시: projectStore.selectProject(id) 호출
   ↓
4. KanbanBoard: taskStore.fetchTasks(projectId) 호출
   ↓
5. 4개 컬럼에 status별로 태스크 배치
```

#### 태스크 생성
```
1. "새 태스크" 버튼 클릭
   ↓
2. TaskCreateModal 오픈
   ↓
3. 제목, Feature List 입력
   ↓
4. 저장: taskStore.createTask() 호출
   ↓
5. 칸반 보드 자동 갱신 (featurelist 컬럼에 추가)
```

#### 드래그 앤 드롭 - Feature → Design
```
1. featurelist 컬럼의 카드를 design 컬럼으로 드래그
   ↓
2. handleDragEnd 이벤트 발생
   ↓
3. Q&A 모달 자동 오픈 (QAFormModal)
   ↓
4. 사용자가 Q&A 응답 입력
   ↓
5. "완료 & AI 생성" 버튼 클릭
   ↓
6. qaStore.completeSession() 호출
   ↓
7. POST /api/generate/design/:taskId 호출
   ↓
8. Design Document 생성 완료
   ↓
9. 태스크가 design 컬럼으로 이동
```

#### 드래그 앤 드롭 - Design → PRD
```
1. design 컬럼의 카드를 prd 컬럼으로 드래그
   ↓
2. taskStore.setGenerating(taskId, true)
   ↓
3. POST /api/generate/prd/:taskId 호출
   ↓
4. PRD 생성 완료
   ↓
5. taskStore.setGenerating(taskId, false)
   ↓
6. 태스크가 prd 컬럼으로 이동
```

### 6.3 Q&A 모달 동작 흐름

```
┌─────────────────────────────────────────────────────────────┐
│  Q&A 응답                                              [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████████████████░░░░░░░░░░  60% 완료                  │
│  3 / 5 질문                                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Q3. 이 기능의 핵심 게임플레이 루프는 무엇인가요? *         │
│  핵심적인 반복 구조를 설명해주세요.                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  사용자 답변 입력 영역                              │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [이전]                              [나중에] [다음]        │
│                                    (마지막이면 [완료 & AI]) │
└─────────────────────────────────────────────────────────────┘
```

#### 동작 흐름
```
1. QAFormModal 오픈 (isOpen=true, taskId, projectId 전달)
   ↓
2. useEffect: qaStore.startSession(taskId, projectId) 호출
   ↓
3. 질문 목록 로드 및 빈 세션 생성
   ↓
4. 현재 질문 표시 (questions[currentStep])
   ↓
5. 답변 입력 → qaStore.setAnswer(questionId, answer)
   ↓
6. [다음] 클릭 → qaStore.nextStep()
   ↓
7. 마지막 질문에서 [완료 & AI] 클릭
   ↓
8. qaStore.completeSession() 호출
   ↓
9. onComplete 콜백 호출 (부모에서 AI 생성 트리거)
   ↓
10. onClose 콜백 호출 (모달 닫기)
```

### 6.4 LLM 설정 패널

```
┌─────────────────────────────────────────────────────────────┐
│  LLM 설정                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  프로바이더 설정                                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ OpenAI                              [연결 테스트]    │   │
│  │ API Key: ●●●●●●●●●●●●●●●●                           │   │
│  │ 상태: ✅ 연결됨                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Gemini                              [연결 테스트]    │   │
│  │ API Key: ____________________________               │   │
│  │ 상태: ⚪ 미설정                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  단계별 모델 설정                                           │
│                                                             │
│  Design Document:  [OpenAI ▼] [gpt-4o-mini ▼]              │
│  PRD:              [OpenAI ▼] [gpt-4o ▼]                   │
│  Prototype:        [OpenAI ▼] [gpt-4o ▼]                   │
│                                                             │
│                                         [저장]              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 시드 데이터

### 7.1 Q&A 질문 템플릿

파일: `workspace/templates/questions/game-mechanic.json`

```json
{
  "category": {
    "id": "game-mechanic",
    "name": "게임 메카닉",
    "description": "핵심 게임플레이 메커니즘에 대한 질문",
    "icon": "🎮"
  },
  "questions": [
    {
      "id": "gm-1",
      "categoryId": "game-mechanic",
      "text": "이 기능의 핵심 게임플레이 루프는 무엇인가요?",
      "description": "플레이어가 반복적으로 수행하게 될 핵심 행동 패턴을 설명해주세요.",
      "placeholder": "예: 몬스터 발견 → 전투 → 보상 획득 → 장비 강화 → 더 강한 몬스터 도전",
      "isRequired": true,
      "order": 1
    },
    {
      "id": "gm-2",
      "categoryId": "game-mechanic",
      "text": "플레이어가 이 기능을 통해 얻는 핵심 재미 요소는 무엇인가요?",
      "description": "성취감, 수집, 경쟁, 탐험 등 어떤 재미를 제공하나요?",
      "placeholder": "예: 희귀 아이템 수집의 수집 재미, 랭킹 경쟁의 성취감",
      "isRequired": true,
      "order": 2
    },
    {
      "id": "gm-3",
      "categoryId": "game-mechanic",
      "text": "기존 게임 시스템과 어떻게 연동되나요?",
      "description": "다른 시스템과의 연결점과 상호작용을 설명해주세요.",
      "placeholder": "예: 인벤토리 시스템과 연동, 퀘스트 시스템에서 참조",
      "isRequired": false,
      "order": 3
    },
    {
      "id": "gm-4",
      "categoryId": "game-mechanic",
      "text": "이 기능의 진입 조건과 해금 요소는 무엇인가요?",
      "description": "플레이어가 이 기능을 사용하기 위한 조건을 설명해주세요.",
      "placeholder": "예: 레벨 30 달성, 메인 퀘스트 3장 클리어",
      "isRequired": false,
      "order": 4
    }
  ]
}
```

파일: `workspace/templates/questions/economy.json`

```json
{
  "category": {
    "id": "economy",
    "name": "경제 시스템",
    "description": "게임 내 경제와 보상 시스템에 대한 질문",
    "icon": "💰"
  },
  "questions": [
    {
      "id": "ec-1",
      "categoryId": "economy",
      "text": "이 기능에서 사용되는 재화는 무엇인가요?",
      "description": "소비/획득되는 모든 재화 종류를 나열해주세요.",
      "placeholder": "예: 골드(소비), 강화석(소비), 장비(획득), 경험치(획득)",
      "isRequired": true,
      "order": 1
    },
    {
      "id": "ec-2",
      "categoryId": "economy",
      "text": "재화의 획득/소비 밸런스는 어떻게 설계하나요?",
      "description": "시간당/일당 예상 획득량과 소비량을 설명해주세요.",
      "placeholder": "예: 일일 골드 획득 10만, 강화 1회당 골드 소비 1만",
      "isRequired": true,
      "order": 2
    },
    {
      "id": "ec-3",
      "categoryId": "economy",
      "text": "과금 요소가 있다면 어떻게 설계하나요?",
      "description": "유료 재화 사용처와 무과금 유저와의 격차를 설명해주세요.",
      "placeholder": "예: 다이아로 강화 확률 부스트 구매 가능, 최대 20% 효율 차이",
      "isRequired": false,
      "order": 3
    }
  ]
}
```

파일: `workspace/templates/questions/growth.json`

```json
{
  "category": {
    "id": "growth",
    "name": "성장 시스템",
    "description": "캐릭터/계정 성장과 진행에 대한 질문",
    "icon": "📈"
  },
  "questions": [
    {
      "id": "gr-1",
      "categoryId": "growth",
      "text": "이 기능의 성장 곡선은 어떻게 설계하나요?",
      "description": "초반/중반/후반 성장 속도와 체감을 설명해주세요.",
      "placeholder": "예: 초반 빠른 성장(1-10레벨 1일), 후반 점진적(90-100레벨 1주)",
      "isRequired": true,
      "order": 1
    },
    {
      "id": "gr-2",
      "categoryId": "growth",
      "text": "단계별 해금 요소는 무엇인가요?",
      "description": "성장에 따라 해금되는 콘텐츠나 기능을 설명해주세요.",
      "placeholder": "예: 10레벨-펫 시스템, 30레벨-길드, 50레벨-PvP",
      "isRequired": true,
      "order": 2
    },
    {
      "id": "gr-3",
      "categoryId": "growth",
      "text": "최종 목표(End Goal)는 무엇인가요?",
      "description": "이 시스템의 궁극적인 도달점을 설명해주세요.",
      "placeholder": "예: 전설 등급 장비 풀셋 완성, 서버 랭킹 100위 이내",
      "isRequired": false,
      "order": 3
    }
  ]
}
```

### 7.2 초기 디렉토리 생성 스크립트

파일: `scripts/init-workspace.sh`

```bash
#!/bin/bash

# workspace 디렉토리 구조 생성
mkdir -p workspace/projects
mkdir -p workspace/templates/questions
mkdir -p workspace/pipelines

# 질문 템플릿 복사 (이미 존재하면 스킵)
if [ ! -f workspace/templates/questions/game-mechanic.json ]; then
  echo "Creating question templates..."
  # 여기에 템플릿 JSON 생성 코드
fi

echo "Workspace initialized!"
```

---

## 8. AI 코딩 규칙

### 8.1 Critical Files - 삭제 금지

```
🔴 Entry Points (삭제 시 앱 동작 불가)
├── src/main.tsx
├── src/App.tsx
└── server/index.ts

🔴 Core Types (수정 시 전체 빌드 실패)
├── src/types/index.ts
├── src/types/qa.ts
├── src/types/llm.ts
└── src/types/passthrough.ts

🔴 Core Modules (삭제 금지)
├── Q&A Module
│   ├── src/store/qaStore.ts
│   ├── src/services/qaService.ts
│   ├── server/routes/qa-sessions.ts
│   └── server/routes/questions.ts
├── LLM Module
│   ├── src/store/llmSettingsStore.ts
│   ├── src/services/llmSettingsService.ts
│   ├── server/routes/llmSettings.ts
│   └── server/utils/llmProvider.ts
└── Passthrough Module
    ├── src/store/passthroughStore.ts
    ├── src/services/passthroughService.ts
    └── server/routes/passthrough.ts
```

### 8.2 API-Service-Store 연결 규칙

| Store Method | Service Method | API Endpoint |
|--------------|----------------|--------------|
| `projectStore.fetchProjects()` | `projectService.getProjects()` | `GET /api/projects` |
| `taskStore.fetchTasks(projectId)` | `taskService.getTasks(projectId)` | `GET /api/projects/:projectId/tasks` |
| `qaStore.loadQuestions()` | `qaService.getQuestions()` | `GET /api/question-library/questions` |
| `qaStore.startSession()` | `qaService.createSession()` | `POST /api/qa-sessions` |
| `llmSettingsStore.loadSettings()` | `llmSettingsService.getLLMSettings()` | `GET /api/projects/:id/llm-settings` |
| `passthroughStore.startPipeline()` | `passthroughService.startPipeline()` | `POST /api/passthrough/start` |

### 8.3 TypeScript 린트 규칙

```typescript
// ✅ 올바른 타입 import
import type { Task, Project } from '../types';

// ❌ 잘못된 타입 import
import { Task, Project } from '../types';

// ✅ 올바른 서버 파일 import
import { sendSuccess } from '../utils/response.ts';

// ❌ 잘못된 서버 파일 import
import { sendSuccess } from '../utils/response';

// ✅ 사용하지 않는 파라미터
function handler(_req: Request, res: Response) { }

// ❌ 사용하지 않는 파라미터
function handler(req: Request, res: Response) { }
```

### 8.4 파일 생성 위치 규칙

| 파일 유형 | 위치 | 네이밍 |
|-----------|------|--------|
| Store | `src/store/` | `{name}Store.ts` |
| Service | `src/services/` | `{name}Service.ts` |
| 타입 | `src/types/` | `{name}.ts` |
| 컴포넌트 | `src/{domain}/` | `{Name}.tsx` |
| API Route | `server/routes/` | `{name}.ts` |
| Storage | `server/utils/` | `{name}Storage.ts` |

### 8.5 새 기능 추가 시 체크리스트

```
□ 1. 타입 정의 (src/types/{name}.ts)
□ 2. Storage 구현 (server/utils/{name}Storage.ts)
□ 3. API Route 구현 (server/routes/{name}.ts)
□ 4. server/index.ts에 라우터 등록
□ 5. Service 구현 (src/services/{name}Service.ts)
□ 6. Store 구현 (src/store/{name}Store.ts)
□ 7. UI 컴포넌트 구현 (src/{domain}/*.tsx)
□ 8. npm run lint 통과 확인
□ 9. npx tsc --noEmit 통과 확인
```

### 8.6 절대 하지 말 것

| 금지 행위 | 이유 |
|-----------|------|
| `src/types/*.ts`의 기존 필드 삭제 | 전체 컴파일 에러 |
| Store public method 시그니처 변경 | 연결된 컴포넌트 에러 |
| API endpoint URL 패턴 변경 | Service 연결 끊김 |
| `server/index.ts` 라우터 순서 변경 | 라우팅 우선순위 문제 |
| 서버 import에서 `.ts` 확장자 생략 | 런타임 에러 |
| `import type` 대신 `import` 사용 (타입만 가져올 때) | 린트 에러 |

---

## 9. 빠른 시작 가이드

### 9.1 프로젝트 셋업 (5분)

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

# 3. 서버 폴더 생성
mkdir -p server/routes server/utils server/llmProviders
mkdir -p workspace/templates/questions workspace/projects workspace/pipelines
```

### 9.2 파일 생성 순서

```
1. src/types/index.ts       ← 핵심 타입 정의
2. src/types/qa.ts          ← Q&A 타입
3. src/types/llm.ts         ← LLM 타입  
4. src/types/passthrough.ts ← Passthrough 타입
5. server/utils/response.ts ← API 응답 헬퍼
6. server/index.ts          ← 서버 진입점
7. vite.config.ts           ← Vite 프록시 설정
8. src/App.tsx              ← 앱 기본 구조
```

### 9.3 Phase별 구현

| Phase | 핵심 파일 | 예상 시간 |
|-------|----------|----------|
| 1 | 타입 정의, 서버 기본 | 2시간 |
| 2 | projectStorage, projectsRouter, projectStore | 3시간 |
| 3 | taskStorage, tasksRouter, taskStore, KanbanBoard | 4시간 |
| 4 | qaStorage, qaSessionsRouter, qaStore, QAFormModal | 4시간 |
| 5 | llmSettingsStorage, llmProvider, generateRouter | 4시간 |
| 6 | passthroughStorage, passthroughRunner | 3시간 |

### 9.4 Claude Code 시작 프롬프트

```
이 PRD를 참조하여 DesignWorkflow 프로젝트를 처음부터 구현해주세요.

구현 순서:
1. Phase 1부터 순차적으로 진행
2. 각 Phase 완료 후 체크리스트 확인
3. npm run lint, npx tsc --noEmit 통과 확인

핵심 규칙:
- 타입 import는 'import type' 사용
- 서버 파일 import는 .ts 확장자 필수
- API-Service-Store 연결은 Connection Map 참조
- Critical Files 삭제 금지
```

---

**Document Version**: 2.0.0  
**Last Updated**: 2026-01-15  
**Purpose**: Claude Code를 사용한 처음부터 구현용 PRD

---

### 4.7 Phase 7: 시스템 문서 & 참조

#### Step 7-1: System Storage 구현

파일: `server/utils/systemStorage.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { SystemDocument, CreateSystemDocumentDto } from '../../src/types/index.ts';

const WORKSPACE_PATH = path.join(process.cwd(), 'workspace', 'projects');

function getSystemsPath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'systems');
}

function getSystemFilePath(projectId: string, systemId: string): string {
  return path.join(getSystemsPath(projectId), `${systemId}.json`);
}

export async function getSystemsByProject(projectId: string): Promise<SystemDocument[]> {
  const systemsPath = getSystemsPath(projectId);
  
  try {
    await fs.mkdir(systemsPath, { recursive: true });
    const files = await fs.readdir(systemsPath);
    const systems: SystemDocument[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(systemsPath, file), 'utf-8');
        systems.push(JSON.parse(content));
      }
    }
    
    return systems.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function getSystemById(projectId: string, systemId: string): Promise<SystemDocument | null> {
  try {
    const content = await fs.readFile(getSystemFilePath(projectId, systemId), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function createSystem(data: CreateSystemDocumentDto): Promise<SystemDocument> {
  const systemsPath = getSystemsPath(data.projectId);
  await fs.mkdir(systemsPath, { recursive: true });
  
  const system: SystemDocument = {
    id: uuidv4(),
    projectId: data.projectId,
    name: data.name,
    category: data.category,
    tags: data.tags || [],
    content: data.content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await fs.writeFile(getSystemFilePath(data.projectId, system.id), JSON.stringify(system, null, 2));
  return system;
}

export async function updateSystem(
  projectId: string,
  systemId: string,
  updates: Partial<Omit<SystemDocument, 'id' | 'projectId' | 'createdAt'>>
): Promise<SystemDocument | null> {
  const system = await getSystemById(projectId, systemId);
  if (!system) return null;
  
  const updatedSystem: SystemDocument = {
    ...system,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await fs.writeFile(getSystemFilePath(projectId, systemId), JSON.stringify(updatedSystem, null, 2));
  return updatedSystem;
}

export async function deleteSystem(projectId: string, systemId: string): Promise<boolean> {
  try {
    await fs.unlink(getSystemFilePath(projectId, systemId));
    return true;
  } catch {
    return false;
  }
}
```

#### Step 7-2: Systems API 라우트

파일: `server/routes/systems.ts`

```typescript
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  getSystemsByProject,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem,
} from '../utils/systemStorage.ts';

export const systemsRouter = Router({ mergeParams: true });

// GET /api/projects/:projectId/systems
systemsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const systems = await getSystemsByProject(projectId);
    sendSuccess(res, systems);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch systems');
  }
});

// GET /api/projects/:projectId/systems/:id
systemsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, id } = req.params;
    const system = await getSystemById(projectId, id);
    if (!system) {
      sendError(res, 404, 'System document not found');
      return;
    }
    sendSuccess(res, system);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch system');
  }
});

// POST /api/projects/:projectId/systems
systemsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { name, content, category } = req.body;
    
    if (!name || !content) {
      sendError(res, 400, 'Name and content are required');
      return;
    }
    
    const system = await createSystem({
      projectId,
      name,
      content,
      category: category || 'general',
      tags: req.body.tags,
    });
    
    res.status(201).json({ success: true, data: system, error: null });
  } catch (error) {
    sendError(res, 500, 'Failed to create system');
  }
});

// PUT /api/projects/:projectId/systems/:id
systemsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, id } = req.params;
    const system = await updateSystem(projectId, id, req.body);
    if (!system) {
      sendError(res, 404, 'System document not found');
      return;
    }
    sendSuccess(res, system);
  } catch (error) {
    sendError(res, 500, 'Failed to update system');
  }
});

// DELETE /api/projects/:projectId/systems/:id
systemsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, id } = req.params;
    const deleted = await deleteSystem(projectId, id);
    if (!deleted) {
      sendError(res, 404, 'System document not found');
      return;
    }
    sendSuccess(res, { deleted: true });
  } catch (error) {
    sendError(res, 500, 'Failed to delete system');
  }
});
```

#### Step 7-3: System Service

파일: `src/services/systemService.ts`

```typescript
import type { SystemDocument, CreateSystemDocumentDto, ApiResponse } from '../types';

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error || 'Unknown error');
  return json.data as T;
}

export async function getSystems(projectId: string): Promise<SystemDocument[]> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/systems`);
  return handleResponse<SystemDocument[]>(response);
}

export async function getSystem(projectId: string, id: string): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/systems/${id}`);
  return handleResponse<SystemDocument>(response);
}

export async function createSystem(data: CreateSystemDocumentDto): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/projects/${data.projectId}/systems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<SystemDocument>(response);
}

export async function updateSystem(projectId: string, id: string, data: Partial<SystemDocument>): Promise<SystemDocument> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/systems/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<SystemDocument>(response);
}

export async function deleteSystem(projectId: string, id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/systems/${id}`, { method: 'DELETE' });
  await handleResponse<{ deleted: boolean }>(response);
}
```

#### Step 7-4: System Store

파일: `src/store/systemStore.ts`

```typescript
import { create } from 'zustand';
import type { SystemDocument, CreateSystemDocumentDto } from '../types';
import * as systemService from '../services/systemService';

interface SystemStoreState {
  systems: SystemDocument[];
  selectedSystem: SystemDocument | null;
  isLoading: boolean;
  error: string | null;
}

interface SystemStoreActions {
  fetchSystems: (projectId: string) => Promise<void>;
  createSystem: (data: CreateSystemDocumentDto) => Promise<SystemDocument>;
  updateSystem: (projectId: string, id: string, data: Partial<SystemDocument>) => Promise<void>;
  deleteSystem: (projectId: string, id: string) => Promise<void>;
  selectSystem: (system: SystemDocument | null) => void;
  clearSystems: () => void;
}

export const useSystemStore = create<SystemStoreState & SystemStoreActions>((set, get) => ({
  systems: [],
  selectedSystem: null,
  isLoading: false,
  error: null,

  fetchSystems: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const systems = await systemService.getSystems(projectId);
      set({ systems, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  createSystem: async (data) => {
    set({ isLoading: true });
    const system = await systemService.createSystem(data);
    set((state) => ({ systems: [system, ...state.systems], isLoading: false }));
    return system;
  },

  updateSystem: async (projectId, id, data) => {
    const updated = await systemService.updateSystem(projectId, id, data);
    set((state) => ({
      systems: state.systems.map((s) => (s.id === id ? updated : s)),
      selectedSystem: state.selectedSystem?.id === id ? updated : state.selectedSystem,
    }));
  },

  deleteSystem: async (projectId, id) => {
    await systemService.deleteSystem(projectId, id);
    set((state) => ({
      systems: state.systems.filter((s) => s.id !== id),
      selectedSystem: state.selectedSystem?.id === id ? null : state.selectedSystem,
    }));
  },

  selectSystem: (system) => set({ selectedSystem: system }),
  clearSystems: () => set({ systems: [], selectedSystem: null }),
}));
```

#### Step 7-5: SystemSidebar 컴포넌트

파일: `src/system/SystemSidebar.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useSystemStore } from '../store/systemStore';
import { useProjectStore } from '../store/projectStore';

interface SystemSidebarProps {
  onSelectReferences?: (ids: string[]) => void;
  selectedReferences?: string[];
}

export function SystemSidebar({ onSelectReferences, selectedReferences = [] }: SystemSidebarProps) {
  const { currentProject } = useProjectStore();
  const { systems, fetchSystems, createSystem } = useSystemStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    if (currentProject) fetchSystems(currentProject.id);
  }, [currentProject, fetchSystems]);

  const handleCreate = async () => {
    if (!currentProject || !newName || !newContent) return;
    await createSystem({ projectId: currentProject.id, name: newName, content: newContent, category: 'general' });
    setShowCreate(false);
    setNewName('');
    setNewContent('');
  };

  const toggleRef = (id: string) => {
    if (!onSelectReferences) return;
    const newRefs = selectedReferences.includes(id)
      ? selectedReferences.filter((r) => r !== id)
      : [...selectedReferences, id];
    onSelectReferences(newRefs);
  };

  if (!currentProject) return <div className="w-64 bg-gray-50 border-r p-4">프로젝트 선택 필요</div>;

  return (
    <div className="w-64 bg-gray-50 border-r p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">시스템 문서</h3>
        <button onClick={() => setShowCreate(true)} className="text-blue-500 text-sm">+ 추가</button>
      </div>

      <div className="space-y-2">
        {systems.map((system) => (
          <div
            key={system.id}
            onClick={() => toggleRef(system.id)}
            className={`p-2 rounded cursor-pointer ${
              selectedReferences.includes(system.id) ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-100'
            } border`}
          >
            <div className="font-medium text-sm">{system.name}</div>
            <div className="text-xs text-gray-500">{system.category}</div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-bold mb-4">새 시스템 문서</h3>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="문서 이름"
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="내용 (마크다운)"
              className="w-full p-2 border rounded h-40 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded">취소</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded">생성</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Phase 7 완료 체크리스트

- [ ] 시스템 문서 CRUD API 동작
- [ ] 시스템 문서 목록 사이드바 표시
- [ ] 태스크에 참조 문서 선택 가능
- [ ] AI 생성 시 참조 문서 컨텍스트 포함

---

### 4.8 Phase 8: 대시보드 & 마무리

#### Step 8-1: Dashboard API

파일: `server/routes/dashboard.ts`

```typescript
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getTasksByProject } from '../utils/taskStorage.ts';
import type { TaskStatus, DashboardStats, ActivityItem } from '../../src/types/index.ts';

export const dashboardRouter = Router({ mergeParams: true });

// GET /api/projects/:projectId/dashboard
dashboardRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const tasks = await getTasksByProject(projectId);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const tasksByStatus: Record<TaskStatus, number> = {
      featurelist: 0,
      design: 0,
      prd: 0,
      prototype: 0,
    };
    
    tasks.forEach((task) => {
      if (!task.isArchived) {
        tasksByStatus[task.status]++;
      }
    });
    
    const completedTasks = tasks.filter((t) => t.status === 'prototype' && t.prototype);
    const completedToday = completedTasks.filter((t) => new Date(t.updatedAt) >= today).length;
    const completedThisWeek = completedTasks.filter((t) => new Date(t.updatedAt) >= weekAgo).length;
    
    // Calculate average completion time
    let avgTime = 0;
    const completed = tasks.filter((t) => t.status === 'prototype');
    if (completed.length > 0) {
      const totalTime = completed.reduce((sum, t) => {
        return sum + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime());
      }, 0);
      avgTime = totalTime / completed.length / (1000 * 60 * 60); // hours
    }
    
    // Recent activity
    const recentActivity: ActivityItem[] = tasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((task) => ({
        id: task.id,
        taskId: task.id,
        taskTitle: task.title,
        action: task.status === 'prototype' ? 'completed' : 'moved',
        toStatus: task.status,
        timestamp: task.updatedAt,
      }));
    
    const stats: DashboardStats = {
      projectId,
      totalTasks: tasks.filter((t) => !t.isArchived).length,
      tasksByStatus,
      completedToday,
      completedThisWeek,
      averageCompletionTime: Math.round(avgTime * 10) / 10,
      recentActivity,
    };
    
    sendSuccess(res, stats);
  } catch (error) {
    sendError(res, 500, 'Failed to fetch dashboard stats');
  }
});
```

#### Step 8-2: Dashboard Service & Store

파일: `src/services/dashboardService.ts`

```typescript
import type { DashboardStats, ApiResponse } from '../types';

const API_BASE_URL = '/api';

export async function getDashboardStats(projectId: string): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/dashboard`);
  const json = (await response.json()) as ApiResponse<DashboardStats>;
  if (!json.success) throw new Error(json.error || 'Unknown error');
  return json.data as DashboardStats;
}
```

파일: `src/store/dashboardStore.ts`

```typescript
import { create } from 'zustand';
import type { DashboardStats } from '../types';
import * as dashboardService from '../services/dashboardService';

interface DashboardStoreState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

interface DashboardStoreActions {
  fetchStats: (projectId: string) => Promise<void>;
  clearStats: () => void;
}

export const useDashboardStore = create<DashboardStoreState & DashboardStoreActions>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await dashboardService.getDashboardStats(projectId);
      set({ stats, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
    }
  },

  clearStats: () => set({ stats: null }),
}));
```

#### Step 8-3: DashboardPanel 컴포넌트

파일: `src/dashboard/DashboardPanel.tsx`

```typescript
import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { useProjectStore } from '../store/projectStore';

export function DashboardPanel() {
  const { currentProject } = useProjectStore();
  const { stats, fetchStats, isLoading } = useDashboardStore();

  useEffect(() => {
    if (currentProject) {
      fetchStats(currentProject.id);
      const interval = setInterval(() => fetchStats(currentProject.id), 30000);
      return () => clearInterval(interval);
    }
  }, [currentProject, fetchStats]);

  if (!currentProject) return null;
  if (isLoading && !stats) return <div className="p-4">로딩 중...</div>;
  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">📊 대시보드</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
          <div className="text-sm text-gray-500">전체 태스크</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
          <div className="text-sm text-gray-500">오늘 완료</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.completedThisWeek}</div>
          <div className="text-sm text-gray-500">이번 주 완료</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.averageCompletionTime}h</div>
          <div className="text-sm text-gray-500">평균 완료 시간</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {(['featurelist', 'design', 'prd', 'prototype'] as const).map((status) => (
          <div key={status} className="text-center">
            <div className="text-lg font-semibold">{stats.tasksByStatus[status]}</div>
            <div className="text-xs text-gray-500 capitalize">{status}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-2">최근 활동</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {stats.recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="text-sm flex justify-between">
              <span className="text-gray-700">{activity.taskTitle}</span>
              <span className="text-gray-400">{activity.toStatus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### Step 8-4: 최종 server/index.ts

파일: `server/index.ts` (전체)

```typescript
import express, { type Express } from 'express';
import cors from 'cors';

// Routes
import { projectsRouter } from './routes/projects.ts';
import { tasksRouter, getProjectTasks, createProjectTask } from './routes/tasks.ts';
import { qaSessionsRouter } from './routes/qa-sessions.ts';
import { questionsRouter } from './routes/questions.ts';
import { systemsRouter } from './routes/systems.ts';
import { llmSettingsRouter } from './routes/llmSettings.ts';
import { generateRouter } from './routes/generate.ts';
import { passthroughRouter } from './routes/passthrough.ts';
import { dashboardRouter } from './routes/dashboard.ts';

export function createApp(): Express {
  const app = express();
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  
  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Project routes
  app.use('/api/projects', projectsRouter);
  
  // Task routes
  app.use('/api/tasks', tasksRouter);
  app.get('/api/projects/:projectId/tasks', getProjectTasks);
  app.post('/api/projects/:projectId/tasks', createProjectTask);
  
  // Q&A routes
  app.use('/api/qa-sessions', qaSessionsRouter);
  app.use('/api/question-library', questionsRouter);
  
  // System document routes
  app.use('/api/projects/:projectId/systems', systemsRouter);
  
  // LLM settings routes
  app.use('/api/projects/:projectId/llm-settings', llmSettingsRouter);
  
  // AI generation routes
  app.use('/api/generate', generateRouter);
  
  // Passthrough pipeline routes
  app.use('/api/passthrough', passthroughRouter);
  
  // Dashboard routes
  app.use('/api/projects/:projectId/dashboard', dashboardRouter);
  
  return app;
}

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
```

#### Step 8-5: 최종 App.tsx

파일: `src/App.tsx` (전체)

```typescript
import { useState } from 'react';
import { ProjectSelector } from './project/ProjectSelector';
import { KanbanBoard } from './kanban/KanbanBoard';
import { QAFormModal } from './qa/QAFormModal';
import { SystemSidebar } from './system/SystemSidebar';
import { DashboardPanel } from './dashboard/DashboardPanel';
import { useProjectStore } from './store/projectStore';
import { useTaskStore } from './store/taskStore';

function App() {
  const { currentProject } = useProjectStore();
  const { updateTaskStatus } = useTaskStore();
  
  const [qaModal, setQAModal] = useState<{ isOpen: boolean; taskId: string }>({
    isOpen: false,
    taskId: '',
  });
  const [showSidebar, setShowSidebar] = useState(true);

  const handleQARequired = (taskId: string) => {
    setQAModal({ isOpen: true, taskId });
  };

  const handleQAComplete = async (_sessionId: string) => {
    // Move task to design after Q&A
    await updateTaskStatus(qaModal.taskId, 'design');
    // Optionally trigger AI generation here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">🎮 DesignWorkflow</h1>
          <div className="flex items-center gap-4">
            <ProjectSelector />
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
            >
              {showSidebar ? '📁 사이드바 숨기기' : '📁 사이드바 보기'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && currentProject && <SystemSidebar />}

        {/* Main Area */}
        <main className="flex-1 p-6">
          {currentProject && <DashboardPanel />}
          <KanbanBoard onQARequired={handleQARequired} />
        </main>
      </div>

      {/* Q&A Modal */}
      {currentProject && (
        <QAFormModal
          isOpen={qaModal.isOpen}
          taskId={qaModal.taskId}
          projectId={currentProject.id}
          onComplete={handleQAComplete}
          onClose={() => setQAModal({ isOpen: false, taskId: '' })}
        />
      )}
    </div>
  );
}

export default App;
```

#### Phase 8 완료 체크리스트

- [ ] 대시보드 통계 API 동작
- [ ] 대시보드 패널 표시
- [ ] 시스템 문서 사이드바 통합
- [ ] Q&A 모달 연동
- [ ] 전체 워크플로우 E2E 테스트

---

## 최종 완료 체크리스트

### 인프라
- [ ] `npm run start` 실행 시 프론트엔드 + 백엔드 동시 시작
- [ ] `curl http://localhost:3001/api/health` 응답 확인
- [ ] `npm run lint` 에러 없음
- [ ] `npx tsc --noEmit` 에러 없음

### 핵심 기능
- [ ] 프로젝트 생성/선택
- [ ] 태스크 생성 및 칸반 이동
- [ ] Feature → Design 이동 시 Q&A 모달
- [ ] Q&A 완료 후 Design Doc AI 생성
- [ ] Design → PRD 이동 시 PRD AI 생성
- [ ] PRD → Prototype 이동 시 코드 AI 생성

### 부가 기능
- [ ] 시스템 문서 CRUD
- [ ] 참조 문서 선택 후 AI 컨텍스트 포함
- [ ] LLM 설정 (API Key, 모델 선택)
- [ ] 대시보드 통계 표시
- [ ] Passthrough 자동 파이프라인
