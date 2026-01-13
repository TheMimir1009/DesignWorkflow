# SPEC-DASHBOARD-001: 구현 계획 (Implementation Plan)

## 개요

이 문서는 대시보드 및 분석 기능(SPEC-DASHBOARD-001)의 구현 계획을 정의합니다.

---

## 1. 구현 단계

### Phase 1: 기반 인프라 (Foundation)

**목표**: 대시보드 기본 구조 및 데이터 모델 구축

**태스크**:
1. TypeScript 타입 정의 추가 (`src/types/index.ts`)
   - DashboardSummary, TimelineDataPoint, PeriodFilter
2. Zustand 스토어 생성 (`src/store/dashboardStore.ts`)
   - 상태 관리, 액션 정의
3. API 서비스 생성 (`src/services/dashboardService.ts`)
   - fetchSummary, fetchTimeline, exportData
4. Express 라우트 생성 (`server/routes/analytics.ts`)
   - GET /summary, GET /timeline, GET /export

**예상 테스트**: 25-30개

### Phase 2: 통계 계산 로직 (Analytics Logic)

**목표**: 백엔드 통계 계산 및 집계 로직 구현

**태스크**:
1. Analytics Storage 유틸리티 (`server/utils/analyticsStorage.ts`)
   - calculateSummary: 태스크 통계 집계
   - calculateTimeline: 시계열 데이터 생성
   - aggregateByPeriod: 기간별 집계
2. 태스크 상태 변경 이벤트 추적
3. 문서 생성 통계 집계

**예상 테스트**: 20-25개

### Phase 3: 차트 컴포넌트 (Chart Components)

**목표**: Recharts 기반 시각화 컴포넌트 구현

**태스크**:
1. Recharts 라이브러리 설치 및 설정
2. TaskStatusChart 컴포넌트 (파이/도넛 차트)
3. ProgressTimeline 컴포넌트 (라인 차트)
4. StatsSummary 컴포넌트 (통계 카드)
5. ChartSkeleton 컴포넌트 (로딩 UI)
6. EmptyDashboard 컴포넌트 (빈 상태)

**예상 테스트**: 30-35개

### Phase 4: 대시보드 통합 (Dashboard Integration)

**목표**: 전체 대시보드 페이지 통합 및 내보내기 기능

**태스크**:
1. Dashboard 메인 컴포넌트 조합
2. DashboardHeader 컴포넌트 (필터, 내보내기)
3. 기간 필터 기능 구현
4. PNG 내보내기 기능 (html-to-image)
5. CSV 내보내기 기능
6. 라우팅 및 네비게이션 연결

**예상 테스트**: 25-30개

---

## 2. 태스크 분해

### TASK-001: 타입 정의 추가
- **파일**: `src/types/index.ts`
- **내용**: DashboardSummary, TimelineDataPoint, PeriodFilter, DashboardState
- **의존성**: 없음
- **우선순위**: High

### TASK-002: Dashboard Store 구현
- **파일**: `src/store/dashboardStore.ts`
- **내용**: Zustand 스토어, 상태 관리, 액션 정의
- **의존성**: TASK-001
- **우선순위**: High

### TASK-003: Dashboard Service 구현
- **파일**: `src/services/dashboardService.ts`
- **내용**: API 호출 함수 (fetchSummary, fetchTimeline, exportData)
- **의존성**: TASK-001
- **우선순위**: High

### TASK-004: Analytics API 라우트 구현
- **파일**: `server/routes/analytics.ts`
- **내용**: Express 라우트 (summary, timeline, export)
- **의존성**: 없음
- **우선순위**: High

### TASK-005: Analytics Storage 유틸리티 구현
- **파일**: `server/utils/analyticsStorage.ts`
- **내용**: 통계 계산 및 집계 로직
- **의존성**: TASK-004
- **우선순위**: High

### TASK-006: TaskStatusChart 컴포넌트 구현
- **파일**: `src/components/dashboard/TaskStatusChart.tsx`
- **내용**: Recharts PieChart 기반 상태 분포 차트
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-007: ProgressTimeline 컴포넌트 구현
- **파일**: `src/components/dashboard/ProgressTimeline.tsx`
- **내용**: Recharts LineChart 기반 시계열 차트
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-008: StatsSummary 컴포넌트 구현
- **파일**: `src/components/dashboard/StatsSummary.tsx`
- **내용**: 통계 요약 카드 4개
- **의존성**: TASK-002
- **우선순위**: Medium

### TASK-009: Dashboard 메인 컴포넌트 구현
- **파일**: `src/components/dashboard/Dashboard.tsx`
- **내용**: 전체 대시보드 레이아웃 및 통합
- **의존성**: TASK-006, TASK-007, TASK-008
- **우선순위**: Medium

### TASK-010: 내보내기 기능 구현
- **파일**: `src/components/dashboard/DashboardHeader.tsx`
- **내용**: PNG/CSV 내보내기 버튼 및 기능
- **의존성**: TASK-009
- **우선순위**: Low

---

## 3. 기술 스택

### 새로 추가되는 의존성

```json
{
  "dependencies": {
    "recharts": "^2.15.0"
  },
  "devDependencies": {
    "@types/recharts": "^2.0.0"
  }
}
```

### 선택적 의존성

```json
{
  "dependencies": {
    "html-to-image": "^1.11.0"  // PNG 내보내기용
  }
}
```

---

## 4. 위험 분석 및 대응

### 위험 1: Recharts 번들 크기
- **위험도**: Medium
- **영향**: 초기 로딩 시간 증가
- **대응**: Tree-shaking 적용, 필요한 컴포넌트만 import

### 위험 2: 대용량 데이터 성능
- **위험도**: Low
- **영향**: 많은 태스크 시 차트 렌더링 지연
- **대응**: 데이터 샘플링, 가상화 적용 검토

### 위험 3: 시계열 데이터 저장
- **위험도**: Medium
- **영향**: 파일 시스템 기반 저장의 성능 한계
- **대응**: 집계 데이터 캐싱, 증분 업데이트

---

## 5. 테스트 전략

### 단위 테스트 (Unit Tests)
- Store 액션 및 상태 변경
- Service API 호출 함수
- 차트 컴포넌트 렌더링
- 통계 계산 로직

### 통합 테스트 (Integration Tests)
- API 엔드포인트 요청/응답
- Store-Service 연동
- 차트 데이터 바인딩

### 컴포넌트 테스트 (Component Tests)
- 차트 인터랙션 (호버, 클릭)
- 기간 필터 변경
- 내보내기 기능

---

## 6. 일정 추정

| Phase | 예상 작업량 | 테스트 수 |
|-------|------------|----------|
| Phase 1 | 기반 인프라 | 25-30 |
| Phase 2 | 분석 로직 | 20-25 |
| Phase 3 | 차트 컴포넌트 | 30-35 |
| Phase 4 | 통합 및 내보내기 | 25-30 |
| **Total** | **전체** | **100-120** |

---

## 7. 성공 기준

- [ ] 모든 테스트 통과 (100-120개)
- [ ] 테스트 커버리지 85% 이상
- [ ] 대시보드 로딩 500ms 이내
- [ ] 차트 렌더링 200ms 이내
- [ ] PNG/CSV 내보내기 정상 동작
- [ ] 반응형 레이아웃 정상 동작
