---
spec_id: SPEC-LLM-005
title: 칸반 컬럼별 LLM 설정 기능 개선
category: llm
priority: medium
status: completed
created_at: 2026-01-13
updated_at: 2026-01-13
author: alfred
version: 1.1.0
related_specs:
  - SPEC-LLM-001: Multi-LLM Provider Support
  - SPEC-LLM-004: LM Studio Dynamic Model Selection UI
---

# HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-13 | alfred | 초기 SPEC 작성 |
| 1.1.0 | 2026-01-13 | alfred | 구현 완료 - ColumnModelDisplay 컴포넌트, ModelBadge, useColumnModelConfig Hook, providerIcons 추가, 19개 테스트 통과 |

---

# SPEC-LLM-005: 칸반 컬럼별 LLM 설정 기능 개선

## Overview

**Description**: 칸반 보드 컬럼 헤더에 현재 설정된 LLM 모델 정보를 표시하고, 사용자 경험을 개선하는 UI 기능 구현

**Purpose**: 현재 ColumnSettingsButton과 ColumnLLMSettingsModal이 구현되어 있지만, 컬럼 헤더에 어떤 LLM이 설정되어 있는지 시각적으로 표시되지 않아 사용자가 현재 설정을 한눈에 파악하기 어려운 문제를 해결

**Scope**: 프론트엔드 컴포넌트 개선 (KanbanColumn, ColumnSettingsButton), 모델 정보 표시 UI

## Background

### Current State

**이미 구현된 기능**:
- `ColumnLLMSettingsModal.tsx` - 컬럼별 LLM 설정 모달 (완료)
- `ColumnSettingsButton.tsx` - 컬럼 설정 버튼 (완료)
- `TaskStageConfig` 타입 - designDoc, prd, prototype 별 설정 지원

**현재 문제점**:
1. 컬럼 헤더에 어떤 LLM이 설정되어 있는지 표시되지 않음
2. 사용자가 설정을 확인하려면 버튼을 클릭해서 모달을 열어야 함
3. 프로젝트 기본값 사용 중인지, 컬럼별 설정 사용 중인지 구별 어려움

### Column-Stage Mapping

| 컬럼 ID | Task Stage | LLM 지원 |
|---------|------------|----------|
| designdoc | designDoc | O |
| prd | prd | O |
| prototype | prototype | O |
| featurelist | - | X (LLM 미사용) |

### Model Priority

1. **컬럼별 설정**: `taskStageConfig[stage]`가 설정된 경우
2. **프로젝트 기본값**: `taskStageConfig.defaultModel` 사용

## Requirements (EARS Format)

### Ubiquitous Requirements (항상 적용)

**REQ-COLLLM-001**: 시스템은 LLM이 활성화된 컬럼(Design Doc, PRD, Prototype) 헤더에 현재 설정된 모델 정보를 표시해야 한다.

**REQ-COLLLM-002**: 시스템은 Feature List 컬럼에는 LLM 정보를 표시하지 않아야 한다.

**REQ-COLLLM-003**: 시스템은 컬럼별 설정과 프로젝트 기본값을 시각적으로 구분해야 한다.

### Event-Driven Requirements (이벤트 발생 시 수행)

**REQ-COLLLM-004**: WHEN 사용자가 컬럼 설정을 변경하면, 시스템은 컬럼 헤더의 모델 정보를 즉시 갱신해야 한다.

**REQ-COLLLM-005**: WHEN 사용자가 컬럼 설정을 초기화(프로젝트 기본값 사용)하면, 시스템은 "기본값" 표시를 활성화해야 한다.

**REQ-COLLLM-006**: WHEN 프로젝트 기본 LLM 설정이 변경되면, 시스템은 기본값을 사용하는 컬럼의 표시를 갱신해야 한다.

**REQ-COLLLM-007**: WHEN 사용자가 모델 표시 영역을 클릭하면, 시스템은 ColumnLLMSettingsModal을 열어야 한다.

### State-Driven Requirements (상태에 따른 수행)

**REQ-COLLLM-008**: IF 컬럼별 설정이 존재하면, 시스템은 해당 모델의 프로바이더 아이콘과 모델 이름을 표시해야 한다.

**REQ-COLLLM-009**: IF 컬럼별 설정이 없고 프로젝트 기본값을 사용하면, 시스템은 "기본값" 라벨을 표시해야 한다.

**REQ-COLLLM-010**: IF LLM 설정 로딩 중이면, 시스템은 로딩 스피너를 표시해야 한다.

**REQ-COLLLM-011**: IF 설정 정보를 가져오지 못하면, 시스템은 "미설정" 상태를 표시해야 한다.

### Unwanted Requirements (금지 사항)

**REQ-COLLLM-012**: 모델 정보 표시는 컬럼 헤더의 공간을 과도하게 차지해서는 안 된다.

**REQ-COLLLM-013**: 모델 정보 갱신은 컬럼 드래그 앤 드롭 동작에 영향을 주어서는 안 된다.

**REQ-COLLLM-014**: 모델 표시 UI는 카드 영역을 가리거나 겹쳐서는 안 된다.

### Optional Requirements (선택 사항)

**REQ-COLLLM-015**: WHERE 가능하면, 시스템은 모델 정보에 툴팁을 제공하여 전체 모델 이름을 표시해야 한다.

**REQ-COLLLM-016**: WHERE 가능하면, 시스템은 프로바이더별 고유 색상을 사용하여 시각적 구분을 제공해야 한다.

**REQ-COLLLM-017**: WHERE 가능하면, 시스템은 현재 모델의 토큰 사용량 추정치를 표시해야 한다.

## Technical Specification

### Architecture

현재 아키텍처:
```
KanbanColumn
├── Column Header (제목만 표시)
└── Tasks List
```

개선 후 아키텍처:
```
KanbanColumn
├── Column Header
│   ├── Title (기존)
│   ├── Task Count (기존)
│   └── LLM Model Display (NEW)
│       ├── Provider Icon
│       ├── Model Name (or "기본값")
│       └── Click to open modal
└── Tasks List
```

### Component Design

#### 1. ColumnModelDisplay Component (NEW)

**File**: `src/components/llm/ColumnModelDisplay.tsx`

**Props**:
```typescript
interface ColumnModelDisplayProps {
  columnId: string;
  projectId: string;
  onOpenSettings: () => void;
}
```

**상태**:
```typescript
const [modelConfig, setModelConfig] = useState<LLMModelConfig | null>(null);
const [isDefault, setIsDefault] = useState(false);
const [isLoading, setIsLoading] = useState(true);
```

**UI 구성**:
- Loading: 작은 스피너
- Default: "기본값" 라벨 + 아이콘
- Custom: 프로바이더 아이콘 + 모델 이름 (축약 표시)
- Not Configured: "미설정" 라벨
- Clickable: 전체 영역 클릭 시 모달 오픈

#### 2. KanbanColumn Modification

**File**: `src/components/kanban/KanbanColumn.tsx`

**추가할 import**:
```typescript
import { ColumnModelDisplay } from '../llm/ColumnModelDisplay';
```

**헤더 수정**:
```tsx
<div className="flex items-center justify-between p-3 border-b border-gray-200">
  <div className="flex items-center gap-2">
    <h3 className="font-semibold text-gray-700">{column.title}</h3>
    {/* NEW: Model display for LLM-enabled columns */}
    {(column.id === 'designdoc' || column.id === 'prd' || column.id === 'prototype') && (
      <ColumnModelDisplay
        columnId={column.id}
        projectId={currentProjectId}
        onOpenSettings={() => openLLMSettings(column.id, column.title)}
      />
    )}
  </div>
  <span className="flex items-center justify-center w-6 h-6 text-sm font-medium text-gray-600 bg-gray-200 rounded-full">
    {tasks.length}
  </span>
</div>
```

#### 3. ColumnSettingsButton Refactoring

**File**: `src/components/llm/ColumnSettingsButton.tsx`

**변경 사항**:
- 기존 설정 버튼 유지 (헤더 우측 톱니바퀴 아이콘)
- ColumnModelDisplay와 함께 사용 가능하도록 위치 조정

### Visual Design

**크기 가이드라인**:
- 모델 표시 영역: 최대 120px 너비
- 폰트 크기: 11px (작은 텍스트)
- 아이콘 크기: 14px

**색상 가이드라인**:
| 프로바이더 | 색상 |
|-----------|------|
| Claude Code | #D97706 (amber) |
| OpenAI | #10B981 (emerald) |
| Gemini | #3B82F6 (blue) |
| LM Studio | #8B5CF6 (violet) |
| 기본값 | #6B7280 (gray) |

**표시 형식**:
- **컬럼별 설정**: `[아이콘] 모델명` (예: `Claude 3.5`)
- **프로젝트 기본값**: `[아이콘] 기본값`
- **미설정**: `미설정` (회색 텍스트)

### File Modifications

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/components/llm/ColumnModelDisplay.tsx` | 생성 | 모델 정보 표시 컴포넌트 |
| `src/components/kanban/KanbanColumn.tsx` | 수정 | 헤더에 모델 표시 추가 |
| `src/components/llm/ColumnSettingsButton.tsx` | 수정 | 레이아웃 조정 |
| `src/components/llm/__tests__/ColumnModelDisplay.test.tsx` | 생성 | 컴포넌트 테스트 |

### API Usage

**기존 Store 사용**:
```typescript
// src/stores/llmSettingsStore.ts
const { settings, fetchSettings } = useLLMSettingsStore();

// 컬럼별 설정 조회
const stageKey = getTaskStageFromColumnId(columnId); // 'designDoc' | 'prd' | 'prototype'
const columnConfig = settings?.taskStageConfig[stageKey];

// 우선순위: 컬럼 설정 > 프로젝트 기본값
const effectiveConfig = columnConfig || settings?.taskStageConfig.defaultModel;
```

## Security Considerations

1. **API 키 보호**: 모델 정보 표시 시 API 키가 노출되지 않음
2. **접근 제어**: LLM 설정은 프로젝트 멤버만 확인/변경 가능

## Performance Considerations

1. **캐싱**: LLM 설정 정보는 세션 동안 캐싱
2. **최적화**: 컬럼 헤더 렌더링 최적화 (React.memo 활용)
3. **요청 최소화**: 설정 변경 시에만 재조회

## Dependencies

### Internal
- `src/stores/llmSettingsStore.ts` - LLM 설정 상태
- `src/types/llm.ts` - LLM 타입 정의
- `src/components/llm/ColumnLLMSettingsModal.tsx` - 설정 모달

### External
- React 19.2.x - UI 라이브러리
- Zustand - 상태 관리

### Related SPECs
- **SPEC-LLM-001**: Multi-LLM Provider Support (기본 설정 구조)
- **SPEC-LLM-004**: LM Studio Dynamic Model Selection UI (동적 모델 로딩)

## Success Criteria

1. 컬럼 헤더에 현재 LLM 모델 정보가 표시됨
2. 컬럼별 설정과 프로젝트 기본값이 시각적으로 구별됨
3. 모델 정보 클릭 시 설정 모달이 열림
4. 설정 변경 시 즉시 반영됨
5. 기존 기능(드래그 앤 드롭)에 영향 없음
6. Feature List 컬럼에는 모델 정보가 표시되지 않음

## Traceability

| REQ ID | Component | Test Scenario |
|--------|-----------|---------------|
| REQ-COLLLM-001 | ColumnModelDisplay | TC-COLLLM-001 |
| REQ-COLLLM-002 | ColumnModelDisplay | TC-COLLLM-002 |
| REQ-COLLLM-003 | ColumnModelDisplay | TC-COLLLM-003 |
| REQ-COLLLM-004 | ColumnModelDisplay | TC-COLLLM-004 |
| REQ-COLLLM-005 | ColumnModelDisplay | TC-COLLLM-005 |
| REQ-COLLLM-006 | ColumnModelDisplay | TC-COLLLM-006 |
| REQ-COLLLM-007 | ColumnModelDisplay | TC-COLLLM-007 |
| REQ-COLLLM-008 | ColumnModelDisplay | TC-COLLLM-008 |
| REQ-COLLLM-009 | ColumnModelDisplay | TC-COLLLM-009 |
| REQ-COLLLM-010 | ColumnModelDisplay | TC-COLLLM-010 |
| REQ-COLLLM-011 | ColumnModelDisplay | TC-COLLLM-011 |
| REQ-COLLLM-012 | KanbanColumn | TC-COLLLM-012 |
| REQ-COLLLM-013 | KanbanColumn | TC-COLLLM-013 |
| REQ-COLLLM-014 | KanbanColumn | TC-COLLLM-014 |
