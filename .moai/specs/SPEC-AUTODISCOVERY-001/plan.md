# SPEC-AUTODISCOVERY-001: 구현 계획 (Implementation Plan)

## 개요

이 문서는 관련 시스템 자동 탐색 기능(SPEC-AUTODISCOVERY-001)의 구현 계획을 정의합니다.

---

## 1. 구현 단계

### Phase 1: 키워드 추출 유틸리티 (Foundation)

**목표**: Feature List 텍스트에서 의미 있는 키워드 추출

**태스크**:
1. 키워드 추출 함수 구현 (`server/utils/keywordExtractor.ts`)
   - 한글/영문 단어 분리
   - 불용어(stopwords) 필터링
2. 태그 정규화 및 중복 제거
3. 키워드 가중치 계산 (출현 빈도 기반)
4. 단위 테스트 작성

**예상 테스트**: 10-12개

### Phase 2: 시스템 탐색 서비스 (Core Logic)

**목표**: Claude Code를 활용한 관련 시스템 판단

**태스크**:
1. systemFinder.ts 프롬프트 작성 (`src/prompts/systemFinder.ts`)
2. discoveryService.ts 구현 (`src/services/discoveryService.ts`)
   - Claude Code 호출 로직
   - 응답 파싱 및 정규화
3. 폴백 추천 로직 (Claude 실패 시)
   - 키워드-태그 직접 매칭
4. 캐싱 전략 구현 (동일 텍스트 재분석 방지)
5. 단위 테스트 작성

**예상 테스트**: 12-15개

### Phase 3: 백엔드 API 엔드포인트 (API Layer)

**목표**: 자동 탐색 기능 REST API 구현

**태스크**:
1. discovery.ts 라우트 생성 (`server/routes/discovery.ts`)
   - POST /discover 엔드포인트
   - 입력 검증 (텍스트 길이, projectId)
2. systemMatcher.ts 유틸리티 (`server/utils/systemMatcher.ts`)
   - 시스템 문서 태그와 키워드 매칭
3. Express 앱에 라우트 등록
4. API 통합 테스트 작성

**예상 테스트**: 10-12개

### Phase 4: 프론트엔드 상태 관리 (State)

**목표**: 자동 탐색 결과 상태 관리

**태스크**:
1. discoveryStore.ts 생성 (`src/store/discoveryStore.ts`)
   - 추천 결과 상태
   - 로딩/에러 상태
   - 캐시 관리
2. discoveryService.ts 프론트엔드 API 클라이언트
3. 단위 테스트 작성

**예상 테스트**: 8-10개

### Phase 5: UI 컴포넌트 (Presentation)

**목표**: 자동 탐색 추천 결과 표시 UI

**태스크**:
1. AutoDiscoveryRecommendation 컴포넌트
   - 추천 결과 카드 렌더링
   - 관련도 점수 프로그레스 바
2. "추가" / "모두 추가" 버튼 구현
3. 로딩/에러/결과없음 상태 UI
4. TaskEditModal에 컴포넌트 통합
5. 컴포넌트 테스트 작성

**예상 테스트**: 12-15개

### Phase 6: 통합 및 최적화 (Integration)

**목표**: 전체 기능 통합 및 성능 최적화

**태스크**:
1. E2E 통합 테스트
2. 성능 최적화 (React.memo, 캐싱)
3. 에러 복구 전략 검증
4. 문서화 및 JSDoc 추가

**예상 테스트**: 5-8개

---

## 2. 태스크 분해

### TASK-001: 키워드 추출 함수 구현
- **파일**: `server/utils/keywordExtractor.ts`
- **내용**: extractKeywords(text: string): ExtractedKeyword[]
- **의존성**: 없음
- **우선순위**: High

### TASK-002: 불용어 필터 구현
- **파일**: `server/utils/keywordExtractor.ts`
- **내용**: 한글/영문 불용어 목록 및 필터링
- **의존성**: TASK-001
- **우선순위**: High

### TASK-003: 시스템 탐색 프롬프트 작성
- **파일**: `src/prompts/systemFinder.ts`
- **내용**: Claude Code용 프롬프트 템플릿
- **의존성**: 없음
- **우선순위**: High

### TASK-004: Discovery 서비스 구현
- **파일**: `src/services/discoveryService.ts`
- **내용**: discoverRelatedSystems(projectId, taskId, featureText)
- **의존성**: TASK-003
- **우선순위**: High

### TASK-005: 폴백 추천 로직 구현
- **파일**: `src/services/discoveryService.ts`
- **내용**: Claude 실패 시 키워드 기반 매칭
- **의존성**: TASK-004
- **우선순위**: Medium

### TASK-006: Discovery API 라우트 구현
- **파일**: `server/routes/discovery.ts`
- **내용**: POST /api/projects/:projectId/tasks/:taskId/discover
- **의존성**: TASK-001, TASK-004
- **우선순위**: High

### TASK-007: Discovery Store 구현
- **파일**: `src/store/discoveryStore.ts`
- **내용**: Zustand 스토어, 액션 정의
- **의존성**: TASK-004
- **우선순위**: Medium

### TASK-008: AutoDiscoveryRecommendation 컴포넌트 구현
- **파일**: `src/components/discovery/AutoDiscoveryRecommendation.tsx`
- **내용**: 추천 결과 UI 컴포넌트
- **의존성**: TASK-007
- **우선순위**: Medium

### TASK-009: TaskEditModal 통합
- **파일**: `src/components/task/TaskEditModal.tsx`
- **내용**: AutoDiscoveryRecommendation 컴포넌트 삽입
- **의존성**: TASK-008
- **우선순위**: Medium

### TASK-010: 참조 추가 기능 연동
- **파일**: `src/components/discovery/AutoDiscoveryRecommendation.tsx`
- **내용**: referenceStore와 연동하여 시스템 추가
- **의존성**: TASK-008
- **우선순위**: Medium

---

## 3. 기술 스택

### 기존 의존성 활용

```json
{
  "dependencies": {
    "zustand": "^4.4.0",
    "react": "^18.2.0"
  }
}
```

### 새로운 의존성

- 없음 (기존 스택으로 구현)

---

## 4. 위험 분석 및 대응

### 위험 1: Claude Code 호출 실패
- **위험도**: Medium
- **영향**: 추천 기능 불가
- **대응**: 키워드 기반 폴백 추천 구현

### 위험 2: 성능 저하 (많은 시스템 문서)
- **위험도**: Low
- **영향**: 응답 지연
- **대응**: 캐싱 및 페이지네이션 검토

### 위험 3: 키워드 추출 정확도
- **위험도**: Medium
- **영향**: 부정확한 추천
- **대응**: 불용어 목록 확장, 가중치 조정

---

## 5. 테스트 전략

### 단위 테스트 (Unit Tests)
- 키워드 추출 함수
- 시스템 매칭 로직
- 스토어 액션 및 상태 변경
- 컴포넌트 렌더링

### 통합 테스트 (Integration Tests)
- API 엔드포인트 요청/응답
- Claude Code 호출 모킹
- Store-Service 연동

### 컴포넌트 테스트 (Component Tests)
- 추천 결과 표시
- 버튼 인터랙션
- 로딩/에러 상태

---

## 6. 일정 추정

| Phase | 예상 작업량 | 테스트 수 |
|-------|------------|----------|
| Phase 1 | 키워드 추출 | 10-12 |
| Phase 2 | 시스템 탐색 | 12-15 |
| Phase 3 | API 엔드포인트 | 10-12 |
| Phase 4 | 상태 관리 | 8-10 |
| Phase 5 | UI 컴포넌트 | 12-15 |
| Phase 6 | 통합 및 최적화 | 5-8 |
| **Total** | **전체** | **57-72** |

---

## 7. 성공 기준

- [ ] 모든 테스트 통과 (57-72개)
- [ ] 테스트 커버리지 85% 이상
- [ ] Claude 분석 응답 5초 이내
- [ ] 캐시 히트 시 200ms 이내 응답
- [ ] 폴백 추천 정상 동작
- [ ] UI 접근성 검증 통과
