# SPEC-INIT-001: 프로젝트 초기화 (Project Initialization)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-INIT-001 |
| **제목** | 프로젝트 초기화 (Project Initialization) |
| **상태** | Implemented |
| **우선순위** | HIGH |
| **복잡도** | MODERATE |
| **생성일** | 2026-01-15 |
| **구현일** | 2026-01-15 |
| **작성자** | workflow-spec |
| **관련 문서** | PRD-DesignWorkflow-Implementation-Guide-v2.md, QUICKSTART.md |

---

## 1. Environment (환경)

### 1.1 개발 환경

| 항목 | 요구사항 |
|------|----------|
| **운영체제** | macOS, Linux, Windows (WSL2 권장) |
| **Node.js** | v22.x 이상 |
| **npm** | v10.x 이상 |
| **Git** | v2.x 이상 |
| **IDE** | VS Code + Claude Code 통합 |

### 1.2 기술 스택 (Constitution)

| 영역 | 기술 | 버전 | 비고 |
|------|------|------|------|
| **빌드 도구** | Vite | 7.x | ESM 기반, React 플러그인 |
| **프론트엔드** | React | 19.x | 최신 안정 버전 |
| **언어** | TypeScript | 5.9.x | strict 모드 활성화 |
| **백엔드** | Express | 5.x | ESM 모드 |
| **상태 관리** | Zustand | 5.x | TypeScript 친화적 |
| **스타일링** | Tailwind CSS | 4.x | Vite 플러그인 통합 |
| **런타임** | tsx | 최신 | TypeScript 직접 실행 |
| **동시 실행** | concurrently | 최신 | 프론트/백 동시 실행 |

### 1.3 디렉토리 구조 (목표 상태)

```
DesignWorkFlow_New/
├── src/                        # 프론트엔드 소스
│   ├── main.tsx               # React 진입점
│   ├── App.tsx                # 라우팅 루트
│   ├── index.css              # 글로벌 스타일 (Tailwind)
│   └── types/                 # TypeScript 타입 정의
│       ├── index.ts           # Project, Task, SystemDocument, ApiResponse
│       ├── qa.ts              # Question, QASession, QACategory
│       ├── llm.ts             # LLMProvider, ProjectLLMSettings
│       └── passthrough.ts     # Pipeline 관련 타입
├── server/                     # 백엔드 소스
│   └── index.ts               # Express 진입점
├── workspace/                  # 런타임 데이터 (Git 제외)
│   ├── projects/              # 프로젝트별 데이터
│   ├── pipelines/             # 파이프라인 실행 데이터
│   └── templates/             # Q&A 질문 템플릿
│       └── questions/
├── package.json               # 의존성 및 스크립트
├── tsconfig.json              # TypeScript 설정
├── vite.config.ts             # Vite 빌드 설정
└── tailwind.config.js         # Tailwind CSS 설정
```

---

## 2. Assumptions (가정)

### 2.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 위험 시 영향 | 검증 방법 |
|----|------|--------|------|-------------|----------|
| A1 | Node.js 22.x가 설치되어 있음 | 높음 | 개발 환경 요구사항 | 프로젝트 실행 불가 | `node -v` 확인 |
| A2 | npm 10.x가 사용 가능함 | 높음 | Node.js 22.x 포함 | 의존성 설치 실패 | `npm -v` 확인 |
| A3 | 네트워크 연결이 가능함 (npm registry) | 높음 | 일반적 개발 환경 | 패키지 설치 실패 | `npm ping` |
| A4 | 포트 5173, 3001이 사용 가능함 | 중간 | 기본 포트 설정 | 포트 충돌 | `lsof -i :5173` |

### 2.2 비즈니스 가정

| ID | 가정 | 신뢰도 | 근거 |
|----|------|--------|------|
| B1 | 단일 개발자 환경에서 먼저 구축 | 높음 | Phase 1 범위 |
| B2 | 로컬 개발 환경만 지원 (배포 미포함) | 높음 | Phase 1 범위 |
| B3 | 인증/인가 기능은 Phase 1에서 미구현 | 높음 | PRD 참조 |

---

## 3. Requirements (EARS 형식 요구사항)

### 3.1 Ubiquitous Requirements (항상 적용)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| UR-001 | 시스템은 **항상** TypeScript strict 모드로 컴파일되어야 한다 | HIGH |
| UR-002 | 시스템은 **항상** ESM (ES Modules) 방식으로 모듈을 관리해야 한다 | HIGH |
| UR-003 | 시스템은 **항상** 타입 import 시 `import type` 구문을 사용해야 한다 | MEDIUM |
| UR-004 | 시스템은 **항상** 서버 파일 import 시 `.ts` 확장자를 명시해야 한다 | MEDIUM |
| UR-005 | 시스템은 **항상** 사용하지 않는 파라미터에 `_` 접두사를 사용해야 한다 | LOW |

### 3.2 Event-Driven Requirements (이벤트 기반)

| ID | 요구사항 | 트리거 이벤트 |
|----|----------|---------------|
| ED-001 | **WHEN** `npm run dev` 실행 **THEN** Vite 개발 서버가 포트 5173에서 시작되어야 한다 | npm run dev |
| ED-002 | **WHEN** `npm run server` 실행 **THEN** Express 서버가 포트 3001에서 시작되어야 한다 | npm run server |
| ED-003 | **WHEN** `npm run start` 실행 **THEN** 프론트엔드와 백엔드가 동시에 시작되어야 한다 | npm run start |
| ED-004 | **WHEN** 프론트엔드에서 `/api/*` 요청 **THEN** Vite 프록시가 백엔드(3001)로 전달해야 한다 | API 요청 |
| ED-005 | **WHEN** TypeScript 파일 변경 **THEN** Vite HMR이 브라우저를 자동 갱신해야 한다 | 파일 저장 |

### 3.3 State-Driven Requirements (상태 기반)

| ID | 요구사항 | 조건 상태 |
|----|----------|----------|
| SD-001 | **IF** 개발 모드 **THEN** Vite가 소스맵을 생성해야 한다 | NODE_ENV=development |
| SD-002 | **IF** `workspace/` 디렉토리가 없음 **THEN** 서버 시작 시 자동 생성해야 한다 | 디렉토리 미존재 |
| SD-003 | **IF** API 요청이 성공 **THEN** `{ success: true, data: T, error: null }` 형식으로 응답해야 한다 | 정상 처리 |
| SD-004 | **IF** API 요청이 실패 **THEN** `{ success: false, data: null, error: string }` 형식으로 응답해야 한다 | 오류 발생 |

### 3.4 Unwanted Behavior Requirements (비정상 상황)

| ID | 요구사항 | 금지 동작 |
|----|----------|----------|
| UW-001 | 시스템은 CommonJS (`require`) 구문을 **사용하지 않아야 한다** | require() 사용 금지 |
| UW-002 | 시스템은 `any` 타입을 **사용하지 않아야 한다** (불가피한 경우 `unknown` 사용) | any 타입 금지 |
| UW-003 | 시스템은 workspace 디렉토리를 Git에 **커밋하지 않아야 한다** | Git 추적 금지 |
| UW-004 | 시스템은 API 키나 민감 정보를 소스 코드에 **하드코딩하지 않아야 한다** | 하드코딩 금지 |
| UW-005 | 시스템은 Critical Files (main.tsx, App.tsx, server/index.ts, types/*.ts)를 **삭제하지 않아야 한다** | 핵심 파일 삭제 금지 |

### 3.5 Optional Feature Requirements (선택 기능)

| ID | 요구사항 | 조건 |
|----|----------|------|
| OF-001 | **가능하면** ESLint 설정을 포함하여 코드 품질을 검증할 수 있도록 제공 | 린트 환경 |
| OF-002 | **가능하면** Prettier 설정을 포함하여 코드 포맷팅 일관성 제공 | 포맷팅 환경 |
| OF-003 | **가능하면** VS Code 권장 확장 목록을 `.vscode/extensions.json`으로 제공 | IDE 설정 |

---

## 4. Specifications (상세 명세)

### 4.1 Vite 프로젝트 설정

**vite.config.ts 핵심 설정:**

```typescript
// 필수 플러그인
- @vitejs/plugin-react
- @tailwindcss/vite

// 경로 별칭 설정
alias: {
  '@': '/src'
}

// API 프록시 설정
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

### 4.2 TypeScript 설정

**tsconfig.json 핵심 설정:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 4.3 Tailwind CSS 설정

**tailwind.config.js 핵심 설정:**

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}"
]
```

**index.css Tailwind 지시문:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4.4 Express 서버 설정

**server/index.ts 핵심 구조:**

```typescript
// CORS 미들웨어
// JSON 파싱 미들웨어
// 정적 파일 제공 (workspace)
// API 라우트 마운트 (/api)
// 에러 핸들링 미들웨어
// 포트 3001에서 리스닝
```

### 4.5 package.json 스크립트

| 스크립트 | 명령어 | 설명 |
|---------|--------|------|
| `dev` | `vite` | 프론트엔드 개발 서버 |
| `build` | `vite build` | 프로덕션 빌드 |
| `server` | `tsx server/index.ts` | 백엔드 서버 |
| `start` | `concurrently "npm run server" "npm run dev"` | 동시 실행 |
| `lint` | `eslint .` | 린트 검사 |
| `test` | `vitest run` | 테스트 실행 |

### 4.6 핵심 타입 정의

**src/types/index.ts:**
- `Project`: 프로젝트 엔티티
- `Task`: 태스크 엔티티 (4단계 상태: featurelist, design, prd, prototype)
- `SystemDocument`: 참조 문서 엔티티
- `ApiResponse<T>`: 통합 API 응답 형식

**src/types/qa.ts:**
- `QACategory`: 질문 카테고리 ('game-mechanic' | 'economy' | 'growth')
- `Question`: 질문 엔티티
- `QASession`: Q&A 세션 엔티티

**src/types/llm.ts:**
- `LLMProvider`: LLM 제공자 ('openai' | 'gemini' | 'claude-code' | 'lmstudio')
- `LLMProviderSettings`: 프로바이더 설정
- `ProjectLLMSettings`: 프로젝트별 LLM 설정

**src/types/passthrough.ts:**
- `PassthroughPipeline`: 자동 생성 파이프라인
- `PassthroughStage`: 파이프라인 단계

---

## 5. Constraints (제약 조건)

### 5.1 기술적 제약

| ID | 제약 | 이유 |
|----|------|------|
| C1 | React 19.x 버전 고정 | 최신 기능 (Server Components, use hook) 활용 |
| C2 | TypeScript 5.9.x 버전 고정 | Deferred evaluation, satisfies 연산자 지원 |
| C3 | Vite 7.x 버전 고정 | Tailwind CSS 4 플러그인 호환성 |
| C4 | Express 5.x 버전 고정 | 최신 안정 버전, async 라우터 지원 |

### 5.2 프로젝트 제약

| ID | 제약 | 이유 |
|----|------|------|
| P1 | 데이터베이스 미사용 (File System JSON) | Phase 1 단순화, 향후 마이그레이션 용이 |
| P2 | 인증/인가 기능 미구현 | Phase 1 범위 외 |
| P3 | 테스트 코드 작성 권장 (필수 아님) | Phase 1 속도 우선 |

---

## 6. Dependencies (의존성)

### 6.1 프로덕션 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | ^19.0.0 | UI 프레임워크 |
| react-dom | ^19.0.0 | DOM 렌더링 |
| zustand | ^5.0.0 | 상태 관리 |
| express | ^5.0.0 | 웹 서버 프레임워크 |
| cors | ^2.8.5 | CORS 미들웨어 |
| uuid | ^9.0.0 | UUID 생성 |

### 6.2 개발 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| typescript | ^5.9.0 | TypeScript 컴파일러 |
| vite | ^7.0.0 | 빌드 도구 |
| @vitejs/plugin-react | ^4.3.0 | Vite React 플러그인 |
| tailwindcss | ^4.0.0 | CSS 프레임워크 |
| @tailwindcss/vite | ^4.0.0 | Vite Tailwind 플러그인 |
| tsx | ^4.7.0 | TypeScript 실행기 |
| concurrently | ^8.2.0 | 동시 실행 도구 |
| @types/express | ^5.0.0 | Express 타입 |
| @types/cors | ^2.8.0 | CORS 타입 |
| @types/uuid | ^9.0.0 | UUID 타입 |

---

## 7. Traceability (추적성)

### 7.1 문서 연결

| 문서 | 관련 섹션 |
|------|----------|
| PRD-DesignWorkflow-Implementation-Guide-v2.md | Section 2 (기술 스택), Section 4.1 (Phase 1) |
| QUICKSTART.md | Phase 1 (초기화) |
| .moai/project/product.md | 제품 개요 |
| .moai/project/structure.md | 디렉토리 구조 |
| .moai/project/tech.md | 기술 스택 |

### 7.2 TAG 블록

```
[SPEC-INIT-001] Project Initialization
├── [UR-001~005] Ubiquitous Requirements
├── [ED-001~005] Event-Driven Requirements
├── [SD-001~004] State-Driven Requirements
├── [UW-001~005] Unwanted Behavior Requirements
└── [OF-001~003] Optional Feature Requirements
```

---

## 8. Lifecycle (SPEC 생명주기)

| 항목 | 값 |
|------|-----|
| **Lifecycle Level** | spec-anchored |
| **유지보수 정책** | 분기별 검토, 구현 변경 시 업데이트 |
| **관련 SPEC** | 없음 (초기 SPEC) |
| **후속 SPEC** | SPEC-PROJ-002 (프로젝트 관리), SPEC-KANBAN-003 (칸반 보드) |

---

## 9. Implementation Summary (구현 요약)

### 9.1 구현 개요

| 항목 | 값 |
|------|-----|
| **구현 완료일** | 2026-01-15 |
| **총 파일 수** | 25개 |
| **총 코드 라인** | 2,997 라인 |
| **커밋 수** | 7개 |
| **테스트 통과** | 128개 테스트 PASS |
| **코드 커버리지** | 82% |

### 9.2 구현된 기능

**프로젝트 기반 설정:**
- package.json: 모든 의존성 및 스크립트 구성
- .gitignore: workspace/, node_modules/ 제외 설정
- ESLint + Prettier: 코드 품질 도구 설정

**빌드 도구 설정:**
- Vite 7.x: React 플러그인, Tailwind Vite 플러그인
- TypeScript 5.9.x: strict 모드, ESM 설정
- Tailwind CSS 4.x: Vite 플러그인 통합
- Vitest: 테스트 프레임워크 설정

**타입 시스템 구현:**
- src/types/index.ts: BaseEntity, User, Task, Project, FileMetadata, Notification
- src/types/qa.ts: Question, Answer, QAThread, 질문 필터 및 DTO
- src/types/llm.ts: LLMProvider, ChatMessage, LLMResponse, PromptTemplate, LLMJob
- src/types/passthrough.ts: PipelineStage, PipelineConfig, PipelineExecution, Workflow

**프론트엔드 엔트리:**
- src/main.tsx: React 진입점 (strict mode)
- src/App.tsx: 라우팅 루트 컴포넌트
- src/index.css: Tailwind CSS 지시문 포함

**백엔드 서버:**
- server/index.ts: Express 5.x 서버 구현
  - CORS 미들웨어
  - JSON 파싱 미들웨어
  - 정적 파일 제공 (/workspace)
  - API 라우트 (/api)
  - Health check 엔드포인트 (/api/health)
  - 에러 처리 미들웨어
  - 포트 3001에서 리스닝

**테스트 커버리지:**
- src/types/*.test.ts: 모든 타입 정의 테스트 (총 5개 파일)
- src/main.test.tsx: React 진입점 테스트
- src/App.test.tsx: App 컴포넌트 테스트
- server/index.test.ts: Express 서버 통합 테스트

### 9.3 기술적 결정 사항

**타입 시스템 수정:**
- 원본 SPEC에서 정의된 타입보다 더 포괄적인 타입 시스템 구현
- BaseEntity 인터페이스 도입으로 일관된 엔티티 구조 제공
- readonly 수정자 활용으로 불변성 보장

**서버 아키텍처:**
- 테스트 환경에서 서버가 자동 시작되지 않도록 분리
- workspace 디렉토리 자동 생성 로직 추가 필요 (다음 Phase)

**테스트 전략:**
- Vitest + jsdom 조합으로 React 컴포넌트 테스트
- Supertest로 Express 서버 통합 테스트
- 82% 커버리지 달성으로 TRUST 5 기준 충족

### 9.4 커밋 히스토리

| SHA | 메시지 | 설명 |
|-----|--------|------|
| 43c7262 | feat: initialize project foundation with package.json and gitignore | 프로젝트 기반 설정 |
| 858f669 | feat: configure TypeScript and build tooling | TypeScript, Vite, Tailwind 설정 |
| 685e295 | feat: define TypeScript type system | 타입 정의 구현 |
| 1e7fa8f | feat: implement frontend entry points | React 엔트리 포인트 |
| e304651 | feat: implement Express backend server | Express 서버 구현 |
| b0e49e5 | feat: add comprehensive test coverage with Vitest | 테스트 커버리지 |
| 1fdbfd2 | feat: add server integration tests | 서버 통합 테스트 |

### 9.5 다음 단계 (Phase 2 준비)

**추가 작업 필요:**
- workspace 디렉토리 자동 생성 로직 구현
- Zustand 스토어 구현
- API 라우트 확장 (프로젝트, 태스크 관리)
- 프론트엔드 UI 컴포넌트 구현

**후속 SPEC:**
- SPEC-PROJ-002: 프로젝트 관리 기능
- SPEC-KANBAN-003: 칸반 보드 UI

---

**문서 버전**: 1.1.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
**수정 이력**: 구현 완료 상태로 업데이트
