# DesignWorkflow - 기술 스택

**버전**: 2.0.0
**최종 수정일**: 2026-01-15

---

## 기술 스택 개요

DesignWorkflow는 최신 웹 기술 스택을 기반으로 구축됩니다.

| 영역 | 핵심 기술 | 버전 |
|------|----------|------|
| **프론트엔드** | React + TypeScript + Vite | 19 / 5.9 / 7 |
| **백엔드** | Express + Node.js (ESM) | 5 / 22+ |
| **상태 관리** | Zustand | 5 |
| **스타일링** | Tailwind CSS | 4 |
| **AI/LLM** | OpenAI, Gemini, Claude, LM Studio | - |

---

## 프론트엔드 기술 스택

### 핵심 프레임워크

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| **React** | 19 | UI 프레임워크 | 컴포넌트 기반 아키텍처, 광범위한 생태계 |
| **TypeScript** | 5.9 | 타입 안전성 | 컴파일 타임 타입 검사, 향상된 개발 경험 |
| **Vite** | 7 | 빌드 도구 | 빠른 HMR, ESM 기반 최적화 |

### 상태 관리

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| **Zustand** | 5 | 전역 상태 관리 | 간결한 API, 보일러플레이트 최소화, TypeScript 친화적 |

**Zustand 선택 이유**:
- Redux 대비 70% 이상 코드량 감소
- 별도의 Provider 래핑 불필요
- 직관적인 상태 변경 패턴
- DevTools 지원

### 스타일링

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| **Tailwind CSS** | 4 | 유틸리티 CSS | 빠른 프로토타이핑, 일관된 디자인 시스템 |

### UI 컴포넌트 및 라이브러리

| 기술 | 용도 | 설명 |
|------|------|------|
| **@dnd-kit/core** | 드래그 앤 드롭 | 칸반 보드 카드 이동 |
| **@dnd-kit/sortable** | 정렬 기능 | 칸반 컬럼 내 카드 정렬 |
| **@uiw/react-codemirror** | 코드 에디터 | Prototype 코드 표시/편집 |
| **react-markdown** | 마크다운 렌더링 | 생성된 문서 표시 |
| **remark-gfm** | GFM 지원 | GitHub Flavored Markdown |
| **recharts** | 차트/시각화 | 대시보드 차트 |
| **uuid** | UUID 생성 | 고유 식별자 생성 |

---

## 백엔드 기술 스택

### 핵심 프레임워크

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|----------|
| **Express** | 5 | 웹 프레임워크 | 경량화, 유연한 미들웨어 구조 |
| **Node.js** | 22+ | 런타임 | JavaScript 서버 실행 환경 |
| **tsx** | - | TypeScript 실행기 | 개발 환경에서 TS 직접 실행 |

### 데이터 저장

| 기술 | 용도 | 선택 이유 |
|------|------|----------|
| **File System JSON** | 데이터 영속화 | 설정 불필요, 이식성, 개발 용이성 |

**File System 선택 이유**:
- 별도 데이터베이스 설치 불필요
- 프로젝트 데이터의 Git 버전 관리 가능
- 개발/테스트 환경 간소화
- 향후 DB 마이그레이션 용이

### 보안

| 기술 | 용도 |
|------|------|
| **jsonwebtoken** | JWT 토큰 생성/검증 |
| **bcrypt** | 비밀번호 해싱 |

### 유틸리티

| 기술 | 용도 |
|------|------|
| **cors** | Cross-Origin 요청 처리 |
| **concurrently** | 프론트엔드/백엔드 동시 실행 |

---

## AI/LLM 기술 스택

### 지원 LLM 제공자

| 제공자 | 모델 예시 | 특징 |
|--------|----------|------|
| **OpenAI** | GPT-4o, GPT-4o-mini | 가장 널리 사용, 높은 품질 |
| **Google Gemini** | Gemini Pro | 긴 컨텍스트 지원 |
| **Claude** | Claude 3.5 Sonnet | 코드 생성 특화 |
| **LM Studio** | Llama, Mistral 등 | 로컬 실행, 오프라인 사용 |

### LLM 추상화 레이어

모든 LLM 제공자는 통합 인터페이스를 통해 접근합니다.

**인터페이스 정의**:
```
LLMProviderInterface
├── testConnection(): 연결 테스트
├── generateText(): 텍스트 생성
└── getModels(): 사용 가능 모델 목록
```

**프로바이더별 구현**:
- `openai.ts`: OpenAI API 연동
- `gemini.ts`: Google Generative AI SDK 연동
- `lmstudio.ts`: OpenAI 호환 API 연동

---

## 개발 환경 요구사항

### 필수 소프트웨어

| 소프트웨어 | 버전 | 용도 |
|-----------|------|------|
| **Node.js** | 22.x 이상 | 런타임 환경 |
| **npm** | 10.x 이상 | 패키지 관리 |
| **Git** | 2.x 이상 | 버전 관리 |

### 권장 개발 도구

| 도구 | 용도 |
|------|------|
| **VS Code** | 코드 편집기 |
| **Claude Code** | AI 코딩 어시스턴트 |
| **Postman** | API 테스트 |

### VS Code 권장 확장

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

---

## 빌드 및 배포 설정

### Package.json 스크립트

| 스크립트 | 명령어 | 설명 |
|---------|--------|------|
| `dev` | `vite` | 프론트엔드 개발 서버 |
| `build` | `vite build` | 프로덕션 빌드 |
| `server` | `tsx server/index.ts` | 백엔드 서버 실행 |
| `start` | `concurrently ...` | 프론트엔드 + 백엔드 동시 실행 |
| `lint` | `eslint .` | ESLint 검사 |
| `test` | `vitest run` | 테스트 실행 |

### Vite 설정

**주요 설정 항목**:
- React 플러그인 활성화
- Tailwind CSS 플러그인 통합
- API 프록시 설정 (`/api` → `localhost:3001`)

**프록시 설정**:
```
개발 환경:
프론트엔드 (localhost:5173) → 프록시 → 백엔드 (localhost:3001)
```

### TypeScript 설정

| 설정 | 값 | 설명 |
|------|-----|------|
| `target` | ES2022 | 컴파일 타겟 |
| `module` | ESNext | 모듈 시스템 |
| `strict` | true | 엄격한 타입 검사 |
| `moduleResolution` | bundler | 모듈 해석 방식 |

---

## 품질 설정

### TDD 및 테스트

| 설정 | 값 |
|------|-----|
| TDD 활성화 | true |
| 테스트 커버리지 목표 | 85% |
| 테스트 프레임워크 | Vitest |

### 코드 품질 도구

| 도구 | 용도 | 실행 시점 |
|------|------|----------|
| **ESLint 9** | 린터 | 자동 실행 (Hook) |
| **Prettier** | 포매터 | 자동 실행 (Hook) |
| **AST Grep** | 보안 검사 | 통합 |

### 린트 규칙

**TypeScript Import 규칙**:
- 타입 import 시 `import type` 사용
- 서버 파일 import 시 `.ts` 확장자 필수
- 사용하지 않는 파라미터는 `_` 접두사

---

## 의존성 설치 명령어

### 프론트엔드 의존성

```bash
# UI 프레임워크
npm install zustand

# 드래그 앤 드롭
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# 마크다운 및 차트
npm install react-markdown remark-gfm recharts

# 코드 에디터
npm install @uiw/react-codemirror @codemirror/lang-markdown @codemirror/lang-json

# 유틸리티
npm install uuid
```

### 백엔드 의존성

```bash
# 웹 프레임워크
npm install express cors

# 인증
npm install bcrypt jsonwebtoken

# 타입 정의
npm install -D @types/express @types/cors @types/uuid @types/bcrypt @types/jsonwebtoken

# 개발 도구
npm install -D tsx concurrently
```

### 스타일링 의존성

```bash
npm install -D tailwindcss @tailwindcss/vite autoprefixer
npx tailwindcss init -p
```

---

## 아키텍처 패턴

### Multi-Layer MVC + AI Orchestration

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                 (React + Zustand + Tailwind)                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Service Layer                             │
│               (API Communication Abstraction)                │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Backend API Layer                         │
│                    (Express Routes)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  Business Logic Layer                        │
│              (LLM Integration + Processing)                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                Data Persistence Layer                        │
│                  (File System JSON)                          │
└─────────────────────────────────────────────────────────────┘
```

### 칸반 기반 파이프라인 패턴

```
Feature List → (Q&A Trigger) → Design Doc → PRD → Prototype
     │              │              │          │         │
     └──────────────┴──────────────┴──────────┴─────────┘
                          │
                    AI Orchestration
                          │
              ┌───────────┼───────────┐
              │           │           │
           OpenAI     Gemini    LM Studio
```

---

## 관련 문서

- [제품 개요](./product.md) - 제품 비전 및 기능 설명
- [프로젝트 구조](./structure.md) - 디렉토리 및 파일 구성
- [구현 가이드](../../../PRD-DesignWorkflow-Implementation-Guide-v2.md) - 상세 구현 명세
- [빠른 시작](../../../QUICKSTART.md) - 빠른 시작 가이드
