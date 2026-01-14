# SPEC-PROMPT-001: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-PROMPT-001 |
| **문서 유형** | Implementation Plan |
| **생성일** | 2026-01-14 |
| **최종 수정** | 2026-01-14 |

---

## 1. 구현 전략

### 1.1 접근 방식

**점진적 마이그레이션 전략**을 채택한다:

1. 기존 `promptBuilder.ts` 함수를 유지하면서 새로운 템플릿 시스템 구축
2. 템플릿 시스템에서 프롬프트를 로드하여 기존 함수에 주입
3. 완전한 마이그레이션 후 하드코딩된 프롬프트 제거

이 접근 방식의 장점:
- 무중단 마이그레이션 가능
- 롤백 용이
- 기능별 점진적 검증 가능

### 1.2 아키텍처 설계

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  PromptManagerPage                                          │
│  ├── PromptList (카테고리별 그룹)                            │
│  ├── PromptEditor (CodeMirror 6)                            │
│  ├── PromptVariablePanel                                    │
│  └── PromptVersionHistory                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ REST API
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
├─────────────────────────────────────────────────────────────┤
│  /api/prompts/*                                             │
│  ├── promptRoutes.ts (라우터)                                │
│  ├── promptService.ts (비즈니스 로직)                         │
│  └── promptStorage.ts (파일 I/O)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Storage                                │
│  workspace/templates/prompts/                                │
│  ├── prompts.json (메타데이터)                               │
│  ├── *.md (프롬프트 내용)                                    │
│  └── versions/ (버전 히스토리)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 마일스톤

### 2.1 Primary Goal - 핵심 기능

**목표**: 프롬프트 조회 및 편집 기본 기능 구현

**태스크**:
1. 프롬프트 템플릿 데이터 모델 설계 및 초기 데이터 생성
2. Backend API 구현 (CRUD)
3. promptStorage.ts 파일 I/O 유틸리티 구현
4. PromptList 컴포넌트 구현 (카테고리별 그룹화)
5. PromptEditor 컴포넌트 구현 (CodeMirror 6 기반)
6. promptStore.ts Zustand 스토어 구현

**산출물**:
- `server/routes/prompts.ts`
- `server/utils/promptStorage.ts`
- `src/components/prompt/PromptList.tsx`
- `src/components/prompt/PromptEditor.tsx`
- `src/store/promptStore.ts`
- `workspace/templates/prompts/prompts.json`

### 2.2 Secondary Goal - 변수 시스템

**목표**: 프롬프트 변수 관리 및 검증 시스템 구현

**태스크**:
1. PromptVariable 데이터 모델 구현
2. PromptVariablePanel 컴포넌트 구현
3. 변수 구문 검증 로직 ({{variable}} 형식)
4. 필수 변수 누락 검증
5. 변수 자동완성 기능 (CodeMirror extension)

**산출물**:
- `src/components/prompt/PromptVariablePanel.tsx`
- `server/utils/promptValidator.ts`
- CodeMirror 변수 하이라이트 extension

### 2.3 Tertiary Goal - 버전 관리

**목표**: 프롬프트 버전 히스토리 및 복원 기능 구현

**태스크**:
1. PromptVersion 데이터 모델 구현
2. 버전 저장 로직 (자동 버전 생성)
3. PromptVersionHistory 컴포넌트 구현
4. 버전 비교(Diff) 뷰 구현
5. 기본값 복원 기능 구현

**산출물**:
- `src/components/prompt/PromptVersionHistory.tsx`
- `src/components/prompt/PromptResetConfirmModal.tsx`
- 버전 저장 디렉토리 구조

### 2.4 Optional Goal - 고급 기능

**목표**: 미리보기, 내보내기/가져오기 기능

**태스크**:
1. PromptPreviewModal 컴포넌트 구현
2. 샘플 데이터를 이용한 프롬프트 렌더링
3. JSON 내보내기/가져오기 기능
4. 프롬프트 유효성 검사 강화

**산출물**:
- `src/components/prompt/PromptPreviewModal.tsx`
- Import/Export API 엔드포인트

---

## 3. 기술적 접근

### 3.1 Backend 구현

#### 3.1.1 프롬프트 라우터 (`server/routes/prompts.ts`)

```typescript
// 구현 방향
import express from 'express';
import * as promptService from '../utils/promptService';

const router = express.Router();

// GET /api/prompts - 전체 목록
router.get('/', async (req, res) => {
  const prompts = await promptService.getAllPrompts();
  res.json(prompts);
});

// GET /api/prompts/:id - 상세 조회
router.get('/:id', async (req, res) => {
  const prompt = await promptService.getPromptById(req.params.id);
  res.json(prompt);
});

// PUT /api/prompts/:id - 수정
router.put('/:id', async (req, res) => {
  const updated = await promptService.updatePrompt(req.params.id, req.body);
  res.json(updated);
});

// POST /api/prompts/:id/reset - 기본값 복원
router.post('/:id/reset', async (req, res) => {
  const reset = await promptService.resetPrompt(req.params.id);
  res.json(reset);
});

export default router;
```

#### 3.1.2 프롬프트 스토리지 (`server/utils/promptStorage.ts`)

기존 패턴 참조: `systemStorage.ts`, `taskStorage.ts`

주요 기능:
- `loadPrompts()`: 전체 프롬프트 메타데이터 로드
- `loadPromptContent(id)`: 개별 프롬프트 내용 로드
- `savePromptContent(id, content)`: 프롬프트 저장 (버전 생성 포함)
- `getVersions(id)`: 버전 히스토리 조회
- `resetToDefault(id)`: 기본값 복원

### 3.2 Frontend 구현

#### 3.2.1 상태 관리 (`src/store/promptStore.ts`)

```typescript
// 구현 방향
import { create } from 'zustand';
import * as promptService from '../services/promptService';

interface PromptState {
  prompts: PromptTemplate[];
  selectedPrompt: PromptTemplate | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPrompts: () => Promise<void>;
  selectPrompt: (id: string) => Promise<void>;
  updatePrompt: (id: string, content: string) => Promise<void>;
  resetPrompt: (id: string) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  // ... 구현
}));
```

#### 3.2.2 프롬프트 에디터 컴포넌트

기존 `EnhancedDocumentEditor.tsx` 패턴 참조:
- CodeMirror 6 기반
- 구문 하이라이팅 (변수 {{...}} 하이라이팅)
- 자동 저장 (debounce 5초)
- 저장 상태 표시

#### 3.2.3 라우팅

```typescript
// App.tsx 또는 라우터에 추가
<Route path="/prompts" element={<PromptManagerPage />} />
```

네비게이션 메뉴에 "프롬프트 관리" 항목 추가 (설정 섹션)

### 3.3 마이그레이션 계획

#### Phase 1: 병행 운영
- 새로운 템플릿 시스템 구축
- 기존 `promptBuilder.ts` 유지
- 템플릿에서 프롬프트 로드하여 기존 함수에 주입

```typescript
// promptBuilder.ts 수정 예시
import { getPromptContent } from './promptStorage';

export async function buildDesignDocumentPrompt(...) {
  // 템플릿에서 프롬프트 내용 로드 (수정 가능)
  const template = await getPromptContent('design-document');

  // 변수 치환
  return interpolateVariables(template, { qaResponses, referenceSystemIds });
}
```

#### Phase 2: 완전 마이그레이션
- 모든 프롬프트가 템플릿 시스템으로 이전 완료
- 하드코딩된 프롬프트 내용 제거
- 함수는 템플릿 로더 + 변수 치환 역할만 수행

---

## 4. 위험 요소 및 대응

| 위험 요소 | 영향도 | 발생 가능성 | 대응 방안 |
|-----------|--------|-------------|-----------|
| 기존 기능 중단 | High | Low | 병행 운영으로 점진적 마이그레이션 |
| 잘못된 프롬프트로 문서 생성 실패 | Medium | Medium | 프리뷰 기능, 버전 복원 기능 |
| 파일 I/O 동시성 이슈 | Medium | Low | 파일 락 또는 순차 처리 |
| 대용량 프롬프트 에디터 성능 | Low | Low | CodeMirror 6 가상화, 100KB 제한 |

---

## 5. 테스트 전략

### 5.1 단위 테스트

- `promptStorage.ts`: 파일 I/O 로직
- `promptValidator.ts`: 변수 검증 로직
- `promptService.ts`: 비즈니스 로직

### 5.2 통합 테스트

- API 엔드포인트 테스트 (supertest)
- 프롬프트 CRUD 플로우
- 버전 관리 플로우

### 5.3 컴포넌트 테스트

- PromptList 렌더링 테스트
- PromptEditor 상호작용 테스트
- PromptVariablePanel 검증 테스트

### 5.4 E2E 테스트

- 프롬프트 수정 → 문서 생성 → 결과 확인 전체 플로우

---

## 6. 구현 순서

```
1. [Backend] promptStorage.ts 구현
2. [Backend] promptService.ts 구현
3. [Backend] prompts.ts 라우터 구현
4. [Data] 초기 프롬프트 템플릿 데이터 생성
5. [Frontend] promptStore.ts 구현
6. [Frontend] promptService.ts (API 클라이언트) 구현
7. [Frontend] PromptList.tsx 구현
8. [Frontend] PromptCard.tsx 구현
9. [Frontend] PromptEditor.tsx 구현 (CodeMirror 기반)
10. [Frontend] PromptManagerPage.tsx 구현 (라우트)
11. [Integration] promptBuilder.ts 마이그레이션
12. [Frontend] PromptVariablePanel.tsx 구현
13. [Frontend] PromptVersionHistory.tsx 구현
14. [Frontend] PromptPreviewModal.tsx 구현 (Optional)
```

---

## 7. 추적성 태그

```
[TAG:SPEC-PROMPT-001]
- plan.md (이 문서)
- spec.md (요구사항 명세)
- acceptance.md (인수 기준)
```

---

## 8. 참고 자료

### 8.1 참조할 기존 구현

| 컴포넌트 | 참조 대상 | 위치 |
|----------|-----------|------|
| 에디터 | EnhancedDocumentEditor | src/components/document/ |
| 스토리지 | systemStorage, taskStorage | server/utils/ |
| 라우터 | systems.ts, tasks.ts | server/routes/ |
| 스토어 | systemStore, taskStore | src/store/ |

### 8.2 기술 스택

- CodeMirror 6: @uiw/react-codemirror
- Zustand 5.x: 상태 관리
- Express 5.x: REST API
- TypeScript 5.9.x: 타입 안전성
