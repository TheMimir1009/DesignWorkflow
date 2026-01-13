# SPEC-SETUP-001: 구현 계획 (Implementation Plan)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SETUP-001 |
| 제목 | 개발 환경 구축 구현 계획 |
| 생성일 | 2026-01-02 |

---

## 1. 마일스톤 (Milestones)

### Primary Goal: 프로젝트 초기화 (Phase 1.1)

**목표**: Vite + React + TypeScript 프로젝트 생성 및 Tailwind CSS 설정

**구현 태스크**:

1. Vite로 React + TypeScript 프로젝트 생성
   - `npm create vite@latest ai-workflow-kanban -- --template react-ts`
   - 프로젝트 디렉토리 진입 및 의존성 설치

2. Tailwind CSS 설치 및 설정
   - tailwindcss, postcss, autoprefixer 설치
   - tailwind.config.js 설정
   - index.css에 Tailwind 지시문 추가

3. App.tsx 수정
   - "AI Workflow Kanban" 텍스트 표시
   - Tailwind CSS 스타일 적용

**완료 기준**:
- `npm run dev` 실행 시 브라우저에서 "AI Workflow Kanban" 표시
- Tailwind CSS 스타일 적용 확인 (파란색 텍스트, 회색 배경)

---

### Secondary Goal: CLAUDE.md 작성 (Phase 1.2)

**목표**: Claude Code용 프로젝트 컨텍스트 파일 생성

**구현 태스크**:

1. CLAUDE.md 파일 생성
   - 프로젝트 루트에 생성

2. 필수 섹션 작성
   - Project Context: 프로젝트 개요
   - Architecture Overview: 아키텍처 다이어그램
   - Tech Stack: 기술 스택 요약
   - Key Directories: 주요 디렉토리 설명
   - Commands: npm 명령어 목록
   - Coding Standards: 코딩 규칙
   - Claude Code Integration: Headless 모드 사용법
   - Do Not: 금지 사항

**완료 기준**:
- CLAUDE.md 파일 생성 완료
- Project Context, Tech Stack, Commands, Key Terms 섹션 포함

---

### Tertiary Goal: 디렉토리 구조 생성 (Phase 1.3)

**목표**: 프로젝트 폴더 구조 설정

**구현 태스크**:

1. src 하위 디렉토리 생성
   - components/ (layout, project, system, kanban, task, document, archive, common)
   - services/
   - prompts/
   - types/
   - store/

2. server 디렉토리 생성
   - routes/
   - utils/

3. workspace 디렉토리 생성
   - projects/
   - templates/questions/

4. .gitkeep 파일 추가
   - 빈 디렉토리 유지를 위한 .gitkeep 파일

5. .gitignore 수정
   - workspace/ 추가
   - node_modules/, dist/, .env 확인

**완료 기준**:
- 모든 디렉토리 생성 완료
- workspace/가 .gitignore에 추가됨

---

### Final Goal: TypeScript 타입 정의 (Phase 1.4)

**목표**: 핵심 데이터 타입 정의

**구현 태스크**:

1. src/types/index.ts 생성

2. 핵심 인터페이스 정의
   - Project: 게임 프로젝트
   - SystemDocument: 시스템 문서 (관련 기획서)
   - Task: 작업 (칸반 카드)
   - TaskStatus: 작업 상태 타입

3. 보조 인터페이스 정의
   - FeatureList: 피쳐리스트
   - DesignDocument: 기획서
   - QAAnswer: Q&A 답변
   - Revision: 수정 이력
   - PRD: PRD 문서
   - Prototype: 프로토타입
   - Archive: 아카이브 정보

4. 유틸리티 타입 정의
   - QACategory: Q&A 카테고리 유니온 타입
   - QuestionTemplate: 질문 템플릿
   - Question: 개별 질문

**완료 기준**:
- 모든 타입 정의 완료
- TypeScript 컴파일 오류 없음 (`npx tsc --noEmit`)

---

## 2. 기술적 접근 방식 (Technical Approach)

### 2.1 프로젝트 구조

```
ai-workflow-kanban/
├── src/
│   ├── components/     # React 컴포넌트
│   ├── services/       # API 호출 및 비즈니스 로직
│   ├── store/          # Zustand 상태 관리
│   ├── types/          # TypeScript 타입 정의
│   ├── prompts/        # AI 프롬프트 템플릿
│   └── App.tsx         # 메인 앱 컴포넌트
├── server/             # Express 백엔드
├── workspace/          # 작업 데이터 (gitignore)
├── CLAUDE.md           # Claude Code 컨텍스트
└── package.json
```

### 2.2 개발 환경 설정

#### Vite 설정 (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

#### TypeScript 설정 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.3 Tailwind CSS 설정

#### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

#### src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 3. 아키텍처 설계 방향 (Architecture Design)

### 3.1 프론트엔드 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    React App                         │
├─────────────────────────────────────────────────────┤
│  Components (UI Layer)                               │
│  ├── Layout Components                               │
│  ├── Feature Components                              │
│  └── Common Components                               │
├─────────────────────────────────────────────────────┤
│  Zustand Store (State Layer)                         │
│  ├── projectStore                                    │
│  ├── systemStore                                     │
│  ├── taskStore                                       │
│  └── uiStore                                         │
├─────────────────────────────────────────────────────┤
│  Services (API Layer)                                │
│  ├── projectService                                  │
│  ├── systemDocService                                │
│  ├── taskService                                     │
│  └── claudeCodeService                               │
└─────────────────────────────────────────────────────┘
```

### 3.2 백엔드 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                  Express Server                      │
├─────────────────────────────────────────────────────┤
│  Routes                                              │
│  ├── /api/projects                                   │
│  ├── /api/systems                                    │
│  ├── /api/tasks                                      │
│  ├── /api/generate                                   │
│  └── /api/archives                                   │
├─────────────────────────────────────────────────────┤
│  Utils                                               │
│  ├── claudeCodeRunner                                │
│  └── keywordExtractor                                │
├─────────────────────────────────────────────────────┤
│  File System (workspace/)                            │
│  ├── projects/{id}/                                  │
│  └── templates/questions/                            │
└─────────────────────────────────────────────────────┘
```

### 3.3 데이터 흐름

```
User Action → Component → Zustand Store → Service → Express API → File System
                                                          ↓
                                                   Claude Code Headless
```

---

## 4. 리스크 및 대응 방안 (Risks and Mitigations)

### 4.1 기술적 리스크

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|----------|
| Vite 버전 호환성 이슈 | Low | Medium | 공식 문서 최신 버전 가이드 따름 |
| Tailwind CSS 설정 오류 | Low | Low | PostCSS 설정 검증 |
| TypeScript strict 모드 오류 | Medium | Low | 점진적 타입 적용 |

### 4.2 의존성 리스크

| 리스크 | 발생 확률 | 영향도 | 대응 방안 |
|--------|----------|--------|----------|
| 패키지 버전 충돌 | Low | Medium | package-lock.json 관리 |
| Node.js 버전 미스매치 | Low | High | .nvmrc 파일로 버전 명시 |

---

## 5. 검증 계획 (Verification Plan)

### 5.1 Phase 1.1 검증

```bash
# 프로젝트 빌드 테스트
npm run build

# 개발 서버 실행 테스트
npm run dev

# 브라우저에서 확인
# - http://localhost:5173
# - "AI Workflow Kanban" 텍스트 표시 확인
# - Tailwind CSS 스타일 적용 확인
```

### 5.2 Phase 1.2 검증

```bash
# CLAUDE.md 파일 존재 확인
ls -la CLAUDE.md

# 필수 섹션 확인 (수동 검토)
# - Project Context
# - Tech Stack
# - Commands
# - Key Terms
```

### 5.3 Phase 1.3 검증

```bash
# 디렉토리 구조 확인
tree src/
tree server/
tree workspace/

# .gitignore 확인
cat .gitignore | grep workspace
```

### 5.4 Phase 1.4 검증

```bash
# TypeScript 컴파일 테스트
npx tsc --noEmit

# 타입 정의 확인
cat src/types/index.ts
```

---

## 6. 다음 단계 (Next Steps)

### 6.1 후속 SPEC

| SPEC ID | 제목 | 의존성 |
|---------|------|--------|
| SPEC-PROJECT-001 | 프로젝트(게임) 관리 | SPEC-SETUP-001 |
| SPEC-SYSTEM-001 | 시스템 문서 관리 | SPEC-SETUP-001 |
| SPEC-KANBAN-001 | 칸반 보드 UI | SPEC-SETUP-001 |

### 6.2 구현 명령

```bash
# SPEC-SETUP-001 구현 시작
/moai:2-run SPEC-SETUP-001
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
