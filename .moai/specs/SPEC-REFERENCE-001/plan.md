# SPEC-REFERENCE-001: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-REFERENCE-001 |
| 문서 유형 | Implementation Plan |
| 생성일 | 2026-01-02 |
| 관련 문서 | spec.md, acceptance.md |

---

## 1. 구현 개요

### 1.1 목표

헤더 태그바와 접이식 사이드바를 통해 시스템 문서 참조를 선택하는 E+A 패턴 UI를 구현합니다. 이 기능은 기획자가 새로운 기획 문서 작성 시 기존 시스템 문서를 쉽게 참조할 수 있도록 지원합니다.

### 1.2 주요 산출물

- ReferenceTagBar 컴포넌트 (헤더 태그 표시)
- ReferenceSearchDropdown 컴포넌트 (검색 드롭다운)
- SystemSidebar 컴포넌트 (접이식 사이드바)
- SystemPreview 컴포넌트 (미리보기 모달)
- referenceStore (Zustand 상태 관리)
- 확장된 systemStore (검색/필터 기능)
- 기본 참조 시스템 API 엔드포인트

---

## 2. 마일스톤 (우선순위 기반)

### 마일스톤 1: 핵심 목표 (Primary Goals)

**목표**: 기본적인 참조 시스템 선택 기능 구현

**태스크**:

1. **referenceStore 생성**
   - Zustand 스토어 설정
   - selectedReferences 상태 관리
   - addReference, removeReference, clearReferences 액션
   - devtools 미들웨어 적용

2. **ReferenceTagBar 컴포넌트**
   - 선택된 참조 시스템 태그 표시
   - x 버튼 클릭 시 제거 기능
   - [+ Add] 버튼 UI
   - 5개 초과 시 +N more 축약

3. **Header.tsx 확장**
   - ReferenceTagBar 통합
   - 레이아웃 조정
   - referenceStore 연동

**우선순위**: High
**의존성**: projectStore, 기존 타입 정의

---

### 마일스톤 2: 보조 목표 (Secondary Goals)

**목표**: 검색 드롭다운 및 사이드바 기본 기능

**태스크**:

1. **systemStore 확장**
   - fetchSystems 액션 (프로젝트별 시스템 로드)
   - getSystemsByCategory 계산 함수
   - searchSystems 검색 함수
   - filterByTags 필터 함수

2. **ReferenceSearchDropdown 컴포넌트**
   - 검색 입력란 (300ms 디바운스)
   - 필터링된 시스템 목록
   - 클릭 시 참조 추가
   - 외부 클릭/ESC 닫기 처리

3. **SystemSidebar 컴포넌트 (기본)**
   - 카테고리별 접이식 목록
   - 체크박스 선택 UI
   - 접힘/펼침 토글
   - referenceStore 연동

**우선순위**: High
**의존성**: 마일스톤 1 완료

---

### 마일스톤 3: 최종 목표 (Final Goals)

**목표**: 고급 기능 및 사용자 경험 향상

**태스크**:

1. **SystemSidebar 확장**
   - 검색 입력란
   - 태그 필터 기능
   - 눈 버튼 (미리보기 트리거)
   - 축소 모드 UI (아이콘만)

2. **SystemPreview 컴포넌트**
   - 모달 UI
   - 마크다운 렌더링 (react-markdown)
   - "참조에 추가" 버튼
   - 로딩 상태 처리

3. **기본 참조 시스템 API**
   - GET /api/projects/:projectId/default-references
   - PUT /api/projects/:projectId/default-references
   - 프로젝트 JSON 파일 업데이트

4. **기본 참조 시스템 UI**
   - "기본값으로 저장" 버튼
   - loadDefaultReferences 액션
   - saveAsDefault 액션
   - 태스크 생성 시 자동 적용

**우선순위**: Medium
**의존성**: 마일스톤 2 완료

---

### 마일스톤 4: 선택적 목표 (Optional Goals)

**목표**: 폴리싱 및 접근성 향상

**태스크**:

1. **접근성 개선**
   - ARIA 라벨 적용
   - 키보드 네비게이션 (Tab, Enter, Escape)
   - 포커스 인디케이터

2. **애니메이션 및 트랜지션**
   - 사이드바 접기/펼치기 (200ms)
   - 드롭다운 열기/닫기 트랜지션
   - 태그 추가/제거 애니메이션

3. **에러 처리 및 피드백**
   - 토스트 알림 통합
   - 로딩 상태 표시
   - 에러 메시지 표시

**우선순위**: Low
**의존성**: 마일스톤 3 완료

---

## 3. 기술적 접근

### 3.1 상태 관리 아키텍처

```
+------------------+     +-------------------+
| projectStore     |     | systemStore       |
| - currentProject |<----| - documents       |
+------------------+     | - fetchSystems()  |
                         +-------------------+
                                  |
                                  v
                         +-------------------+
                         | referenceStore    |
                         | - selectedRefs    |
                         | - defaultRefs     |
                         +-------------------+
```

**상태 흐름**:
1. projectStore에서 currentProjectId 변경 감지
2. systemStore가 해당 프로젝트의 시스템 문서 로드
3. referenceStore가 기본 참조 시스템 로드
4. UI 컴포넌트가 referenceStore 구독하여 렌더링

### 3.2 컴포넌트 계층 구조

```
App
 |-- Header
 |    |-- ProjectSelector
 |    |-- ReferenceTagBar
 |    |    |-- ReferenceTag (반복)
 |    |    |-- AddButton
 |    |         |-- ReferenceSearchDropdown (조건부)
 |
 |-- MainLayout
      |-- SystemSidebar
      |    |-- SidebarHeader (검색, 필터)
      |    |-- CategoryGroup (반복)
      |    |    |-- CategoryHeader
      |    |    |-- SystemItem (반복)
      |    |         |-- Checkbox
      |    |         |-- PreviewButton (눈)
      |    |-- SaveAsDefaultButton
      |
      |-- MainContent
           |-- KanbanBoard (향후)

+-- SystemPreview (모달, Portal)
```

### 3.3 성능 최적화 전략

1. **검색 디바운스**: 300ms 지연으로 API 호출 최소화
2. **메모이제이션**: useMemo로 필터링/그룹화 결과 캐싱
3. **가상 스크롤**: 100개 이상 시스템 문서 시 적용 고려
4. **지연 로딩**: SystemPreview 컴포넌트 lazy 로딩

### 3.4 API 설계

**시스템 문서 조회**:
```
GET /api/projects/:projectId/systems
Response: {
  success: true,
  data: SystemDocument[]
}
```

**기본 참조 시스템 조회**:
```
GET /api/projects/:projectId/default-references
Response: {
  success: true,
  data: string[] // System IDs
}
```

**기본 참조 시스템 설정**:
```
PUT /api/projects/:projectId/default-references
Body: { referenceIds: string[] }
Response: {
  success: true,
  data: string[]
}
```

---

## 4. 리스크 및 대응

### 4.1 기술적 리스크

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| systemStore 미구현 | High | 마일스톤 2에서 systemStore 확장 우선 구현 |
| 시스템 문서 API 미구현 | High | 로컬 mock 데이터로 개발 후 API 연동 |
| 대량 시스템 문서 성능 | Medium | 가상 스크롤 및 검색 디바운스 적용 |

### 4.2 의존성 리스크

| 의존성 | 상태 | 대응 방안 |
|--------|------|-----------|
| SPEC-PROJECT-001 | 완료 | 정상 진행 가능 |
| SPEC-SYSTEM-001 | 미확인 | 타입 정의 및 스토어 직접 생성 |
| react-markdown | 설치됨 | 정상 사용 가능 |

---

## 5. 테스트 전략

### 5.1 단위 테스트

- referenceStore 액션 테스트
- systemStore 검색/필터 함수 테스트
- 개별 컴포넌트 렌더링 테스트

### 5.2 통합 테스트

- Header + ReferenceTagBar 연동
- SystemSidebar + referenceStore 연동
- 검색 드롭다운 필터링 동작

### 5.3 E2E 테스트 시나리오

1. 사이드바에서 시스템 선택 -> 헤더 태그 표시 확인
2. 태그 x 버튼 클릭 -> 사이드바 체크박스 해제 확인
3. [+ Add] 검색 -> 시스템 추가 확인
4. 기본값 저장 -> 새 세션에서 로드 확인

---

## 6. 파일 생성/수정 목록

### 6.1 신규 생성 파일

| 파일 경로 | 설명 |
|-----------|------|
| src/components/system/ReferenceTagBar.tsx | 헤더 참조 태그바 |
| src/components/system/ReferenceSearchDropdown.tsx | 검색 드롭다운 |
| src/components/system/SystemSidebar.tsx | 접이식 사이드바 |
| src/components/system/SystemList.tsx | 카테고리별 시스템 목록 |
| src/components/system/SystemCard.tsx | 시스템 카드 (체크박스 포함) |
| src/components/system/SystemPreview.tsx | 시스템 미리보기 모달 |
| src/store/referenceStore.ts | 참조 선택 상태 관리 |
| src/store/systemStore.ts | 시스템 문서 상태 관리 |
| server/routes/systems.ts | 시스템 문서 API |

### 6.2 수정 파일

| 파일 경로 | 변경 내용 |
|-----------|-----------|
| src/components/layout/Header.tsx | ReferenceTagBar 통합 |
| src/types/index.ts | ReferenceState 타입 추가 |
| src/App.tsx | SystemSidebar 레이아웃 통합 |
| server/index.ts | systems 라우트 추가 |

---

## 7. 추적성 태그

| 태그 | 관련 요구사항 |
|------|---------------|
| @SPEC-REFERENCE-001 | 전체 SPEC |
| @FR-001 | 헤더 참조 태그바 |
| @FR-002 | 검색 드롭다운 |
| @FR-003 | 접이식 사이드바 |
| @FR-004 | 시스템 미리보기 |
| @FR-005 | 기본 참조 설정 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
