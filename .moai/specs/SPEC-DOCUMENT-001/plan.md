# SPEC-DOCUMENT-001: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-DOCUMENT-001 |
| 문서 유형 | Implementation Plan |
| 생성일 | 2026-01-07 |
| 관련 SPEC | spec.md |

---

## 구현 전략

### 접근 방식

TDD (Test-Driven Development) 방식으로 각 컴포넌트를 개별적으로 개발하고, 점진적으로 통합합니다. 기존 `MarkdownEditor.tsx` 컴포넌트를 최대한 활용하여 코드 재사용성을 높입니다.

### 개발 순서

1. **기반 컴포넌트** (DocumentPreview) - 다른 컴포넌트의 의존성
2. **핵심 편집기** (DocumentEditor) - 메인 기능
3. **AI 수정 패널** (RevisionPanel) - 부가 기능
4. **버전 관리** (VersionHistory) - 고급 기능

---

## 마일스톤

### 마일스톤 1: 기반 컴포넌트 (Primary Goal)

**목표**: DocumentPreview 컴포넌트 구현

**태스크 목록**:

1. DocumentPreview 컴포넌트 테스트 작성
   - 마크다운 렌더링 테스트
   - GFM 지원 테스트 (테이블, 체크박스, 취소선)
   - 코드 블록 렌더링 테스트
   - 빈 내용 처리 테스트

2. DocumentPreview 컴포넌트 구현
   - react-markdown 통합
   - remark-gfm 플러그인 적용
   - Tailwind 스타일링
   - 접근성 속성 추가

3. 테스트 통과 확인

**산출물**:
- `/src/components/document/DocumentPreview.tsx`
- `/src/components/document/__tests__/DocumentPreview.test.tsx`

**의존성**: 없음 (독립 컴포넌트)

---

### 마일스톤 2: 핵심 편집기 (Primary Goal)

**목표**: DocumentEditor 분할 뷰 편집기 구현

**태스크 목록**:

1. DocumentEditor 컴포넌트 테스트 작성
   - 분할 뷰 렌더링 테스트
   - 편집 모드 전환 테스트
   - 내용 변경 핸들링 테스트
   - 저장/승인 버튼 테스트
   - 로딩 상태 테스트
   - 비활성화 상태 테스트

2. DocumentEditor 컴포넌트 구현
   - 분할 뷰 레이아웃 (좌: 에디터, 우: 미리보기)
   - 기존 MarkdownEditor 통합
   - DocumentPreview 통합
   - 모드 전환 UI
   - 저장/승인 버튼

3. 통합 테스트

**산출물**:
- `/src/components/document/DocumentEditor.tsx`
- `/src/components/document/__tests__/DocumentEditor.test.tsx`

**의존성**: 마일스톤 1 (DocumentPreview)

---

### 마일스톤 3: AI 수정 패널 (Secondary Goal)

**목표**: RevisionPanel AI 수정 요청 기능 구현

**태스크 목록**:

1. RevisionPanel 컴포넌트 테스트 작성
   - 수정 요청 입력 테스트
   - 제출 버튼 테스트
   - 로딩 상태 테스트
   - 에러 처리 테스트
   - 빈 입력 방지 테스트

2. RevisionPanel 컴포넌트 구현
   - 수정 요청 textarea
   - 제출 버튼 및 로딩 UI
   - claudeCodeService 연동 (또는 스텁)
   - 에러 메시지 표시

3. taskStore 확장
   - submitRevision 액션 추가
   - isRevisionLoading 상태 추가

**산출물**:
- `/src/components/document/RevisionPanel.tsx`
- `/src/components/document/__tests__/RevisionPanel.test.tsx`
- `taskStore.ts` 업데이트

**의존성**: 기존 claudeCodeService (스텁 가능)

---

### 마일스톤 4: 버전 관리 (Final Goal)

**목표**: VersionHistory 버전 히스토리 관리 구현

**태스크 목록**:

1. VersionHistory 컴포넌트 테스트 작성
   - 버전 목록 렌더링 테스트
   - 버전 선택 테스트
   - 복원 기능 테스트
   - 빈 히스토리 테스트

2. VersionHistory 컴포넌트 구현
   - 버전 목록 UI (시간순 정렬)
   - 버전 선택 핸들링
   - 복원 확인 다이얼로그
   - 현재 버전 표시

3. Diff 비교 기능 (Optional)
   - 두 버전 간 차이 표시
   - 시각적 diff 하이라이팅

**산출물**:
- `/src/components/document/VersionHistory.tsx`
- `/src/components/document/__tests__/VersionHistory.test.tsx`

**의존성**: 기존 Revision 타입 (types/index.ts)

---

### 마일스톤 5: 통합 및 배럴 익스포트 (Final Goal)

**목표**: 컴포넌트 통합 및 내보내기 설정

**태스크 목록**:

1. document/index.ts 배럴 익스포트 업데이트
   - 4개 신규 컴포넌트 익스포트 추가

2. 통합 테스트
   - 전체 문서 편집 플로우 테스트
   - Q&A 완료 후 문서 편집 연동 테스트

3. 접근성 검증
   - 키보드 네비게이션
   - 스크린 리더 호환성

**산출물**:
- `/src/components/document/index.ts` 업데이트

**의존성**: 마일스톤 1-4 완료

---

## 기술적 접근

### 컴포넌트 설계 원칙

1. **단일 책임**: 각 컴포넌트는 하나의 명확한 역할만 수행
2. **합성 가능**: 작은 컴포넌트를 조합하여 복잡한 기능 구현
3. **테스트 용이성**: 외부 의존성 최소화, props 기반 데이터 흐름

### 스타일링 전략

```
- Tailwind CSS 유틸리티 클래스 사용
- 기존 컴포넌트 스타일 패턴 준수
- 반응형 레이아웃 (모바일 우선)
- 다크 모드 미지원 (현재 프로젝트 범위 외)
```

### 상태 관리 전략

```
- 로컬 상태: 컴포넌트 내부 UI 상태 (useState)
- 전역 상태: taskStore (Zustand)
- 파생 상태: 계산된 값은 선택자 함수로 처리
```

### 에러 처리 전략

```
- API 에러: try-catch + 사용자 친화적 메시지
- 검증 에러: 입력 필드 레벨 표시
- 네트워크 에러: 재시도 버튼 제공
```

---

## 리스크 및 대응

### 기술적 리스크

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| Claude Code API 지연 | 중 | 타임아웃 설정, 로딩 UI, 취소 기능 |
| 대용량 문서 렌더링 성능 | 낮 | 가상화 또는 페이지네이션 (필요 시) |
| 마크다운 호환성 | 낮 | remark-gfm으로 표준 GFM 지원 |

### 의존성 리스크

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| claudeCodeService 미완성 | 중 | 스텁/목 구현으로 개발 진행 |
| 기존 타입 변경 | 낮 | 확장 방식으로 타입 추가 |

---

## 품질 기준

### 코드 품질

- TypeScript strict mode 준수
- ESLint 경고 0개
- 테스트 커버리지 85% 이상

### 접근성

- ARIA 레이블 적용
- 키보드 네비게이션 지원
- 적절한 색상 대비

### 성능

- 초기 렌더링 100ms 이내
- 마크다운 변환 50ms 이내 (일반 문서 기준)

---

## 추적성 태그

| 관련 항목 | 참조 |
|----------|------|
| SPEC 문서 | SPEC-DOCUMENT-001/spec.md |
| 인수 기준 | SPEC-DOCUMENT-001/acceptance.md |
| PRD 기능 | product.md Feature 7 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-07 | workflow-spec | 초기 계획 작성 |
