---
id: SPEC-AUTODISCOVERY-001
version: "1.1.0"
status: "completed"
created: "2026-01-08"
updated: "2026-01-08"
author: "MoAI-ADK"
priority: "medium"
---

# SPEC-AUTODISCOVERY-001: 관련 시스템 자동 탐색 (Relevant Systems Auto-Discovery)

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-08 | MoAI-ADK | 초기 SPEC 작성 |
| 1.1.0 | 2026-01-08 | MoAI-ADK | TDD 구현 완료 - status: completed |

---

## 1. 개요

### 1.1 기능 설명

Feature List 텍스트에서 키워드를 추출하고, 시스템 문서 태그와 매칭하여 AI(Claude Code)가 관련 시스템을 자동으로 추천하는 기능입니다.

### 1.2 사용자 스토리

> "기획자로서, 나는 새 기획서와 연관된 기존 시스템을 자동으로 추천받아 참조 목록에 쉽게 추가하고 싶습니다."

### 1.3 문제 해결

- 관련 시스템 수동 검색의 번거로움 해결
- 기획 문서 작성 시 참조 누락 방지
- 프로젝트 내 시스템 간 연관성 파악 지원

### 1.4 범위

**포함 범위**:
- Feature List 텍스트에서 키워드 추출
- Claude Code 기반 관련 시스템 판단
- 최대 5개 관련 시스템 추천
- 추천 결과 UI 표시
- 참조 목록에 일괄/개별 추가

**제외 범위**:
- 자동 참조 추가 (사용자 확인 필수)
- 프로젝트 간 시스템 추천
- 실시간 추천 (저장 시점 트리거)

---

## 2. 요구사항 (EARS 형식)

### 2.1 Ubiquitous Requirements (항상 적용)

**REQ-U-001**: 시스템은 태스크의 Feature List 텍스트를 분석하여 키워드를 추출해야 한다.

**REQ-U-002**: 시스템은 추출된 키워드를 시스템 문서 태그 데이터베이스와 매칭해야 한다.

**REQ-U-003**: 시스템은 추천된 시스템 목록을 UI에 관련도 점수와 함께 표시해야 한다.

**REQ-U-004**: 시스템은 최대 5개까지만 관련 시스템을 추천해야 한다.

### 2.2 Event-Driven Requirements (이벤트 기반)

**REQ-E-001**: 사용자가 Feature List 내용을 저장하면, 시스템은 자동 탐색 프로세스를 트리거해야 한다.

**REQ-E-002**: 키워드 추출이 완료되면, 시스템은:
- Claude Code를 호출하여 관련 시스템 목록을 판단
- 관련도 점수(0-100)를 계산

**REQ-E-003**: 사용자가 추천된 시스템의 "추가" 버튼을 클릭하면, 시스템은 해당 시스템을 참조 목록에 추가해야 한다.

**REQ-E-004**: 사용자가 "모두 추가" 버튼을 클릭하면, 시스템은 추천된 모든 시스템을 참조 목록에 추가해야 한다.

**REQ-E-005**: 사용자가 새로고침 버튼을 클릭하면, 시스템은 재분석을 실행해야 한다.

### 2.3 Unwanted Behavior Requirements (방지해야 할 동작)

**REQ-W-001**: 시스템은 중복된 시스템을 추천해서는 안 된다.

**REQ-W-002**: 시스템은 삭제된 시스템 문서를 추천해서는 안 된다.

**REQ-W-003**: 시스템은 사용자 확인 없이 참조 목록에 시스템을 자동 추가해서는 안 된다.

**REQ-W-004**: 시스템은 현재 프로젝트에 속하지 않은 시스템을 추천해서는 안 된다.

### 2.4 State-Driven Requirements (상태 기반)

**REQ-S-001**: Feature List 텍스트가 100자 미만일 때, 시스템은 "분석 가능한 충분한 내용이 필요합니다" 메시지를 표시해야 한다.

**REQ-S-002**: 추천 시스템이 0개일 때, 시스템은 "추천되는 시스템이 없습니다" 메시지를 표시해야 한다.

**REQ-S-003**: Claude Code 분석 중 오류 발생 시, 시스템은 키워드 기반 폴백 추천을 사용해야 한다.

**REQ-S-004**: 추천 시스템이 이미 참조 목록에 있을 때, 시스템은 "추가" 버튼을 비활성화하고 "이미 추가됨"을 표시해야 한다.

**REQ-S-005**: API 호출 중일 때, 시스템은 로딩 인디케이터를 표시해야 한다.

### 2.5 Optional Features (선택적 기능)

**REQ-O-001**: 시스템은 각 추천 시스템에 선택 이유를 표시할 수 있다 (예: "Character 태그 매칭 (85%)").

**REQ-O-002**: 시스템은 최근 자동 탐색 이력을 저장하여 "이전 추천" 목록을 제공할 수 있다.

---

## 3. 기술 아키텍처

### 3.1 컴포넌트 구조

```
/src/components/discovery/
├── AutoDiscoveryRecommendation.tsx  # 추천 결과 표시 컴포넌트
├── RecommendationCard.tsx           # 개별 추천 카드
└── DiscoverySkeleton.tsx            # 로딩 스켈레톤

/src/store/
└── discoveryStore.ts                # Zustand 상태 관리

/src/services/
└── discoveryService.ts              # API 클라이언트

/server/routes/
└── discovery.ts                     # Express API 라우트

/server/utils/
├── keywordExtractor.ts              # 키워드 추출 유틸리티
└── systemMatcher.ts                 # 시스템 매칭 로직
```

### 3.2 데이터 모델

```typescript
// 키워드 추출 결과
interface ExtractedKeyword {
  keyword: string;
  weight: number;  // 0-100
}

// 추천 시스템
interface RecommendedSystem {
  id: string;
  name: string;
  relevanceScore: number;  // 0-100
  matchReason?: string;    // 선택 이유
}

// 자동 탐색 상태
interface DiscoveryState {
  recommendations: RecommendedSystem[];
  isLoading: boolean;
  error: string | null;
  lastAnalyzedText: string;
}
```

### 3.3 API 엔드포인트

| Method | Endpoint | 설명 | 요청 본문 | 응답 |
|--------|----------|------|-----------|------|
| POST | `/api/projects/:projectId/tasks/:taskId/discover` | 관련 시스템 탐색 | `{ featureText: string }` | `RecommendedSystem[]` |
| POST | `/api/projects/:projectId/discover-preview` | 미리보기 탐색 | `{ text: string }` | `RecommendedSystem[]` |

### 3.4 의존성

**기존 모듈 의존성**:
- `src/store/systemStore.ts` - 시스템 문서 데이터
- `src/store/referenceStore.ts` - 참조 시스템 관리
- `server/utils/claudeCodeRunner.ts` - Claude Code 실행

**새로운 외부 라이브러리**:
- 없음 (기존 의존성으로 구현)

---

## 4. UI/UX 명세

### 4.1 추천 결과 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 관련 시스템 추천                    [새로고침] [모두 추가] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📄 Character System                    95%  [추가]  │ │
│ │    Character 태그 매칭                              │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📄 Experience System                   88%  [추가]  │ │
│ │    경험치, 레벨 키워드 매칭                          │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📄 Level Progression                   82%  [이미 추가됨] │ │
│ │    레벨, 성장 키워드 매칭                            │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4.2 상태별 UI

**로딩 상태**:
- 스켈레톤 UI 3개 표시
- "관련 시스템 분석 중..." 메시지

**결과 없음 상태**:
- "추천되는 시스템이 없습니다" 메시지
- 수동 검색 안내

**에러 상태**:
- 에러 메시지 표시
- "다시 시도" 버튼

### 4.3 인터랙션

- **관련도 점수**: 프로그레스 바로 시각화
- **추가 버튼**: 클릭 시 즉시 참조 목록에 추가
- **모두 추가**: 미추가된 시스템 일괄 추가
- **새로고침**: 재분석 실행

---

## 5. 비기능 요구사항

### 5.1 성능

- 키워드 추출: 100ms 이내
- Claude 분석: 5초 이내 (타임아웃)
- 캐시 히트 시 응답: 200ms 이내

### 5.2 신뢰성

- Claude 실패 시 폴백 추천 제공
- 동일 입력 캐싱으로 중복 분석 방지

### 5.3 접근성

- 키보드 네비게이션 지원
- 스크린 리더 호환성

---

## 6. 관련 문서

- [PRD - Feature 8: Relevant Systems Auto-Discovery](../../project/product.md)
- [프로젝트 구조](../../project/structure.md)
- [기술 스택](../../project/tech.md)
- [SPEC-SYSTEM-001: 시스템 문서 관리](../SPEC-SYSTEM-001/spec.md)
- [SPEC-REFERENCE-001: 참조 시스템 선택](../SPEC-REFERENCE-001/spec.md)
- [SPEC-CLAUDE-001: Claude Code 통합](../SPEC-CLAUDE-001/spec.md)
