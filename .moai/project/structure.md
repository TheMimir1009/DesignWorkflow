# DesignWorkflow - 프로젝트 구조

**버전**: 2.0.0
**최종 수정일**: 2026-01-15

---

## 디렉토리 개요

DesignWorkflow 프로젝트는 프론트엔드(React)와 백엔드(Express)가 모노레포 구조로 구성되어 있습니다.

```
DesignWorkFlow_New/
├── .claude/                    # Claude Code AI 도구 설정
├── .moai/                      # MoAI-ADK 프레임워크 설정
├── .github/                    # GitHub CI/CD 설정
├── src/                        # 프론트엔드 소스 코드 (React)
├── server/                     # 백엔드 소스 코드 (Express)
├── workspace/                  # 런타임 데이터 저장소
├── CLAUDE.md                   # Alfred 실행 지시문
├── PRD-*.md                    # 구현 명세서
└── QUICKSTART.md               # 빠른 시작 가이드
```

---

## 상세 디렉토리 구조

### Claude Code 설정 (.claude/)

AI 코딩 도구 Claude Code의 설정 파일들이 위치합니다.

```
.claude/
├── agents/moai/               # 20개 전문화된 AI 에이전트 정의
│   ├── builder-*.md           # 빌더 에이전트 (4개)
│   ├── expert-*.md            # 전문가 에이전트 (8개)
│   └── manager-*.md           # 관리자 에이전트 (8개)
├── commands/moai/             # MoAI 슬래시 커맨드
│   ├── 0-project.md           # 프로젝트 설정
│   ├── 1-plan.md              # SPEC 생성
│   ├── 2-run.md               # TDD 구현
│   └── 3-sync.md              # 문서 동기화
├── hooks/moai/                # 실행 전/후 자동화 훅
├── output-styles/             # 출력 스타일 정의
├── skills/                    # AI 스킬 라이브러리
└── settings.json              # 권한 및 훅 설정
```

**에이전트 유형**:
| 유형 | 개수 | 역할 |
|------|------|------|
| Builder | 4개 | 에이전트, 커맨드, 스킬, 플러그인 생성 |
| Expert | 8개 | 백엔드, 프론트엔드, 보안, DevOps 등 전문 영역 |
| Manager | 8개 | Git, SPEC, TDD, 문서, 품질 등 워크플로우 관리 |

### MoAI-ADK 프레임워크 (.moai/)

AI 기반 개발 키트의 설정 및 캐시가 위치합니다.

```
.moai/
├── config/sections/           # 모듈화된 설정 파일
│   ├── user.yaml              # 사용자 설정
│   ├── language.yaml          # 언어 설정
│   └── ...                    # 기타 설정
├── cache/                     # 런타임 캐시
├── llm-configs/               # LLM 설정
├── memory/                    # 컨텍스트 메모리
├── project/                   # 프로젝트 문서 (현재 위치)
├── reports/                   # 생성 리포트
└── specs/                     # SPEC 명세서
```

### 프론트엔드 소스 (src/)

React 기반 프론트엔드 애플리케이션의 소스 코드입니다.

```
src/
├── main.tsx                   # React 진입점
├── App.tsx                    # 라우팅 루트 컴포넌트
├── index.css                  # 글로벌 스타일
│
├── types/                     # TypeScript 타입 정의
│   ├── index.ts               # 핵심 타입 (Project, Task 등)
│   ├── llm.ts                 # LLM 관련 타입
│   ├── qa.ts                  # Q&A 관련 타입
│   └── passthrough.ts         # 파이프라인 타입
│
├── store/                     # Zustand 상태 관리
│   ├── projectStore.ts        # 프로젝트 상태
│   ├── taskStore.ts           # 태스크 상태
│   ├── qaStore.ts             # Q&A 세션 상태
│   ├── llmSettingsStore.ts    # LLM 설정 상태
│   └── passthroughStore.ts    # 파이프라인 상태
│
├── services/                  # API 통신 레이어
│   ├── projectService.ts      # 프로젝트 API
│   ├── taskService.ts         # 태스크 API
│   ├── qaService.ts           # Q&A API
│   ├── llmSettingsService.ts  # LLM 설정 API
│   └── passthroughService.ts  # 파이프라인 API
│
├── kanban/                    # 칸반 보드 컴포넌트
│   ├── KanbanBoard.tsx        # 보드 컨테이너
│   ├── KanbanColumn.tsx       # 칸반 컬럼
│   └── KanbanCard.tsx         # 태스크 카드
│
├── qa/                        # Q&A 컴포넌트
│   └── QAFormModal.tsx        # Q&A 폼 모달
│
├── llm/                       # LLM 설정 컴포넌트
│   └── LLMSettingsPanel.tsx   # LLM 설정 패널
│
├── project/                   # 프로젝트 관리 컴포넌트
│   ├── ProjectSelector.tsx    # 프로젝트 선택기
│   └── ProjectSettingsModal.tsx # 프로젝트 설정 모달
│
├── system/                    # 시스템 문서 컴포넌트
│   ├── SystemSidebar.tsx      # 시스템 문서 사이드바
│   └── SystemCard.tsx         # 시스템 문서 카드
│
├── dashboard/                 # 대시보드 컴포넌트
│   └── DashboardPanel.tsx     # 대시보드 패널
│
└── layout/                    # 레이아웃 컴포넌트
    └── Header.tsx             # 헤더 컴포넌트
```

### 백엔드 소스 (server/)

Express 기반 백엔드 API 서버의 소스 코드입니다.

```
server/
├── index.ts                   # Express 진입점
│
├── routes/                    # API 라우트 정의
│   ├── projects.ts            # 프로젝트 CRUD
│   ├── tasks.ts               # 태스크 CRUD + 상태 변경
│   ├── qa-sessions.ts         # Q&A 세션 관리
│   ├── questions.ts           # 질문 라이브러리
│   ├── systems.ts             # 시스템 문서 관리
│   ├── llmSettings.ts         # LLM 설정 관리
│   ├── generate.ts            # AI 문서 생성
│   └── passthrough.ts         # 파이프라인 실행
│
├── utils/                     # 유틸리티 모듈
│   ├── projectStorage.ts      # 프로젝트 저장소
│   ├── taskStorage.ts         # 태스크 저장소
│   ├── qaStorage.ts           # Q&A 저장소
│   ├── systemStorage.ts       # 시스템 문서 저장소
│   ├── llmSettingsStorage.ts  # LLM 설정 저장소
│   ├── llmProvider.ts         # LLM 프로바이더 관리
│   ├── promptBuilder.ts       # 프롬프트 빌더
│   └── response.ts            # API 응답 헬퍼
│
└── llmProviders/              # LLM 프로바이더 구현
    ├── base.ts                # 기본 인터페이스
    ├── openai.ts              # OpenAI 프로바이더
    ├── gemini.ts              # Gemini 프로바이더
    └── lmstudio.ts            # LM Studio 프로바이더
```

### 런타임 데이터 (workspace/)

애플리케이션 런타임 데이터가 저장되는 디렉토리입니다. (Git 제외)

```
workspace/
├── projects/                  # 프로젝트별 데이터
│   └── {project-id}/
│       ├── project.json       # 프로젝트 메타데이터
│       ├── tasks/             # 태스크 데이터
│       │   └── tasks.json
│       └── systems/           # 시스템 문서
│           └── {system-id}.json
│
├── pipelines/                 # 파이프라인 실행 데이터
│   └── {pipeline-id}.json
│
└── templates/                 # 템플릿 데이터
    └── questions/             # Q&A 질문 템플릿
        ├── game-mechanic.json
        ├── economy.json
        └── growth.json
```

---

## 주요 파일 설명

### 진입점 파일 (Entry Points)

| 파일 | 설명 |
|------|------|
| `src/main.tsx` | React 애플리케이션 진입점 |
| `src/App.tsx` | 라우팅 및 전역 상태 관리 루트 |
| `server/index.ts` | Express 서버 진입점 |

### 핵심 타입 파일 (Core Types)

| 파일 | 정의 내용 |
|------|----------|
| `src/types/index.ts` | Project, Task, SystemDocument, ApiResponse |
| `src/types/qa.ts` | Question, QASession, QACategory |
| `src/types/llm.ts` | LLMProvider, ProjectLLMSettings, ConnectionStatus |
| `src/types/passthrough.ts` | PassthroughPipeline, PassthroughStage |

### 설정 파일 (Configuration)

| 파일 | 용도 |
|------|------|
| `vite.config.ts` | Vite 빌드 도구 설정 |
| `tsconfig.json` | TypeScript 컴파일러 설정 |
| `tailwind.config.js` | Tailwind CSS 설정 |
| `package.json` | 의존성 및 스크립트 정의 |

---

## 모듈 구성 패턴

### Store-Service-API 연결 패턴

프론트엔드는 일관된 데이터 흐름 패턴을 따릅니다.

```
Zustand Store ←→ Service Layer ←→ Express API ←→ Storage
```

| 레이어 | 역할 | 예시 |
|--------|------|------|
| Store | 클라이언트 상태 관리 | `projectStore.fetchProjects()` |
| Service | API 호출 추상화 | `projectService.getProjects()` |
| API Route | HTTP 엔드포인트 | `GET /api/projects` |
| Storage | 데이터 영속화 | `projectStorage.getAllProjects()` |

### API-Service-Store 매핑 표

| Store 메서드 | Service 메서드 | API 엔드포인트 |
|-------------|---------------|---------------|
| `projectStore.fetchProjects()` | `projectService.getProjects()` | `GET /api/projects` |
| `taskStore.fetchTasks(pid)` | `taskService.getTasks(pid)` | `GET /api/projects/:pid/tasks` |
| `qaStore.loadQuestions()` | `qaService.getQuestions()` | `GET /api/question-library/questions` |
| `qaStore.startSession()` | `qaService.createSession()` | `POST /api/qa-sessions` |

---

## 삭제 금지 파일

다음 파일들은 시스템 핵심 파일로 삭제하면 안 됩니다.

**Entry Points**:
- `src/main.tsx`
- `src/App.tsx`
- `server/index.ts`

**Core Types**:
- `src/types/index.ts`
- `src/types/qa.ts`
- `src/types/llm.ts`
- `src/types/passthrough.ts`

**Core Modules**:
- `src/store/*Store.ts`
- `src/services/*Service.ts`
- `server/routes/*.ts`

---

## 관련 문서

- [제품 개요](./product.md) - 제품 비전 및 기능 설명
- [기술 스택](./tech.md) - 사용 기술 및 프레임워크
- [구현 가이드](../../../PRD-DesignWorkflow-Implementation-Guide-v2.md) - 상세 구현 명세
