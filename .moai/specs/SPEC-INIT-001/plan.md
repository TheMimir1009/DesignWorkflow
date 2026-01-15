# SPEC-INIT-001: 구현 계획 (Implementation Plan)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-INIT-001 |
| **제목** | 프로젝트 초기화 구현 계획 |
| **우선순위** | HIGH |
| **관련 SPEC** | spec.md |

---

## 1. 구현 개요

### 1.1 목표

DesignWorkflow 프로젝트의 기반 인프라를 구축하여 후속 Phase에서 기능 구현이 가능하도록 준비합니다.

### 1.2 범위

- Vite + React + TypeScript 프로젝트 구조 생성
- Tailwind CSS 스타일링 환경 설정
- Express 백엔드 서버 기본 설정
- TypeScript 설정 및 경로 별칭 구성
- 핵심 타입 정의 파일 생성
- 개발 스크립트 구성

### 1.3 범위 제외

- 데이터베이스 연동
- 인증/인가 기능
- 비즈니스 로직 구현
- UI 컴포넌트 구현 (진입점 제외)

---

## 2. 마일스톤 (Priority-Based)

### 2.1 Primary Goal (필수 완료)

**M1: 프로젝트 기본 구조 생성**

| 태스크 | 설명 | 산출물 |
|--------|------|--------|
| T1.1 | 의존성 패키지 설치 | package.json 업데이트 |
| T1.2 | 디렉토리 구조 생성 | src/, server/, workspace/ |
| T1.3 | TypeScript 설정 구성 | tsconfig.json |
| T1.4 | Vite 빌드 설정 구성 | vite.config.ts |

**M2: 프론트엔드 진입점 구성**

| 태스크 | 설명 | 산출물 |
|--------|------|--------|
| T2.1 | React 진입점 생성 | src/main.tsx |
| T2.2 | 라우팅 루트 생성 | src/App.tsx |
| T2.3 | Tailwind CSS 설정 | tailwind.config.js, index.css |
| T2.4 | 경로 별칭 설정 | @/ → src/ |

**M3: 백엔드 진입점 구성**

| 태스크 | 설명 | 산출물 |
|--------|------|--------|
| T3.1 | Express 서버 진입점 | server/index.ts |
| T3.2 | CORS 미들웨어 설정 | cors 패키지 연동 |
| T3.3 | JSON 파싱 미들웨어 | express.json() |
| T3.4 | API 프록시 설정 | Vite proxy 구성 |

### 2.2 Secondary Goal (권장 완료)

**M4: 핵심 타입 정의**

| 태스크 | 설명 | 산출물 |
|--------|------|--------|
| T4.1 | 핵심 엔티티 타입 정의 | src/types/index.ts |
| T4.2 | Q&A 관련 타입 정의 | src/types/qa.ts |
| T4.3 | LLM 관련 타입 정의 | src/types/llm.ts |
| T4.4 | Pipeline 타입 정의 | src/types/passthrough.ts |

**M5: 개발 환경 스크립트**

| 태스크 | 설명 | 산출물 |
|--------|------|--------|
| T5.1 | 개발 서버 스크립트 | npm run dev |
| T5.2 | 백엔드 서버 스크립트 | npm run server |
| T5.3 | 동시 실행 스크립트 | npm run start |
| T5.4 | 빌드 스크립트 | npm run build |

### 2.3 Optional Goal (선택 완료)

**M6: 품질 도구 설정**

| 태스크 | 설명 | 산출물 |
|--------|------|--------|
| T6.1 | ESLint 설정 | eslint.config.js |
| T6.2 | Prettier 설정 | .prettierrc |
| T6.3 | VS Code 설정 | .vscode/settings.json |
| T6.4 | Git ignore 업데이트 | .gitignore |

---

## 3. 기술적 접근 방식

### 3.1 아키텍처 설계 방향

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)                   │
│                      localhost:5173                          │
├─────────────────────────────────────────────────────────────┤
│                         Vite Proxy                           │
│                    /api/* → localhost:3001                   │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Express)                         │
│                      localhost:3001                          │
├─────────────────────────────────────────────────────────────┤
│                  File System (workspace/)                    │
│              JSON 파일 기반 데이터 저장                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 모듈 구성 전략

**프론트엔드 레이어:**
```
UI Components → Store (Zustand) → Service → API (fetch)
```

**백엔드 레이어:**
```
Routes → Utils (Storage) → File System (JSON)
```

### 3.3 타입 시스템 전략

- **Strict Mode**: 모든 타입 오류를 컴파일 타임에 검출
- **타입 중앙화**: `src/types/` 디렉토리에서 모든 타입 관리
- **타입 재사용**: 프론트엔드와 백엔드에서 동일 타입 정의 참조

### 3.4 API 설계 규칙

**응답 형식 표준화:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
```

**성공 응답:**
```json
{ "success": true, "data": {...}, "error": null }
```

**실패 응답:**
```json
{ "success": false, "data": null, "error": "에러 메시지" }
```

---

## 4. 태스크 의존성

### 4.1 의존성 다이어그램

```
T1.1 (패키지 설치)
  │
  ├── T1.2 (디렉토리 생성) ──┐
  │                          │
  ├── T1.3 (TS 설정) ────────┼── T2.1 (main.tsx)
  │                          │        │
  ├── T1.4 (Vite 설정) ──────┤        ├── T2.2 (App.tsx)
  │                          │        │
  └── T2.3 (Tailwind) ───────┘        └── T3.1 (server)
                                            │
T4.1~T4.4 (타입 정의) ◄─────────────────────┘
```

### 4.2 병렬 실행 가능 태스크

| 그룹 | 태스크 | 설명 |
|------|--------|------|
| Group A | T2.1, T2.2, T2.3 | 프론트엔드 진입점 (T1.* 완료 후) |
| Group B | T3.1, T3.2, T3.3 | 백엔드 진입점 (T1.* 완료 후) |
| Group C | T4.1, T4.2, T4.3, T4.4 | 타입 정의 (T2.*, T3.* 완료 후) |

---

## 5. 리스크 및 대응 계획

### 5.1 기술적 리스크

| 리스크 | 발생 가능성 | 영향도 | 대응 방안 |
|--------|------------|--------|----------|
| npm 패키지 버전 충돌 | 중간 | 높음 | package-lock.json 고정, 정확한 버전 명시 |
| TypeScript 설정 오류 | 낮음 | 중간 | PRD 참조 설정 복사, 점진적 strict 적용 |
| Vite 프록시 설정 실패 | 낮음 | 높음 | 콘솔 로그 확인, 프록시 설정 검증 |
| 포트 충돌 (5173, 3001) | 낮음 | 낮음 | 환경 변수로 포트 설정 가능하게 구성 |

### 5.2 프로젝트 리스크

| 리스크 | 발생 가능성 | 영향도 | 대응 방안 |
|--------|------------|--------|----------|
| 요구사항 불명확 | 낮음 | 중간 | PRD 문서 상세 참조 |
| 범위 확장 (Scope Creep) | 중간 | 높음 | Phase 1 범위 엄격 준수 |

---

## 6. 검증 체크리스트

### 6.1 Primary Goal 완료 조건

- [ ] `npm install` 성공 (의존성 오류 없음)
- [ ] `npm run dev` 실행 시 Vite 서버 정상 시작 (포트 5173)
- [ ] `npm run server` 실행 시 Express 서버 정상 시작 (포트 3001)
- [ ] `npm run start` 실행 시 양쪽 서버 동시 시작
- [ ] 브라우저에서 `http://localhost:5173` 접속 가능
- [ ] `/api/health` 엔드포인트 응답 확인

### 6.2 Secondary Goal 완료 조건

- [ ] `src/types/index.ts` 컴파일 오류 없음
- [ ] `src/types/qa.ts` 컴파일 오류 없음
- [ ] `src/types/llm.ts` 컴파일 오류 없음
- [ ] `src/types/passthrough.ts` 컴파일 오류 없음
- [ ] TypeScript strict 모드에서 타입 오류 없음

### 6.3 Optional Goal 완료 조건

- [ ] `npm run lint` 실행 가능
- [ ] `.gitignore`에 workspace/, node_modules/ 포함
- [ ] VS Code에서 경로 별칭 자동완성 동작

---

## 7. 참조 문서

| 문서 | 참조 섹션 |
|------|----------|
| PRD-DesignWorkflow-Implementation-Guide-v2.md | 2.1~2.5 (기술 스택) |
| QUICKSTART.md | Phase 1 (초기화) |
| spec.md | 전체 (EARS 요구사항) |
| acceptance.md | 전체 (수락 기준) |

---

## 8. Traceability Tags

```
[SPEC-INIT-001]
├── [PLAN-M1] Primary: 프로젝트 기본 구조
├── [PLAN-M2] Primary: 프론트엔드 진입점
├── [PLAN-M3] Primary: 백엔드 진입점
├── [PLAN-M4] Secondary: 핵심 타입 정의
├── [PLAN-M5] Secondary: 개발 환경 스크립트
└── [PLAN-M6] Optional: 품질 도구 설정
```

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
