# SPEC-REFERENCE-001: Reference System Selection

## Metadata

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-REFERENCE-001 |
| Title | Reference System Selection (E+A Pattern) |
| Created | 2026-01-04 |
| Status | Completed |
| Priority | High |
| Related SPECs | SPEC-SYSTEM-001 (System Document Management) |
| Lifecycle | spec-anchored |

---

## Overview

### Problem Statement

사용자가 새로운 기획 문서 작성 시 참조할 시스템 문서를 쉽게 선택하고 관리할 수 있어야 한다. 현재 SPEC-SYSTEM-001에서 구현된 시스템 문서 관리 기능을 확장하여 참조 선택 기능을 추가한다.

### Solution Summary

헤더에 선택된 참조 시스템 태그 바를 표시하고, 사이드바에서 체크박스로 선택할 수 있도록 한다. 프로젝트별 기본 참조 설정 기능을 통해 태스크 생성 시 자동으로 기본 참조가 적용된다.

### Scope

**In Scope:**
- ReferenceTagBar 컴포넌트 (헤더 참조 태그 표시)
- SystemSidebar 체크박스 선택 기능 확장
- Reference Store (전역 참조 선택 상태 관리)
- 기본 참조 설정 기능 (프로젝트별)
- 검색 드롭다운 (빠른 추가)

**Out of Scope:**
- AI 기반 관련 시스템 자동 추천 (SPEC-DISCOVERY-001 예정)
- 시스템 문서 생성/수정 (SPEC-SYSTEM-001에서 완료)

---

## Environment

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Component Framework |
| TypeScript | 5.x | Type Safety |
| Zustand | Latest | State Management |
| Tailwind CSS | 3.x | Styling |
| Express | 4.x | Backend API |

### Dependencies

**Existing Components (from SPEC-SYSTEM-001):**
- SystemSidebar.tsx - E+A pattern collapsible sidebar
- SystemList.tsx - Category-grouped document list
- SystemCard.tsx - Document card with preview
- SystemPreview.tsx - Markdown preview modal
- systemStore.ts - Zustand store for system documents

**Backend Infrastructure:**
- Express server (port 3001)
- JSON file-based storage
- Existing project API endpoints

---

## Assumptions

### Technical Assumptions

| ID | Assumption | Confidence | Risk if Wrong | Validation Method |
|----|------------|------------|---------------|-------------------|
| A1 | systemStore.ts에 selectedDocumentIds 필드가 이미 존재함 | High | Store 구조 변경 필요 | 코드 검토로 확인 완료 |
| A2 | Project API에 defaultReferences 필드 추가 가능 | High | 스키마 마이그레이션 필요 | API 설계 검토 |
| A3 | 100개 이상 문서에서도 검색 성능 유지 | Medium | 성능 최적화 필요 | 부하 테스트 필요 |

### Business Assumptions

| ID | Assumption | Confidence | Risk if Wrong | Validation Method |
|----|------------|------------|---------------|-------------------|
| B1 | 사용자는 평균 3-5개의 참조 시스템을 선택함 | Medium | UI 레이아웃 조정 필요 | 사용자 피드백 |
| B2 | 기본 참조 설정은 프로젝트당 한 번 설정됨 | High | 빈번한 변경 시 UX 개선 필요 | 사용 패턴 분석 |

---

## Requirements

### Ubiquitous Requirements (Always Active)

| ID | Requirement |
|----|-------------|
| U1 | 시스템은 **항상** 선택된 참조 시스템 목록을 전역 상태로 관리해야 한다 |
| U2 | 시스템은 **항상** 참조 선택 상태를 사이드바와 헤더 태그 바 간에 동기화해야 한다 |
| U3 | 시스템은 **항상** 프로젝트 전환 시 해당 프로젝트의 기본 참조를 자동 적용해야 한다 |

### Event-Driven Requirements (WHEN...THEN)

| ID | Requirement |
|----|-------------|
| E1 | **WHEN** 사용자가 헤더 태그의 x 버튼을 클릭하면 **THEN** 해당 시스템이 참조 목록에서 제거되어야 한다 |
| E2 | **WHEN** 사용자가 [+ 추가] 버튼을 클릭하면 **THEN** 검색 드롭다운이 표시되어야 한다 |
| E3 | **WHEN** 사용자가 검색 드롭다운에서 시스템을 선택하면 **THEN** 해당 시스템이 참조 목록에 추가되어야 한다 |
| E4 | **WHEN** 사용자가 사이드바의 체크박스를 클릭하면 **THEN** 해당 시스템의 참조 상태가 토글되어야 한다 |
| E5 | **WHEN** 사용자가 "기본 참조로 저장" 버튼을 클릭하면 **THEN** 현재 선택이 프로젝트 기본 참조로 저장되어야 한다 |
| E6 | **WHEN** 사용자가 카테고리 헤더를 클릭하면 **THEN** 해당 카테고리가 접히거나 펼쳐져야 한다 |
| E7 | **WHEN** 사용자가 시스템 문서 미리보기 버튼을 클릭하면 **THEN** 마크다운 미리보기 모달이 표시되어야 한다 |

### State-Driven Requirements (IF...THEN)

| ID | Requirement |
|----|-------------|
| S1 | **IF** 프로젝트에 기본 참조가 설정되어 있으면 **THEN** 새 태스크 생성 시 자동으로 적용해야 한다 |
| S2 | **IF** 참조 목록이 비어있으면 **THEN** 헤더 태그 바에 "참조 시스템 없음" 플레이스홀더를 표시해야 한다 |
| S3 | **IF** 검색어가 입력되면 **THEN** 드롭다운에 일치하는 시스템만 필터링하여 표시해야 한다 |
| S4 | **IF** 사이드바가 접혀있으면 **THEN** 헤더 태그 바만으로 참조 관리가 가능해야 한다 |

### Unwanted Behavior Requirements (Prohibitions)

| ID | Requirement |
|----|-------------|
| N1 | 시스템은 동일한 시스템을 참조 목록에 중복 추가**하지 않아야 한다** |
| N2 | 시스템은 프로젝트 전환 시 이전 프로젝트의 참조 선택을 유지**하지 않아야 한다** |
| N3 | 시스템은 삭제된 시스템 문서를 참조 목록에 표시**하지 않아야 한다** |

### Optional Requirements (WHERE possible)

| ID | Requirement |
|----|-------------|
| O1 | **가능하면** 최근 선택한 참조 시스템을 드롭다운 상단에 표시 제공 |
| O2 | **가능하면** 키보드 단축키(Ctrl+R)로 참조 추가 드롭다운 열기 제공 |

---

## Specifications

### Component Architecture

```
src/components/reference/
  ReferenceTagBar.tsx       # 헤더 참조 태그 바 (NEW)
  ReferenceSearchDropdown.tsx # 검색 드롭다운 (NEW)
  ReferenceCheckbox.tsx     # 사이드바용 체크박스 (NEW)

src/store/
  referenceStore.ts         # 참조 선택 상태 관리 (NEW)
  systemStore.ts            # 기존 - selectedDocumentIds 활용

src/components/system/
  SystemSidebar.tsx         # 기존 - 체크박스 추가
  SystemCard.tsx            # 기존 - 체크박스 prop 추가
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | /api/projects/:projectId | 프로젝트 업데이트 (defaultReferences 포함) |
| GET | /api/projects/:projectId | 프로젝트 조회 (defaultReferences 포함) |

### Data Schema

**Project Schema Extension:**
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  // ... existing fields
  defaultReferences: string[]; // NEW: 기본 참조 시스템 ID 배열
}
```

**Reference Store Schema:**
```typescript
interface ReferenceStore {
  selectedReferences: string[];
  setSelectedReferences: (ids: string[]) => void;
  addReference: (id: string) => void;
  removeReference: (id: string) => void;
  toggleReference: (id: string) => void;
  clearReferences: () => void;
  applyDefaultReferences: (ids: string[]) => void;
}
```

---

## Constraints

### Technical Constraints

| ID | Constraint | Rationale |
|----|------------|-----------|
| C1 | 참조 선택 상태는 브라우저 새로고침 시 초기화됨 | 세션 기반 상태 관리 |
| C2 | 최대 20개까지 참조 시스템 선택 가능 | UI 레이아웃 및 성능 제약 |
| C3 | 검색 드롭다운은 최대 10개 결과 표시 | UX 최적화 |

### Performance Constraints

| ID | Constraint | Target |
|----|------------|--------|
| P1 | 참조 토글 응답 시간 | < 100ms |
| P2 | 검색 필터링 응답 시간 | < 200ms |
| P3 | 기본 참조 저장 API 응답 | < 500ms |

---

## Traceability

| Requirement ID | PRD Section | Test Case |
|----------------|-------------|-----------|
| E1 | 3. Reference System Selection - 태그 x 클릭 | TC-REF-001 |
| E2 | 3. Reference System Selection - [+ 추가] 클릭 | TC-REF-002 |
| E4 | 3. Reference System Selection - 체크박스 선택 | TC-REF-003 |
| E5 | 3. Reference System Selection - 기본 참조 설정 | TC-REF-004 |
| S1 | 3. Reference System Selection - 기본 참조 자동 적용 | TC-REF-005 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | manager-spec | Initial SPEC creation |
