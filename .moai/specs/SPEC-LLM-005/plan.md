# SPEC-LLM-005: 구현 계획

## Overview

본 SPEC은 칸반 컬럼별 LLM 설정 기능 개선을 위한 구현 계획을 정의합니다.

---

## 1. 마일스톤 (우선순위 기반)

### Priority High (핵심 기능)

1. **ColumnModelDisplay 컴포넌트 구현**
   - 모델 정보 표시 UI
   - 프로바이더 아이콘 렌더링
   - 모델명 축약 표시
   - 로딩/에러 상태 처리

2. **KanbanColumn 헤더 수정**
   - ColumnModelDisplay 통합
   - 레이아웃 조정
   - LLM 비활성화 컬럼 필터링

3. **상태 관리 연동**
   - llmSettingsStore 연결
   - 설정 변경 감지
   - 자동 갱신 로직

### Priority Medium (UX 개선)

4. **툴팁 구현**
   - 전체 모델명 표시
   - 프로바이더 정보
   - 호버 효과

5. **시각적 구분 강화**
   - 프로바이더별 색상 적용
   - 기본값 라벨 스타일링
   - 미설정 상태 표시

### Priority Low (선택 사항)

6. **고급 기능**
   - 토큰 사용량 추정치 표시
   - 모델 성능 지표
   - 빠른 설정 전환

---

## 2. 기술적 접근 방식

### 2.1 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    KanbanBoard                      │
│                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   Column   │  │   Column   │  │   Column   │   │
│  │  (Design)  │  │   (PRD)    │  │(Prototype) │   │
│  │            │  │            │  │            │   │
│  │ ┌────────┐ │  │ ┌────────┐ │  │ ┌────────┐ │   │
│  │ │ Title  │ │  │ │ Title  │ │  │ │ Title  │ │   │
│  │ ├────────┤ │  │ ├────────┤ │  │ ├────────┤ │   │
│  │ │Model   │ │  │ │Model   │ │  │ │Model   │ │   │
│  │ │Display │ │  │ │Display │ │  │ │Display │ │   │
│  │ └────────┘ │  │ └────────┘ │  │ └────────┘ │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│         │                │                │          │
│         └────────────────┴────────────────┘          │
│                       │                             │
│                       ▼                             │
│              ┌───────────────┐                      │
│              │ llmSettings   │                      │
│              │    Store      │                      │
│              └───────────────┘                      │
└─────────────────────────────────────────────────────┘
```

### 2.2 데이터 흐름

```
1. 컴포넌트 마운트
   └─> fetchSettings(projectId)

2. 설정 로드 완료
   └─> columnId -> stageKey 매핑
   └─> taskStageConfig[stageKey] 조회

3. 모델 설정 결정
   ├─> 컬럼 설정 존재? → columnConfig 사용
   └─> 없음 → defaultModel 사용

4. UI 렌더링
   └─> 프로바이더 아이콘 + 모델명 표시

5. 클릭 이벤트
   └─> ColumnLLMSettingsModal 오픈

6. 설정 변경 감지
   └─> 자동 갱신
```

### 2.3 컴포넌트 구조

**ColumnModelDisplay.tsx**:
```typescript
interface ColumnModelDisplayProps {
  columnId: string;
  projectId: string;
  onOpenSettings: () => void;
}

export function ColumnModelDisplay({
  columnId,
  projectId,
  onOpenSettings,
}: ColumnModelDisplayProps) {
  // 1. 컬럼 -> 스테이지 매핑
  const stageKey = getTaskStageFromColumnId(columnId);

  // 2. 설정 조회
  const { settings } = useLLMSettingsStore();

  // 3. 유효 모델 결정
  const effectiveModel = useMemo(() => {
    const columnConfig = settings?.taskStageConfig[stageKey];
    return columnConfig || settings?.taskStageConfig.defaultModel;
  }, [settings, stageKey]);

  // 4. 렌더링
  return <ModelBadge config={effectiveModel} onClick={onOpenSettings} />;
}
```

---

## 3. 태스크 분해

### Task 1: ColumnModelDisplay 컴포넌트 생성

**파일**: `src/components/llm/ColumnModelDisplay.tsx`

**하위 태스크**:
1.1. 기본 컴포넌트 구조 생성
1.2. 컬럼 ID -> 스테이지 키 매핑 함수 구현
1.3. llmSettingsStore 연결
1.4. 모델 설정 결정 로직 구현
1.5. ModelBadge 서브 컴포넌트 구현
1.6. 로딩 상태 UI 구현
1.7. 에러 상태 UI 구현

### Task 2: KanbanColumn 헤더 수정

**파일**: `src/components/kanban/KanbanColumn.tsx`

**하위 태스크**:
2.1. ColumnModelDisplay import 추가
2.2. 헤더 레이아웃 재구성 (flexbox)
2.3. LLM 활성화 컬럼 조건부 렌더링
2.4. projectId prop 전달
2.5. 모달 오픈 핸들러 연결

### Task 3: KanbanBoard props 전달

**파일**: `src/components/kanban/KanbanBoard.tsx`

**하위 태스크**:
3.1. currentProjectId prop 확인
3.2. KanbanColumn으로 projectId 전달

### Task 4: 테스트 작성

**파일**: `src/components/llm/__tests__/ColumnModelDisplay.test.tsx`

**하위 태스크**:
4.1. 컬럼별 설정 표시 테스트
4.2. 기본값 표시 테스트
4.3. 로딩 상태 테스트
4.4. 클릭 이벤트 테스트
4.5. Feature List 컬럼 필터링 테스트

### Task 5: 스타일링 및 UX 개선

**하위 태스크**:
5.1. 프로바이더별 색상 적용
5.2. 툴팁 구현
5.3. 호버 효과 추가
5.4. 반응형 레이아웃 조정

---

## 4. 위험 요소 및 대응 계획

### Risk 1: 헤더 공간 부족

**확률**: 중
**영향**: 중

**대응**:
- 모델명을 축약 표시 (예: "claude-3.5-sonnet" -> "Claude 3.5")
- 프로바이더 아이콘만 표시하고 툴팁으로 전체명 제공
- 카운트 배지 위치 조정

### Risk 2: 설정 로딩 지연

**확률**: 낮
**영향**: 중

**대응**:
- 캐싱 활용 (llmSettingsStore)
- 스켈레톤 UI 대신 작은 로딩 스피너 사용
- 백그라운드 갱신

### Risk 3: 드래그 앤 드롭 인터페이스 방해

**확률**: 낮
**영향**: 높

**대응**:
- 클릭 가능 영역 최소화
- 드래그 영역과 클릭 영역 분리
- 이벤트 전파 방지 처리

### Risk 4: 불필요한 재렌더링

**확률**: 중
**영향**: 중

**대응**:
- React.memo로 컴포넌트 최적화
- 설정 변경 시에만 갱신
- useMemo로 계산 캐싱

---

## 5. 구현 순서

```
Phase 1: 기본 컴포넌트 구현
├── Task 1.1-1.3: ColumnModelDisplay 기본 구조
└── Task 4.1-4.2: 기본 테스트

Phase 2: KanbanColumn 통합
├── Task 2: 헤더 수정
├── Task 3: props 전달
└── Task 4.3-4.4: 통합 테스트

Phase 3: UI/UX 개선
├── Task 1.4-1.7: 상태 UI 완성
├── Task 5: 스타일링
└── Task 4.5: 전체 테스트

Phase 4: 검증 및 최적화
├── 성능 테스트
├── 접근성 검증
└── 문서화
```

---

## 6. 의존성

### 선결 조건
- SPEC-LLM-001 완료 (Multi-LLM Provider Support)
- SPEC-LLM-004 완료 (LM Studio Dynamic Model Selection UI)

### 병행 가능 작업
- 테스트 작성 (컴포넌트 구현과 병행)
- 스타일링 (기능 구현과 독립)

---

## 7. Definition of Done

- [ ] ColumnModelDisplay 컴포넌트 구현 완료
- [ ] KanbanColumn 헤더 통합 완료
- [ ] 컬럼별 설정/기본값 시각적 구분
- [ ] 설정 변경 시 즉시 반영
- [ ] Feature List 컬럼 필터링
- [ ] 테스트 커버리지 80% 이상
- [ ] ESLint 경고 없음
- [ ] TypeScript 타입 오류 없음
- [ ] 드래그 앤 드롭 기능 정상 작동
- [ ] 접근성 가이드라인 준수
