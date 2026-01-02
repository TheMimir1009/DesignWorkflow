# SPEC-SETUP-001: 인수 기준 (Acceptance Criteria)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SETUP-001 |
| 제목 | 개발 환경 구축 인수 기준 |
| 생성일 | 2026-01-02 |

---

## 1. 인수 기준 개요

이 문서는 SPEC-SETUP-001 (개발 환경 구축)의 완료를 검증하기 위한 인수 기준을 정의한다.

---

## 2. 시나리오 (Scenarios)

### Scenario 1: 프로젝트 초기화 및 개발 서버 실행

**Feature**: Vite + React + TypeScript 프로젝트 초기화

```gherkin
Scenario: 개발 서버 시작 및 애플리케이션 표시
  Given 프로젝트가 초기화되어 있다
  And 모든 의존성이 설치되어 있다
  When 개발자가 "npm run dev" 명령을 실행한다
  Then Vite 개발 서버가 포트 5173에서 시작된다
  And 브라우저에서 "http://localhost:5173" 접근이 가능하다
  And 화면에 "AI Workflow Kanban" 텍스트가 표시된다
```

```gherkin
Scenario: Tailwind CSS 스타일 적용 확인
  Given 개발 서버가 실행 중이다
  When 브라우저에서 애플리케이션을 확인한다
  Then "AI Workflow Kanban" 텍스트가 파란색으로 표시된다
  And 배경색이 회색(gray-100)으로 표시된다
  And 텍스트가 화면 중앙에 정렬되어 있다
```

```gherkin
Scenario: Hot Module Replacement (HMR) 동작 확인
  Given 개발 서버가 실행 중이다
  And 브라우저에서 애플리케이션이 열려 있다
  When 개발자가 App.tsx 파일을 수정한다
  Then 브라우저가 자동으로 새로고침 없이 변경 사항을 반영한다
```

---

### Scenario 2: CLAUDE.md 파일 생성

**Feature**: Claude Code 프로젝트 컨텍스트 파일

```gherkin
Scenario: CLAUDE.md 파일 존재 확인
  Given 프로젝트 루트 디렉토리에 있다
  When CLAUDE.md 파일을 확인한다
  Then 파일이 존재한다
  And 파일 크기가 0바이트보다 크다
```

```gherkin
Scenario: CLAUDE.md 필수 섹션 포함 확인
  Given CLAUDE.md 파일이 존재한다
  When 파일 내용을 확인한다
  Then "Project Context" 섹션이 포함되어 있다
  And "Tech Stack" 섹션이 포함되어 있다
  And "Commands" 섹션이 포함되어 있다
  And "Key Directories" 섹션이 포함되어 있다
  And "Coding Standards" 섹션이 포함되어 있다
  And "Do Not" 섹션이 포함되어 있다
```

---

### Scenario 3: 디렉토리 구조 생성

**Feature**: 프로젝트 폴더 구조 설정

```gherkin
Scenario: src/components 하위 디렉토리 구조 확인
  Given 프로젝트가 초기화되어 있다
  When src/components 디렉토리를 확인한다
  Then "layout" 디렉토리가 존재한다
  And "project" 디렉토리가 존재한다
  And "system" 디렉토리가 존재한다
  And "kanban" 디렉토리가 존재한다
  And "task" 디렉토리가 존재한다
  And "document" 디렉토리가 존재한다
  And "archive" 디렉토리가 존재한다
  And "common" 디렉토리가 존재한다
```

```gherkin
Scenario: src 핵심 디렉토리 구조 확인
  Given 프로젝트가 초기화되어 있다
  When src 디렉토리를 확인한다
  Then "services" 디렉토리가 존재한다
  And "prompts" 디렉토리가 존재한다
  And "types" 디렉토리가 존재한다
  And "store" 디렉토리가 존재한다
```

```gherkin
Scenario: server 디렉토리 구조 확인
  Given 프로젝트가 초기화되어 있다
  When server 디렉토리를 확인한다
  Then "routes" 디렉토리가 존재한다
  And "utils" 디렉토리가 존재한다
```

```gherkin
Scenario: workspace 디렉토리 구조 확인
  Given 프로젝트가 초기화되어 있다
  When workspace 디렉토리를 확인한다
  Then "projects" 디렉토리가 존재한다
  And "templates/questions" 디렉토리가 존재한다
```

```gherkin
Scenario: workspace가 .gitignore에 포함 확인
  Given 프로젝트가 초기화되어 있다
  When .gitignore 파일을 확인한다
  Then "workspace/" 또는 "workspace" 항목이 포함되어 있다
```

---

### Scenario 4: TypeScript 타입 정의

**Feature**: 핵심 데이터 타입 정의

```gherkin
Scenario: 타입 정의 파일 존재 확인
  Given 프로젝트가 초기화되어 있다
  When src/types/index.ts 파일을 확인한다
  Then 파일이 존재한다
  And 파일 크기가 0바이트보다 크다
```

```gherkin
Scenario: 핵심 인터페이스 정의 확인
  Given src/types/index.ts 파일이 존재한다
  When 파일 내용을 확인한다
  Then "Project" 인터페이스가 정의되어 있다
  And "SystemDocument" 인터페이스가 정의되어 있다
  And "Task" 인터페이스가 정의되어 있다
  And "TaskStatus" 타입이 정의되어 있다
```

```gherkin
Scenario: 보조 인터페이스 정의 확인
  Given src/types/index.ts 파일이 존재한다
  When 파일 내용을 확인한다
  Then "QAAnswer" 인터페이스가 정의되어 있다
  And "Revision" 인터페이스가 정의되어 있다
  And "QuestionTemplate" 인터페이스가 정의되어 있다
```

```gherkin
Scenario: TypeScript 컴파일 성공 확인
  Given 모든 타입이 정의되어 있다
  When "npx tsc --noEmit" 명령을 실행한다
  Then 컴파일 오류가 발생하지 않는다
  And 종료 코드가 0이다
```

---

### Scenario 5: 프로덕션 빌드

**Feature**: 프로덕션 빌드 성공

```gherkin
Scenario: 프로덕션 빌드 성공 확인
  Given 프로젝트가 초기화되어 있다
  And 모든 타입 정의가 완료되어 있다
  When "npm run build" 명령을 실행한다
  Then 빌드가 성공적으로 완료된다
  And "dist" 디렉토리가 생성된다
  And "dist/index.html" 파일이 존재한다
```

---

## 3. 품질 게이트 (Quality Gates)

### 3.1 필수 조건

| 항목 | 기준 | 검증 방법 |
|------|------|----------|
| TypeScript 컴파일 | 오류 0건 | `npx tsc --noEmit` |
| 개발 서버 시작 | 정상 실행 | `npm run dev` |
| 프로덕션 빌드 | 성공 | `npm run build` |
| CLAUDE.md | 필수 섹션 포함 | 수동 검토 |

### 3.2 권장 조건

| 항목 | 기준 | 검증 방법 |
|------|------|----------|
| ESLint 경고 | 0건 | `npm run lint` |
| 코드 포맷팅 | Prettier 적용 | `npm run format` |

---

## 4. 테스트 체크리스트 (Test Checklist)

### Phase 1.1: 프로젝트 초기화

- [x] `npm run dev` 실행 시 개발 서버 시작됨
- [x] 브라우저에서 "AI Workflow Kanban" 텍스트 표시됨
- [x] Tailwind CSS 스타일 적용됨 (파란색 텍스트, 회색 배경)
- [x] HMR(Hot Module Replacement) 동작함

### Phase 1.2: CLAUDE.md 작성

- [x] CLAUDE.md 파일 존재함
- [x] Project Context 섹션 포함됨
- [x] Tech Stack 섹션 포함됨
- [x] Commands 섹션 포함됨
- [x] Key Directories 섹션 포함됨
- [x] Coding Standards 섹션 포함됨
- [x] Do Not 섹션 포함됨

### Phase 1.3: 디렉토리 구조 생성

- [x] src/components/layout 존재함
- [x] src/components/project 존재함
- [x] src/components/system 존재함
- [x] src/components/kanban 존재함
- [x] src/components/task 존재함
- [x] src/components/document 존재함
- [x] src/components/archive 존재함
- [x] src/components/common 존재함
- [x] src/services 존재함
- [x] src/prompts 존재함
- [x] src/types 존재함
- [x] src/store 존재함
- [x] server/routes 존재함
- [x] server/utils 존재함
- [x] workspace/projects 존재함
- [x] workspace/templates/questions 존재함
- [x] .gitignore에 workspace 포함됨

### Phase 1.4: TypeScript 타입 정의

- [x] src/types/index.ts 파일 존재함
- [x] Project 인터페이스 정의됨
- [x] SystemDocument 인터페이스 정의됨
- [x] Task 인터페이스 정의됨
- [x] TaskStatus 타입 정의됨
- [x] QAAnswer 인터페이스 정의됨
- [x] Revision 인터페이스 정의됨
- [x] QuestionTemplate 인터페이스 정의됨
- [x] `npx tsc --noEmit` 성공함 (오류 0건)

---

## 5. 완료 정의 (Definition of Done)

SPEC-SETUP-001은 다음 조건이 모두 충족될 때 완료로 간주한다:

### 5.1 필수 완료 조건

1. **프로젝트 초기화**
   - Vite + React + TypeScript 프로젝트가 생성되었다
   - Tailwind CSS가 설정되었다
   - `npm run dev`로 개발 서버가 정상 실행된다
   - 브라우저에 "AI Workflow Kanban" 텍스트가 표시된다

2. **CLAUDE.md 작성**
   - CLAUDE.md 파일이 프로젝트 루트에 존재한다
   - 필수 섹션(Project Context, Tech Stack, Commands, Key Directories, Coding Standards, Do Not)이 포함되어 있다

3. **디렉토리 구조**
   - PRD 4.1에 정의된 모든 디렉토리가 생성되었다
   - workspace/가 .gitignore에 추가되었다

4. **TypeScript 타입 정의**
   - src/types/index.ts에 모든 핵심 타입이 정의되었다
   - `npx tsc --noEmit` 실행 시 오류가 없다

### 5.2 품질 기준

- TypeScript 컴파일 오류: 0건
- `npm run build` 성공

---

## 6. 검증 명령 요약 (Verification Commands)

```bash
# 1. 개발 서버 실행 테스트
npm run dev

# 2. TypeScript 컴파일 테스트
npx tsc --noEmit

# 3. 프로덕션 빌드 테스트
npm run build

# 4. 디렉토리 구조 확인
ls -la src/components/
ls -la src/services/
ls -la src/store/
ls -la src/types/
ls -la server/
ls -la workspace/

# 5. .gitignore 확인
grep -n "workspace" .gitignore

# 6. CLAUDE.md 섹션 확인
grep -E "^##" CLAUDE.md
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
| 1.1 | 2026-01-02 | 구현 완료 - 모든 체크리스트 항목 통과 |
