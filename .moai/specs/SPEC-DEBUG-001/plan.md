# SPEC-DEBUG-001: 구현 계획 (Implementation Plan)

## 개요

이 문서는 LLM Debug Console 기능(SPEC-DEBUG-001)의 구현 계획을 정의합니다.

---

## 1. 구현 단계

### Phase 1: 기반 인프라 (Foundation)

**목표**: Debug Console 기본 구조 및 데이터 모델 구축

**태스크**:
1. TypeScript 타입 정의 추가 (`src/types/debug.ts`)
   - LLMCallLog, DebugFilters, DebugState 인터페이스
2. Zustand 스토어 생성 (`src/store/debugStore.ts`)
   - 상태 관리, 액션 정의
3. 모델 가격표 설정 (`src/utils/modelPricing.ts`)
   - 모델별 가격 정보
4. 비용 계산 유틸리티 (`src/utils/costCalculator.ts`)
   - 토큰 기반 비용 계산

**예상 테스트**: 20-25개

### Phase 2: LLM Logger 구현 (Logging System)

**목표**: API 호출 자동 로깅 시스템 구현

**태스크**:
1. LLM Logger 클래스 구현 (`src/utils/llmLogger.ts`)
   - logRequest, logResponse, logError 메서드
2. 헤더 마스킹 유틸리티
   - API 키 및 민감 정보 보호
3. 토큰 사용량 추출기
   - Anthropic, OpenAI 응답 파싱
4. 기존 LLM 호출 코드에 Logger 통합

**예상 테스트**: 25-30개

### Phase 3: 기본 UI 컴포넌트 (Base Components)

**목표**: Debug Console 기본 컴포넌트 구현

**태스크**:
1. DebugConsole 메인 컴포넌트
2. DebugHeader 컴포넌트 (지우기, 내보내기)
3. DebugFilters 컴포넌트 (필터 컨트롤)
4. DebugStats 컴포넌트 (통계 요약)
5. EmptyDebugState 컴포넌트 (빈 상태)
6. DebugStatusIcon 컴포넌트 (상태 인디케이터)

**예상 테스트**: 30-35개

### Phase 4: 로그 목록 및 상세 (Log List & Details)

**목표**: 로그 목록 및 상세 보기 구현

**태스크**:
1. LogList 컴포넌트 (가상화된 목록)
2. LogItem 컴포넌트 (개별 항목)
3. LogDetailModal 컴포넌트 (상세 보기 모달)
4. 요청/응답 JSON 포맷터
5. 구문 강조 (Syntax Highlighting)

**예상 테스트**: 25-30개

### Phase 5: 재시도 기능 (Retry Mechanism)

**목표**: 실패한 요청 재시도 기능 구현

**태스크**:
1. 재시도 API 서비스 함수
2. 재시도 버튼 UI 연결
3. 재시도 결과 로그 연동
4. 재시도 횟수 제한

**예상 테스트**: 15-20개

### Phase 6: 내보내기 및 검색 (Export & Search)

**목표**: 로그 내보내기 및 검색 기능 구현

**태스크**:
1. JSON 내보내기 기능
2. CSV 내보내기 기능
3. 검색 필터 구현 (모델, 상태, 검색어)
4. 고급 필터 (날짜 범위, 최소 토큰 등)

**예상 테스트**: 20-25개

### Phase 7: 개발 모드 통합 (Dev Mode Integration)

**목표**: 개발 모드 전용 기능으로 통합

**태스크**:
1. 개발 모드 환경 변수 체크
2. 프로덕션 빌드에서 컴포넌트 제외
3. 네비게이션 메뉴 조건부 렌더링
4. 개발자 도구 단축키 (Ctrl+Shift+D)

**예상 테스트**: 10-15개

---

## 2. 태스크 분해

### TASK-001: Debug 타입 정의
- **파일**: `src/types/debug.ts`
- **내용**: LLMCallLog, DebugFilters, DebugState, ModelPricing
- **의존성**: 없음
- **우선순위**: High

### TASK-002: Debug Store 구현
- **파일**: `src/store/debugStore.ts`
- **내용**: Zustand 스토어, 상태 관리, 액션
- **의존성**: TASK-001
- **우선순위**: High

### TASK-003: 모델 가격표 구현
- **파일**: `src/utils/modelPricing.ts`
- **내용**: 모델별 가격 정보 상수
- **의존성**: 없음
- **우선순위**: High

### TASK-004: 비용 계산 유틸리티
- **파일**: `src/utils/costCalculator.ts`
- **내용**: 토큰 기반 비용 계산 함수
- **의존성**: TASK-003
- **우선순위**: High

### TASK-005: LLM Logger 구현
- **파일**: `src/utils/llmLogger.ts`
- **내용**: API 호출 로깅 클래스
- **의존성**: TASK-002, TASK-004
- **우선순위**: High

### TASK-006: 헤더 마스킹 유틸리티
- **파일**: `src/utils/sanitizeHeaders.ts`
- **내용**: API 키 마스킹 함수
- **의존성**: 없음
- **우선순위**: High

### TASK-007: DebugConsole 메인 컴포넌트
- **파일**: `src/components/debug/DebugConsole.tsx`
- **내용**: 메인 레이아웃
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-008: DebugHeader 컴포넌트
- **파일**: `src/components/debug/DebugHeader.tsx`
- **내용**: 지우기, 내보내기 버튼
- **의존성**: TASK-007
- **우선순위**: Medium

### TASK-009: DebugFilters 컴포넌트
- **파일**: `src/components/debug/DebugFilters.tsx`
- **내용**: 필터 컨트롤
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-010: DebugStats 컴포넌트
- **파일**: `src/components/debug/DebugStats.tsx`
- **내용**: 통계 요약
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-011: LogList 컴포넌트
- **파일**: `src/components/debug/LogList.tsx`
- **내용**: 가상화된 로그 목록
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-012: LogItem 컴포넌트
- **파일**: `src/components/debug/LogItem.tsx`
- **내용**: 개별 로그 항목
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-013: LogDetailModal 컴포넌트
- **파일**: `src/components/debug/LogDetailModal.tsx`
- **내용**: 상세 보기 모달
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-014: 재시도 기능 구현
- **파일**: `src/services/debugService.ts`
- **내용**: 재시도 API 함수
- **의존성**: TASK-005
- **우선순위**: Low

### TASK-015: 내보내기 기능 구현
- **파일**: `src/utils/debugExport.ts`
- **내용**: JSON/CSV 내보내기
- **의존성**: TASK-002
- **우선순위**: Low

---

## 3. 기술 스택

### 새로 추가되는 의존성

```json
{
  "dependencies": {
    "react-syntax-highlighter": "^15.5.0"
  },
  "devDependencies": {
    "@types/react-syntax-highlighter": "^15.5.0"
  }
}
```

### 기존 의존성 활용

- `zustand` - 상태 관리
- `clsx` / `cn()` - 클래스 이름 유틸리티
- `lucide-react` - 아이콘

---

## 4. 파일 구조

```
src/
├── types/
│   └── debug.ts                        # Debug 타입 정의
├── store/
│   └── debugStore.ts                   # Debug Zustand 스토어
├── components/
│   └── debug/
│       ├── DebugConsole.tsx            # 메인 컴포넌트
│       ├── DebugHeader.tsx             # 헤더
│       ├── DebugFilters.tsx            # 필터
│       ├── DebugStats.tsx              # 통계
│       ├── LogList.tsx                 # 로그 목록
│       ├── LogItem.tsx                 # 로그 항목
│       ├── LogDetailModal.tsx          # 상세 모달
│       ├── EmptyDebugState.tsx         # 빈 상태
│       └── DebugStatusIcon.tsx         # 상태 아이콘
├── utils/
│   ├── llmLogger.ts                    # LLM 로거
│   ├── modelPricing.ts                 # 모델 가격표
│   ├── costCalculator.ts               # 비용 계산
│   ├── sanitizeHeaders.ts              # 헤더 마스킹
│   ├── tokenExtractor.ts               # 토큰 추출
│   └── debugExport.ts                  # 내보내기
└── services/
    └── debugService.ts                 # Debug API 서비스
```

---

## 5. 위험 분석 및 대응

### 위험 1: API 호출 성능 영향
- **위험도**: Medium
- **영향**: 로깅으로 인한 API 호출 지연
- **대응**: 비동기 로깅, 배치 처리

### 위험 2: 메모리 사용량
- **위험도**: Medium
- **영향**: 많은 로그로 인한 메모리 증가
- **대응**: 1000개 제한, LRU 정책

### 위험 3: 민감 정보 노출
- **위험도**: High
- **영향**: API 키 등 민감 정보 유출
- **대응**: 헤더 마스킹, 개발 모드 제한

### 위험 4: 프로덕션 노출
- **위험도**: High
- **영향**: 프로덕션에서 Debug Console 노출
- **대응**: 환경 변수 체크, 빌드 시 제외

---

## 6. 테스트 전략

### 단위 테스트 (Unit Tests)
- Store 액션 및 상태 변경
- 비용 계산 로직
- 헤더 마스킹 유틸리티
- 토큰 추출 로직

### 통합 테스트 (Integration Tests)
- LLM Logger 호출 및 Store 업데이트
- 필터 적용 및 로그 표시
- 내보내기 기능

### 컴포넌트 테스트 (Component Tests)
- 로그 항목 렌더링
- 필터 변경
- 모달 열기/닫기
- 재시도 버튼 동작

---

## 7. 일정 추정

| Phase | 내용 | 예상 테스트 |
|-------|------|------------|
| Phase 1 | 기반 인프라 | 20-25 |
| Phase 2 | LLM Logger | 25-30 |
| Phase 3 | 기본 UI | 30-35 |
| Phase 4 | 로그 목록 및 상세 | 25-30 |
| Phase 5 | 재시도 기능 | 15-20 |
| Phase 6 | 내보내기 및 검색 | 20-25 |
| Phase 7 | 개발 모드 통합 | 10-15 |
| **Total** | **전체** | **145-180** |

---

## 8. 성공 기준

- [ ] 모든 테스트 통과 (145-180개)
- [ ] 테스트 커버리지 85% 이상
- [ ] 로깅 오버헤드 10ms 이내
- [ ] API 키 마스킹 100% 보장
- [ ] 프로덕션 빌드에서 컴포넌트 제외
- [ ] 재시도 기능 정상 동작
- [ ] 내보내기 기능 정상 동작
