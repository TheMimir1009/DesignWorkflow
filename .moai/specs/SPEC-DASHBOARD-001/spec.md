---
id: SPEC-DASHBOARD-001
version: "1.1.0"
status: "completed"
created: "2026-01-08"
updated: "2026-01-08"
author: "MoAI-ADK"
priority: "medium"
---

# SPEC-DASHBOARD-001: 대시보드 및 분석 기능 (Dashboard and Analytics)

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-08 | MoAI-ADK | 초기 SPEC 작성 |
| 1.1.0 | 2026-01-08 | MoAI-ADK | TDD 구현 완료 - status: completed |

---

## 1. 개요

### 1.1 기능 설명

프로젝트 통계, 태스크 진행률, 문서 생성 현황을 시각화하는 대시보드 기능입니다. 차트와 그래프를 통해 프로젝트 상태를 한눈에 파악할 수 있습니다.

### 1.2 사용자 스토리

> "기획자로서, 프로젝트의 전체 진행 상황과 각 단계별 태스크 현황을 한눈에 파악하고 싶습니다."

### 1.3 문제 해결

- 프로젝트 진행 상황 파악의 어려움 해결
- 태스크 상태 분포의 시각적 표현 제공
- 문서 생성 통계 및 트렌드 분석 지원
- 의사결정을 위한 데이터 기반 인사이트 제공

### 1.4 범위

**포함 범위**:
- 프로젝트 통계 요약 대시보드
- 태스크 상태별 분포 차트
- 시계열 진행률 추이 그래프
- 문서 생성 통계
- 차트 PNG/CSV 내보내기

**제외 범위**:
- 실시간 협업 대시보드
- 다중 프로젝트 비교 분석
- 예측 분석 및 AI 인사이트

---

## 2. 요구사항 (EARS 형식)

### 2.1 Ubiquitous Requirements (항상 적용)

**REQ-U-001**: 대시보드는 현재 선택된 프로젝트의 데이터만 표시해야 한다.

**REQ-U-002**: 모든 차트 데이터는 실시간으로 상태 변경을 반영해야 한다 (폴링 또는 상태 구독).

**REQ-U-003**: 대시보드 로딩 시간은 500ms 이내여야 한다 (100개 태스크 기준).

**REQ-U-004**: 차트는 반응형으로 화면 크기에 따라 적절히 조정되어야 한다.

### 2.2 Event-Driven Requirements (이벤트 기반)

**REQ-E-001**: 사용자가 대시보드 메뉴를 클릭하면, 시스템은 프로젝트 통계 대시보드 뷰를 표시해야 한다.

**REQ-E-002**: 사용자가 기간 필터를 변경하면, 시스템은:
- 선택된 기간(일간/주간/월간)에 맞게 시계열 데이터를 재계산
- 차트를 업데이트된 데이터로 다시 렌더링

**REQ-E-003**: 사용자가 "PNG 내보내기" 버튼을 클릭하면, 시스템은:
- 현재 표시된 차트를 PNG 이미지로 변환
- 다운로드 파일명: `{project_name}_dashboard_{date}.png`

**REQ-E-004**: 사용자가 "CSV 내보내기" 버튼을 클릭하면, 시스템은:
- 현재 통계 데이터를 CSV 형식으로 변환
- 다운로드 파일명: `{project_name}_stats_{date}.csv`

**REQ-E-005**: 사용자가 차트의 특정 영역을 클릭하면, 시스템은 해당 상태의 태스크 목록을 표시해야 한다.

### 2.3 Unwanted Behavior Requirements (방지해야 할 동작)

**REQ-W-001**: 시스템은 다른 프로젝트의 데이터를 현재 대시보드에 표시해서는 안 된다.

**REQ-W-002**: 시스템은 데이터 로딩 중 빈 차트를 표시해서는 안 된다 (스켈레톤 UI 사용).

**REQ-W-003**: 시스템은 아카이브된 태스크를 활성 태스크 통계에 포함해서는 안 된다.

**REQ-W-004**: 시스템은 차트 렌더링 중 UI 블로킹을 발생시켜서는 안 된다.

### 2.4 State-Driven Requirements (상태 기반)

**REQ-S-001**: 프로젝트에 태스크가 없을 때, 시스템은 "태스크 없음" 상태와 함께 태스크 생성 안내를 표시해야 한다.

**REQ-S-002**: 데이터 로딩 중일 때, 시스템은 스켈레톤 UI와 함께 로딩 인디케이터를 표시해야 한다.

**REQ-S-003**: 기간 필터가 "주간"으로 선택되어 있을 때, 시계열 차트는 최근 7일간의 데이터를 표시해야 한다.

**REQ-S-004**: 기간 필터가 "월간"으로 선택되어 있을 때, 시계열 차트는 최근 30일간의 데이터를 표시해야 한다.

### 2.5 Optional Features (선택적 기능)

**REQ-O-001**: 시스템은 대시보드 위젯의 순서를 드래그 앤 드롭으로 변경할 수 있는 기능을 제공할 수 있다.

**REQ-O-002**: 시스템은 특정 차트를 전체화면으로 확대하는 기능을 제공할 수 있다.

**REQ-O-003**: 시스템은 대시보드 레이아웃 설정을 저장하는 기능을 제공할 수 있다.

---

## 3. 기술 아키텍처

### 3.1 컴포넌트 구조

```
/src/components/dashboard/
├── Dashboard.tsx              # 대시보드 메인 컴포넌트
├── DashboardHeader.tsx        # 헤더 (기간 필터, 내보내기 버튼)
├── StatsSummary.tsx           # 통계 요약 카드들
├── TaskStatusChart.tsx        # 태스크 상태 파이/도넛 차트
├── ProgressTimeline.tsx       # 시계열 진행률 라인 차트
├── DocumentStats.tsx          # 문서 생성 통계
├── ChartSkeleton.tsx          # 차트 스켈레톤 UI
└── EmptyDashboard.tsx         # 빈 상태 컴포넌트

/src/store/
└── dashboardStore.ts          # Zustand 대시보드 상태 관리

/src/services/
└── dashboardService.ts        # 대시보드 API 서비스

/server/routes/
└── analytics.ts               # Express 분석 API 라우트
```

### 3.2 데이터 모델

```typescript
// 대시보드 요약 데이터
interface DashboardSummary {
  projectId: string;
  totalTasks: number;
  tasksByStatus: {
    featurelist: number;
    design: number;
    prd: number;
    prototype: number;
  };
  completionRate: number;      // 0-100%
  archivedCount: number;
  documentsGenerated: number;
  lastUpdated: string;
}

// 시계열 데이터 포인트
interface TimelineDataPoint {
  date: string;               // YYYY-MM-DD
  tasksCreated: number;
  tasksCompleted: number;
  documentsGenerated: number;
}

// 기간 필터 타입
type PeriodFilter = 'daily' | 'weekly' | 'monthly';

// 대시보드 상태
interface DashboardState {
  summary: DashboardSummary | null;
  timeline: TimelineDataPoint[];
  periodFilter: PeriodFilter;
  isLoading: boolean;
  error: string | null;
}
```

### 3.3 API 엔드포인트

| Method | Endpoint | 설명 | 요청 본문 | 응답 |
|--------|----------|------|-----------|------|
| GET | `/api/projects/:projectId/analytics/summary` | 통계 요약 | - | `DashboardSummary` |
| GET | `/api/projects/:projectId/analytics/timeline` | 시계열 데이터 | `?period=weekly` | `TimelineDataPoint[]` |
| GET | `/api/projects/:projectId/analytics/export` | 데이터 내보내기 | `?format=csv` | File Download |

### 3.4 차트 라이브러리

**선택**: Recharts 2.15.x

**선택 근거**:
- React 19 완벽 호환
- TypeScript 네이티브 지원
- 번들 크기: ~150KB (tree-shaking 지원)
- SVG 기반으로 PNG 내보내기 용이
- 활발한 유지보수 및 커뮤니티

### 3.5 의존성

**기존 모듈 의존성**:
- `src/store/projectStore.ts` - 현재 프로젝트 ID
- `src/store/taskStore.ts` - 태스크 상태 데이터
- `server/utils/taskStorage.ts` - 태스크 저장소 패턴 참조

**새로운 외부 라이브러리**:
- `recharts` ^2.15.0 - 차트 라이브러리
- `html-to-image` ^1.11.0 - PNG 내보내기 (선택)

---

## 4. UI/UX 명세

### 4.1 대시보드 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Dashboard                    [Daily▼] [PNG] [CSV]   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ 총 태스크 │ │ 진행중   │ │ 완료율   │ │ 문서생성  │        │
│ │   24    │ │   8     │ │  67%    │ │   42    │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │   Task Status       │ │   Progress Timeline         │ │
│ │   [Pie Chart]       │ │   [Line Chart]              │ │
│ │                     │ │                             │ │
│ │  ● Feature List 6   │ │   ─────────────────────     │ │
│ │  ● Design Doc 8     │ │   Created ── Completed      │ │
│ │  ● PRD 6            │ │                             │ │
│ │  ● Prototype 4      │ │                             │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4.2 통계 요약 카드

- **총 태스크**: 아이콘 + 숫자 (활성 태스크만)
- **진행중**: 현재 작업 중인 태스크 수
- **완료율**: 백분율 + 진행 바
- **문서생성**: 생성된 문서 총 개수

### 4.3 차트 인터랙션

**파이 차트**:
- 호버 시 툴팁 (상태명, 개수, 비율)
- 클릭 시 해당 상태 태스크 목록 필터링

**라인 차트**:
- 호버 시 데이터 포인트 툴팁
- 범례 클릭으로 라인 토글

### 4.4 반응형 브레이크포인트

- **Desktop (≥1024px)**: 2컬럼 차트 레이아웃
- **Tablet (768-1023px)**: 1컬럼 스택 레이아웃
- **Mobile (<768px)**: 1컬럼 + 컴팩트 차트

---

## 5. 비기능 요구사항

### 5.1 성능

- 대시보드 초기 로딩: 500ms 이내 (100개 태스크 기준)
- 차트 렌더링: 200ms 이내
- 기간 필터 변경 응답: 300ms 이내

### 5.2 접근성

- 차트 색상 대비 WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더용 대체 텍스트

### 5.3 데이터 정확성

- 통계 데이터는 항상 최신 상태 반영
- 아카이브된 태스크는 별도 집계

---

## 6. 관련 문서

- [PRD - Success Metrics](../../project/product.md)
- [프로젝트 구조](../../project/structure.md)
- [기술 스택](../../project/tech.md)
- [SPEC-TASK-001: 태스크 관리](../SPEC-TASK-001/spec.md)
- [SPEC-ARCHIVE-001: 아카이브 기능](../SPEC-ARCHIVE-001/spec.md)
