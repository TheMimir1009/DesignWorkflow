# SPEC-DOCREF-002: 구현 계획

## 구현 개요

AI 생성 문서 검토 시 완료된 태스크 문서를 탐색할 수 있는 사이드 패널 UI를 구현합니다.

---

## 단계별 구현 계획

### Phase 1: 서비스 및 상태 관리 구현

**파일**: `src/services/referenceDocService.ts`

구현 항목:
- `getCompletedDocuments()`: 완료 문서 목록 조회
- `getCompletedDocumentDetail()`: 단일 문서 상세 조회

예상 작업량: 약 50-70 줄

**파일**: `src/store/referenceDocStore.ts`

구현 항목:
- 패널 열림/닫힘 상태
- 문서 목록 및 선택된 문서 상태
- 검색 및 필터 상태
- 로딩/에러 상태

예상 작업량: 약 100-120 줄

### Phase 2: 기본 컴포넌트 구현

**파일**: `src/components/reference/ReferenceDocButton.tsx`

구현 항목:
- 참조 문서 버튼 UI
- 클릭 핸들러 연결

예상 작업량: 약 30-40 줄

**파일**: `src/components/reference/DocumentReferenceSidePanel.tsx`

구현 항목:
- 사이드 패널 컨테이너
- 슬라이드 애니메이션
- 오버레이 배경

예상 작업량: 약 80-100 줄

### Phase 3: 목록 및 검색 구현

**파일**: `src/components/reference/ReferenceSearchInput.tsx`

구현 항목:
- 검색 입력 UI
- 디바운스 처리 (300ms)
- 검색어 초기화

예상 작업량: 약 40-50 줄

**파일**: `src/components/reference/ReferenceDocFilter.tsx`

구현 항목:
- 문서 타입 필터 체크박스
- 활성 필터 표시
- 필터 초기화

예상 작업량: 약 60-80 줄

**파일**: `src/components/reference/ReferenceDocList.tsx`

구현 항목:
- 문서 목록 컨테이너
- 로딩 스켈레톤
- 빈 상태 메시지

예상 작업량: 약 60-80 줄

**파일**: `src/components/reference/ReferenceDocListItem.tsx`

구현 항목:
- 개별 문서 항목 UI
- 문서 타입 아이콘
- 클릭 이벤트

예상 작업량: 약 50-60 줄

### Phase 4: 상세 보기 구현

**파일**: `src/components/reference/ReferenceDocDetail.tsx`

구현 항목:
- 문서 상세 뷰 컨테이너
- 문서 타입 탭
- DocumentPreview 연동
- 뒤로가기 버튼

예상 작업량: 약 100-120 줄

### Phase 5: 통합 및 테스트

**파일**: `src/components/document/DocumentEditor.tsx` (수정)

구현 항목:
- ReferenceDocButton 통합
- DocumentReferenceSidePanel 연결

예상 작업량: 약 20-30 줄 추가

---

## 기술 스택

- React 18.x
- TypeScript 5.x
- Zustand (상태 관리)
- TailwindCSS (스타일링)
- react-markdown (마크다운 렌더링)

---

## 의존성 관계

```
referenceDocService.ts
  └── SPEC-DOCREF-001 API

referenceDocStore.ts
  └── referenceDocService.ts

DocumentReferenceSidePanel.tsx
  ├── ReferenceSearchInput.tsx
  ├── ReferenceDocFilter.tsx
  ├── ReferenceDocList.tsx
  │   └── ReferenceDocListItem.tsx
  └── ReferenceDocDetail.tsx
      └── DocumentPreview.tsx (기존 컴포넌트)

ReferenceDocButton.tsx
  └── referenceDocStore.ts

DocumentEditor.tsx (수정)
  ├── ReferenceDocButton.tsx
  └── DocumentReferenceSidePanel.tsx
```

---

## 테스트 전략

### 컴포넌트 테스트

각 컴포넌트별 단위 테스트:
- `ReferenceDocButton.test.tsx`: 버튼 렌더링, 클릭 이벤트
- `DocumentReferenceSidePanel.test.tsx`: 패널 열기/닫기, 애니메이션
- `ReferenceDocList.test.tsx`: 목록 렌더링, 로딩 상태
- `ReferenceDocDetail.test.tsx`: 상세 뷰, 탭 전환

### 통합 테스트

- 전체 워크플로우 테스트
- API 연동 테스트 (MSW 활용)

### E2E 테스트 (선택적)

- Playwright로 전체 흐름 검증

---

## 구현 순서

1. 서비스 구현 (referenceDocService.ts)
2. Store 구현 (referenceDocStore.ts)
3. 버튼 컴포넌트 (ReferenceDocButton.tsx)
4. 패널 컨테이너 (DocumentReferenceSidePanel.tsx)
5. 검색/필터 (ReferenceSearchInput.tsx, ReferenceDocFilter.tsx)
6. 목록 컴포넌트 (ReferenceDocList.tsx, ReferenceDocListItem.tsx)
7. 상세 뷰 (ReferenceDocDetail.tsx)
8. DocumentEditor 통합
9. 테스트 작성 및 검증

---

## 리스크 및 대응

| 리스크 | 영향 | 대응 방안 |
|--------|------|----------|
| API 의존성 | 높 | SPEC-DOCREF-001 선행 구현 필요 |
| 레이아웃 충돌 | 중 | 기존 레이아웃과 조화롭게 통합 |
| 성능 (대량 문서) | 중 | 가상화 스크롤 또는 페이지네이션 |
| 접근성 | 중 | ARIA 레이블, 키보드 네비게이션 |

---

## 완료 기준

- [ ] ReferenceDocButton 컴포넌트 구현
- [ ] DocumentReferenceSidePanel 컴포넌트 구현
- [ ] 검색 기능 동작
- [ ] 필터링 기능 동작
- [ ] 문서 목록 표시
- [ ] 문서 상세 보기 동작
- [ ] DocumentEditor와 통합
- [ ] 반응형 레이아웃 적용
- [ ] 접근성 요구사항 충족
- [ ] 단위 테스트 통과 (커버리지 85%+)
