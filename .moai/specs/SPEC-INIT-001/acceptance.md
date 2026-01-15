# SPEC-INIT-001: 수락 기준 (Acceptance Criteria)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-INIT-001 |
| **제목** | 프로젝트 초기화 수락 기준 |
| **관련 SPEC** | spec.md, plan.md |

---

## 1. 테스트 시나리오 (Given-When-Then)

### 1.1 시나리오: 개발 서버 정상 시작

```gherkin
Feature: 개발 환경 서버 시작
  프로젝트 초기화 후 개발 서버가 정상적으로 시작되어야 한다

  Scenario: Vite 개발 서버 시작
    Given 프로젝트 의존성이 설치되어 있다 (npm install 완료)
    And package.json에 "dev" 스크립트가 정의되어 있다
    When "npm run dev" 명령을 실행한다
    Then Vite 개발 서버가 포트 5173에서 시작된다
    And 콘솔에 "Local: http://localhost:5173" 메시지가 출력된다
    And 브라우저에서 http://localhost:5173 접속 시 React 앱이 표시된다

  Scenario: Express 백엔드 서버 시작
    Given 프로젝트 의존성이 설치되어 있다 (npm install 완료)
    And package.json에 "server" 스크립트가 정의되어 있다
    And server/index.ts 파일이 존재한다
    When "npm run server" 명령을 실행한다
    Then Express 서버가 포트 3001에서 시작된다
    And 콘솔에 "Server running on port 3001" 메시지가 출력된다
    And GET /api/health 요청에 대해 200 응답이 반환된다

  Scenario: 프론트엔드와 백엔드 동시 시작
    Given 프로젝트 의존성이 설치되어 있다 (npm install 완료)
    And package.json에 "start" 스크립트가 정의되어 있다
    When "npm run start" 명령을 실행한다
    Then Vite 서버와 Express 서버가 동시에 시작된다
    And 두 서버 모두 정상 동작한다
```

### 1.2 시나리오: API 프록시 동작

```gherkin
Feature: Vite API 프록시
  프론트엔드에서 백엔드 API를 프록시를 통해 호출할 수 있어야 한다

  Scenario: API 프록시를 통한 백엔드 호출
    Given Vite 개발 서버가 포트 5173에서 실행 중이다
    And Express 서버가 포트 3001에서 실행 중이다
    And vite.config.ts에 /api 프록시가 설정되어 있다
    When 브라우저에서 http://localhost:5173/api/health를 요청한다
    Then 요청이 http://localhost:3001/api/health로 프록시된다
    And 정상 응답이 반환된다

  Scenario: CORS 없이 API 호출 성공
    Given 프론트엔드 앱이 실행 중이다
    And 백엔드 서버가 실행 중이다
    When 프론트엔드에서 fetch('/api/health')를 호출한다
    Then CORS 오류 없이 응답을 받는다
    And 응답 형식이 { success: true, data: {...}, error: null }이다
```

### 1.3 시나리오: TypeScript 타입 검증

```gherkin
Feature: TypeScript 타입 안전성
  모든 타입 정의 파일이 컴파일 오류 없이 동작해야 한다

  Scenario: 타입 파일 컴파일 성공
    Given src/types/index.ts 파일이 존재한다
    And src/types/qa.ts 파일이 존재한다
    And src/types/llm.ts 파일이 존재한다
    And src/types/passthrough.ts 파일이 존재한다
    When "npx tsc --noEmit" 명령을 실행한다
    Then 컴파일 오류가 발생하지 않는다
    And 모든 타입이 strict 모드에서 유효하다

  Scenario: 경로 별칭 동작 확인
    Given tsconfig.json에 "@/*" → "./src/*" 경로 별칭이 설정되어 있다
    And vite.config.ts에 동일한 경로 별칭이 설정되어 있다
    When 소스 코드에서 "import type { Project } from '@/types'"를 사용한다
    Then IDE에서 자동완성이 동작한다
    And 컴파일 시 경로가 정상 해석된다
```

### 1.4 시나리오: Tailwind CSS 동작

```gherkin
Feature: Tailwind CSS 스타일링
  Tailwind CSS가 정상적으로 적용되어야 한다

  Scenario: Tailwind 클래스 적용
    Given tailwind.config.js가 올바르게 설정되어 있다
    And index.css에 @tailwind 지시문이 포함되어 있다
    And vite.config.ts에 @tailwindcss/vite 플러그인이 설정되어 있다
    When React 컴포넌트에 "className='bg-blue-500 text-white'"를 적용한다
    Then 해당 요소에 파란 배경과 흰색 텍스트가 적용된다
    And Hot Module Replacement 시 스타일이 즉시 갱신된다
```

### 1.5 시나리오: 디렉토리 구조 검증

```gherkin
Feature: 프로젝트 디렉토리 구조
  요구된 디렉토리 구조가 생성되어야 한다

  Scenario: 필수 디렉토리 존재 확인
    Given 프로젝트 초기화가 완료되었다
    When 디렉토리 구조를 확인한다
    Then 다음 디렉토리들이 존재한다:
      | 디렉토리 | 설명 |
      | src/ | 프론트엔드 소스 |
      | src/types/ | TypeScript 타입 정의 |
      | server/ | 백엔드 소스 |
      | workspace/ | 런타임 데이터 |
      | workspace/projects/ | 프로젝트 데이터 |
      | workspace/templates/questions/ | Q&A 템플릿 |

  Scenario: 필수 파일 존재 확인
    Given 프로젝트 초기화가 완료되었다
    When 파일 구조를 확인한다
    Then 다음 파일들이 존재한다:
      | 파일 | 설명 |
      | src/main.tsx | React 진입점 |
      | src/App.tsx | 라우팅 루트 |
      | src/index.css | 글로벌 스타일 |
      | src/types/index.ts | 핵심 타입 |
      | src/types/qa.ts | Q&A 타입 |
      | src/types/llm.ts | LLM 타입 |
      | src/types/passthrough.ts | Pipeline 타입 |
      | server/index.ts | Express 진입점 |
      | package.json | 패키지 설정 |
      | tsconfig.json | TypeScript 설정 |
      | vite.config.ts | Vite 설정 |
      | tailwind.config.js | Tailwind 설정 |
```

---

## 2. 품질 게이트 (Quality Gates)

### 2.1 필수 품질 게이트

| ID | 품질 기준 | 검증 방법 | 통과 조건 |
|----|----------|----------|----------|
| QG-01 | TypeScript 컴파일 | `npx tsc --noEmit` | 오류 0개 |
| QG-02 | 개발 서버 시작 | `npm run dev` | 포트 5173 리스닝 |
| QG-03 | 백엔드 서버 시작 | `npm run server` | 포트 3001 리스닝 |
| QG-04 | API Health 체크 | `curl localhost:3001/api/health` | 200 OK 응답 |
| QG-05 | 동시 실행 | `npm run start` | 양쪽 서버 정상 |

### 2.2 권장 품질 게이트

| ID | 품질 기준 | 검증 방법 | 통과 조건 |
|----|----------|----------|----------|
| QG-06 | ESLint 검사 | `npm run lint` | 오류 0개 |
| QG-07 | Tailwind 빌드 | Vite 빌드 시 CSS 생성 | 스타일 정상 적용 |
| QG-08 | HMR 동작 | 파일 수정 후 자동 갱신 | 2초 이내 갱신 |

### 2.3 성능 기준

| 항목 | 목표 | 측정 방법 |
|------|------|----------|
| 개발 서버 시작 시간 | < 5초 | `time npm run dev` |
| 백엔드 서버 시작 시간 | < 3초 | `time npm run server` |
| HMR 반영 시간 | < 2초 | 파일 수정 후 브라우저 갱신 |
| TypeScript 컴파일 시간 | < 10초 | `time npx tsc --noEmit` |

---

## 3. Definition of Done (완료 정의)

### 3.1 Phase 1 완료 조건

**필수 조건 (Must Have):**

- [x] 의존성 패키지 설치 완료 (`npm install` 성공)
- [x] TypeScript 설정 완료 (`tsconfig.json` 생성, strict 모드)
- [x] Vite 설정 완료 (`vite.config.ts` 생성, 프록시 설정)
- [x] Tailwind CSS 설정 완료 (`tailwind.config.js`, `index.css`)
- [x] React 진입점 생성 (`src/main.tsx`, `src/App.tsx`)
- [x] Express 서버 진입점 생성 (`server/index.ts`)
- [x] 핵심 타입 파일 생성 (`src/types/*.ts`)
- [x] 개발 스크립트 구성 (`dev`, `server`, `start`)
- [x] `npm run start` 실행 시 양쪽 서버 정상 동작
- [x] 브라우저에서 앱 접속 가능

**권장 조건 (Should Have):**

- [ ] ESLint 설정 완료
- [ ] Prettier 설정 완료
- [ ] VS Code 설정 파일 생성
- [ ] `.gitignore` 업데이트

**선택 조건 (Nice to Have):**

- [ ] 기본 테스트 설정 (Vitest)
- [ ] README 업데이트

### 3.2 검증 체크리스트

```bash
# 1. 의존성 설치 확인
npm install

# 2. TypeScript 컴파일 확인
npx tsc --noEmit

# 3. 개발 서버 시작 확인
npm run dev &
sleep 3
curl -s http://localhost:5173 | head -5

# 4. 백엔드 서버 시작 확인
npm run server &
sleep 2
curl -s http://localhost:3001/api/health

# 5. 동시 실행 확인
npm run start &
sleep 5
curl -s http://localhost:5173 | head -5
curl -s http://localhost:3001/api/health

# 6. 프록시 동작 확인
curl -s http://localhost:5173/api/health
```

---

## 4. 수락 테스트 결과 기록 템플릿

### 4.1 테스트 실행 기록

| 날짜 | 테스터 | 시나리오 | 결과 | 비고 |
|------|--------|---------|------|------|
| YYYY-MM-DD | - | 1.1 개발 서버 시작 | - | - |
| YYYY-MM-DD | - | 1.2 API 프록시 | - | - |
| YYYY-MM-DD | - | 1.3 TypeScript 타입 | - | - |
| YYYY-MM-DD | - | 1.4 Tailwind CSS | - | - |
| YYYY-MM-DD | - | 1.5 디렉토리 구조 | - | - |

### 4.2 품질 게이트 결과

| 날짜 | QG ID | 결과 | 측정값 | 비고 |
|------|-------|------|--------|------|
| YYYY-MM-DD | QG-01 | - | - | - |
| YYYY-MM-DD | QG-02 | - | - | - |
| YYYY-MM-DD | QG-03 | - | - | - |
| YYYY-MM-DD | QG-04 | - | - | - |
| YYYY-MM-DD | QG-05 | - | - | - |

---

## 5. 이슈 및 결함 추적

### 5.1 발견된 이슈 템플릿

| 이슈 ID | 심각도 | 설명 | 상태 | 해결 방안 |
|---------|--------|------|------|----------|
| INIT-001 | - | - | - | - |

### 5.2 심각도 정의

| 레벨 | 설명 | 조치 |
|------|------|------|
| Critical | 시스템 시작 불가 | 즉시 수정 필수 |
| High | 핵심 기능 동작 불가 | 수정 후 재검증 |
| Medium | 일부 기능 제한 | 다음 Phase에서 수정 |
| Low | 사소한 문제 | 선택적 수정 |

---

## 6. Traceability Tags

```
[SPEC-INIT-001]
├── [AC-1.1] Scenario: 개발 서버 정상 시작
├── [AC-1.2] Scenario: API 프록시 동작
├── [AC-1.3] Scenario: TypeScript 타입 검증
├── [AC-1.4] Scenario: Tailwind CSS 동작
├── [AC-1.5] Scenario: 디렉토리 구조 검증
├── [QG-01~05] 필수 품질 게이트
└── [QG-06~08] 권장 품질 게이트
```

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
