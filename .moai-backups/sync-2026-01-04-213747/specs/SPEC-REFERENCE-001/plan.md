# SPEC-REFERENCE-001: Implementation Plan

## Traceability

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-REFERENCE-001 |
| Document | Implementation Plan |
| Related SPEC | [spec.md](./spec.md) |
| Acceptance Criteria | [acceptance.md](./acceptance.md) |

---

## Implementation Overview

### Objective

SPEC-SYSTEM-001에서 구현된 시스템 문서 관리 기능을 확장하여, 사용자가 참조할 시스템을 쉽게 선택하고 관리할 수 있는 Reference System Selection 기능을 구현한다.

### Technical Approach

기존 systemStore.ts의 selectedDocumentIds를 활용하되, 참조 전용 상태 관리를 위한 별도의 referenceStore를 생성한다. 이는 시스템 문서 관리와 참조 선택의 관심사를 분리하여 유지보수성을 높인다.

---

## Architecture Design

### Component Hierarchy

```
App.tsx
  Header.tsx
    ReferenceTagBar.tsx (NEW)
      ReferenceTag.tsx (NEW)
      ReferenceSearchDropdown.tsx (NEW)

  MainContent.tsx
    SystemSidebar.tsx (MODIFY)
      SystemList.tsx (MODIFY)
        SystemCard.tsx (MODIFY)
          ReferenceCheckbox.tsx (NEW)
```

### State Flow

```
referenceStore (Zustand)
  selectedReferences: string[]
    ReferenceTagBar (헤더)
    SystemSidebar (사이드바 체크박스)

projectStore (기존)
  currentProject.defaultReferences: string[]
    referenceStore.applyDefaultReferences()
```

---

## Milestones

### Primary Goal: Core Reference Selection

**Tasks:**

1. **Reference Store 생성**
   - File: `src/store/referenceStore.ts`
   - Actions: setSelectedReferences, addReference, removeReference, toggleReference, clearReferences
   - Dependencies: None
   - Requirements: U1, U2

2. **ReferenceTagBar 컴포넌트 구현**
   - File: `src/components/reference/ReferenceTagBar.tsx`
   - Features: 선택된 참조 태그 표시, x 버튼으로 제거, [+ 추가] 버튼
   - Dependencies: referenceStore, systemStore
   - Requirements: E1, S2

3. **ReferenceSearchDropdown 컴포넌트 구현**
   - File: `src/components/reference/ReferenceSearchDropdown.tsx`
   - Features: 시스템 검색, 클릭으로 추가, 이미 선택된 항목 표시
   - Dependencies: referenceStore, systemStore
   - Requirements: E2, E3, S3

### Secondary Goal: Sidebar Integration

**Tasks:**

4. **SystemCard 체크박스 추가**
   - File: `src/components/system/SystemCard.tsx` (MODIFY)
   - Features: 체크박스 prop 추가, 선택 상태 시각화
   - Dependencies: referenceStore
   - Requirements: E4

5. **SystemSidebar 참조 모드 지원**
   - File: `src/components/system/SystemSidebar.tsx` (MODIFY)
   - Features: 체크박스 표시, 참조 상태 동기화
   - Dependencies: referenceStore
   - Requirements: U2, E4

6. **카테고리 접기/펼치기 기능**
   - File: `src/components/system/SystemList.tsx` (MODIFY)
   - Features: 카테고리 헤더 클릭으로 토글, 접힘 상태 유지
   - Dependencies: Local state
   - Requirements: E6

### Final Goal: Default References & API

**Tasks:**

7. **Project API 확장 - Backend**
   - File: `server/routes/projects.ts` (MODIFY)
   - Features: defaultReferences 필드 추가, CRUD 지원
   - Dependencies: None
   - Requirements: S1

8. **기본 참조 저장 UI**
   - File: `src/components/reference/ReferenceTagBar.tsx` (MODIFY)
   - Features: "기본 참조로 저장" 버튼, 저장 확인 피드백
   - Dependencies: projectStore, referenceStore
   - Requirements: E5

9. **프로젝트 전환 시 기본 참조 적용**
   - File: `src/store/referenceStore.ts` (MODIFY)
   - Features: applyDefaultReferences action, 프로젝트 변경 감지
   - Dependencies: projectStore
   - Requirements: U3, S1

### Optional Goal: UX Enhancements

**Tasks:**

10. **최근 선택 시스템 표시**
    - File: `src/components/reference/ReferenceSearchDropdown.tsx` (MODIFY)
    - Features: 최근 5개 시스템 상단 표시
    - Dependencies: localStorage
    - Requirements: O1

11. **키보드 단축키 지원**
    - File: `src/hooks/useKeyboardShortcuts.ts` (NEW)
    - Features: Ctrl+R로 드롭다운 열기
    - Dependencies: ReferenceTagBar
    - Requirements: O2

---

## Technical Details

### ReferenceStore Implementation

```typescript
// src/store/referenceStore.ts
interface ReferenceStore {
  selectedReferences: string[];
  setSelectedReferences: (ids: string[]) => void;
  addReference: (id: string) => void;
  removeReference: (id: string) => void;
  toggleReference: (id: string) => void;
  clearReferences: () => void;
  applyDefaultReferences: (ids: string[]) => void;
}

// Actions with duplicate prevention (N1)
addReference: (id) => {
  set(state => ({
    selectedReferences: state.selectedReferences.includes(id)
      ? state.selectedReferences
      : [...state.selectedReferences, id]
  }));
}
```

### ReferenceTagBar Props

```typescript
interface ReferenceTagBarProps {
  projectId: string | null;
  onSaveAsDefault: () => void;
}
```

### SystemCard Enhancement

```typescript
interface SystemCardProps {
  document: SystemDocument;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  // NEW props
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}
```

---

## Dependencies

### Task Dependency Graph

```
Task 1 (referenceStore)
   Task 2 (ReferenceTagBar)
     Task 8 (기본 참조 저장 UI)
   Task 3 (ReferenceSearchDropdown)
     Task 10 (최근 선택)
   Task 4 (SystemCard 체크박스)
     Task 5 (SystemSidebar 참조 모드)

Task 6 (카테고리 접기) - Independent

Task 7 (Backend API)
   Task 8 (기본 참조 저장 UI)
   Task 9 (프로젝트 전환 시 적용)

Task 11 (키보드 단축키) - Task 2 이후
```

### External Dependencies

| Dependency | Version | Usage |
|------------|---------|-------|
| zustand | ^4.4.0 | State management |
| tailwindcss | ^3.3.0 | Styling |
| @heroicons/react | ^2.0.0 | Icons (optional) |

---

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| systemStore와 referenceStore 상태 불일치 | High | Medium | 단방향 데이터 흐름 유지, referenceStore가 systemStore 구독 |
| 대량 문서 시 검색 성능 저하 | Medium | Low | 디바운스 적용 (300ms), 가상 스크롤 고려 |
| 기존 SystemSidebar 수정 시 회귀 버그 | Medium | Medium | 기존 테스트 케이스 유지, 새 기능 별도 테스트 |

---

## Testing Strategy

### Unit Tests

- referenceStore actions (add, remove, toggle, clear)
- ReferenceTagBar rendering with various states
- ReferenceSearchDropdown filtering logic

### Integration Tests

- ReferenceTagBar + referenceStore interaction
- SystemSidebar checkbox + referenceStore sync
- Project switch + default references application

### E2E Tests

- Full flow: 사이드바에서 선택 -> 헤더에 표시 -> 태그 제거
- 기본 참조 설정 후 새 태스크 생성 시 자동 적용

---

## Verification Checklist

| Task | Verification Method | Acceptance Criteria |
|------|---------------------|---------------------|
| Task 1 | Unit test | All store actions work correctly |
| Task 2 | Visual + Unit test | Tags display correctly, x button works |
| Task 3 | Visual + Unit test | Search filters correctly, selection works |
| Task 4 | Visual + Unit test | Checkbox state syncs with store |
| Task 5 | Integration test | Sidebar and header stay in sync |
| Task 7 | API test | defaultReferences saved/retrieved correctly |
| Task 9 | E2E test | Project switch applies defaults |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | manager-spec | Initial plan creation |
