# SPEC-DOCUMENT-001: 인수 기준

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-DOCUMENT-001 |
| 문서 유형 | Acceptance Criteria |
| 생성일 | 2026-01-07 |
| 관련 SPEC | spec.md |

---

## 테스트 시나리오

### 시나리오 1: 문서 미리보기 (REQ-DOC-001)

#### TC-DOC-001: 기본 마크다운 렌더링

```gherkin
Given 설계문서 내용이 "# 제목\n본문 내용입니다."인 경우
When DocumentPreview 컴포넌트가 렌더링되면
Then h1 태그로 "제목"이 표시되어야 한다
And p 태그로 "본문 내용입니다."가 표시되어야 한다
```

#### TC-DOC-002: GFM 테이블 렌더링

```gherkin
Given 설계문서에 마크다운 테이블이 포함된 경우
When DocumentPreview 컴포넌트가 렌더링되면
Then HTML table 요소로 테이블이 표시되어야 한다
And 테이블 헤더와 데이터 셀이 올바르게 구분되어야 한다
```

#### TC-DOC-003: 코드 블록 렌더링

```gherkin
Given 설계문서에 코드 블록이 포함된 경우
When DocumentPreview 컴포넌트가 렌더링되면
Then pre/code 요소로 코드가 표시되어야 한다
And 언어별 구문 강조가 적용되어야 한다
```

#### TC-DOC-004: 빈 문서 처리

```gherkin
Given 설계문서 내용이 빈 문자열인 경우
When DocumentPreview 컴포넌트가 렌더링되면
Then 빈 상태 메시지가 표시되어야 한다
And 에러가 발생하지 않아야 한다
```

---

### 시나리오 2: 직접 편집 모드 (REQ-DOC-002)

#### TC-DOC-005: 편집 모드 전환

```gherkin
Given DocumentEditor가 미리보기 모드로 표시된 경우
When 사용자가 "직접 편집" 버튼을 클릭하면
Then 마크다운 에디터가 활성화되어야 한다
And 분할 뷰 (에디터 | 미리보기)로 전환되어야 한다
```

#### TC-DOC-006: 실시간 미리보기 업데이트

```gherkin
Given 편집 모드가 활성화된 경우
When 사용자가 에디터에서 텍스트를 수정하면
Then 우측 미리보기가 실시간으로 업데이트되어야 한다
And 업데이트 지연은 300ms 이내여야 한다
```

#### TC-DOC-007: 내용 저장

```gherkin
Given 편집 모드에서 내용을 수정한 경우
When 사용자가 "저장" 버튼을 클릭하면
Then onSave 콜백이 호출되어야 한다
And 변경된 내용이 전달되어야 한다
```

---

### 시나리오 3: AI 수정 요청 모드 (REQ-DOC-003)

#### TC-DOC-008: 수정 요청 입력

```gherkin
Given RevisionPanel이 표시된 경우
When 사용자가 "도입부를 더 상세하게 작성해주세요"라고 입력하면
Then 입력 필드에 텍스트가 표시되어야 한다
And "수정 요청" 버튼이 활성화되어야 한다
```

#### TC-DOC-009: 수정 요청 제출

```gherkin
Given 수정 요청 텍스트가 입력된 경우
When 사용자가 "수정 요청" 버튼을 클릭하면
Then 로딩 인디케이터가 표시되어야 한다
And claudeCodeService가 호출되어야 한다
And 완료 후 onRevisionComplete 콜백이 호출되어야 한다
```

#### TC-DOC-010: 수정 요청 에러 처리

```gherkin
Given 수정 요청이 진행 중인 경우
When API 호출이 실패하면
Then 에러 메시지가 표시되어야 한다
And 재시도 버튼이 표시되어야 한다
And 입력 필드는 유지되어야 한다
```

#### TC-DOC-011: 빈 수정 요청 방지

```gherkin
Given RevisionPanel이 표시된 경우
When 입력 필드가 비어있는 경우
Then "수정 요청" 버튼이 비활성화되어야 한다
```

---

### 시나리오 4: 버전 히스토리 (REQ-DOC-004, REQ-DOC-005)

#### TC-DOC-012: 버전 목록 표시

```gherkin
Given 태스크에 3개의 수정 이력이 있는 경우
When VersionHistory 컴포넌트가 렌더링되면
Then 3개의 버전이 시간순으로 표시되어야 한다
And 각 버전에 버전 번호와 생성 시간이 표시되어야 한다
And 현재 버전이 강조 표시되어야 한다
```

#### TC-DOC-013: 버전 선택

```gherkin
Given 버전 목록이 표시된 경우
When 사용자가 이전 버전을 클릭하면
Then onVersionSelect 콜백이 호출되어야 한다
And 선택된 버전 데이터가 전달되어야 한다
```

#### TC-DOC-014: 버전 복원

```gherkin
Given 이전 버전이 선택된 경우
When 사용자가 "이 버전으로 복원" 버튼을 클릭하면
Then 확인 다이얼로그가 표시되어야 한다
And 확인 시 onRestore 콜백이 호출되어야 한다
```

#### TC-DOC-015: 빈 히스토리 처리

```gherkin
Given 태스크에 수정 이력이 없는 경우
When VersionHistory 컴포넌트가 렌더링되면
Then "버전 기록이 없습니다" 메시지가 표시되어야 한다
```

---

### 시나리오 5: 문서 승인 (REQ-DOC-006)

#### TC-DOC-016: 승인 버튼 클릭

```gherkin
Given 문서 편집이 완료된 경우
When 사용자가 "승인" 버튼을 클릭하면
Then onApprove 콜백이 호출되어야 한다
And 버튼이 로딩 상태로 변경되어야 한다
```

#### TC-DOC-017: 승인 완료 후 상태

```gherkin
Given 승인 요청이 성공한 경우
When 처리가 완료되면
Then 태스크 상태가 다음 단계로 변경되어야 한다
And 성공 메시지가 표시되어야 한다
```

---

### 시나리오 6: 분할 뷰 (REQ-DOC-007)

#### TC-DOC-018: 분할 뷰 레이아웃

```gherkin
Given 편집 모드가 활성화된 경우
When DocumentEditor가 렌더링되면
Then 화면이 좌우로 분할되어야 한다
And 좌측에 마크다운 에디터가 표시되어야 한다
And 우측에 미리보기가 표시되어야 한다
```

#### TC-DOC-019: 분할 뷰 반응형

```gherkin
Given 화면 너비가 768px 미만인 경우
When DocumentEditor가 렌더링되면
Then 분할 뷰 대신 탭 전환 UI로 표시되어야 한다
```

---

### 시나리오 7: 로딩 상태 (REQ-DOC-008)

#### TC-DOC-020: AI 생성 로딩 상태

```gherkin
Given AI 문서 생성이 진행 중인 경우
When DocumentEditor가 렌더링되면
Then 로딩 인디케이터가 표시되어야 한다
And 에디터가 비활성화되어야 한다
And 저장/승인 버튼이 비활성화되어야 한다
```

---

### 시나리오 8: 저장되지 않은 변경 경고 (REQ-DOC-009)

#### TC-DOC-021: 변경 사항 있는 상태에서 이탈

```gherkin
Given 편집 모드에서 저장되지 않은 변경이 있는 경우
When 사용자가 다른 페이지로 이동하려 하면
Then 확인 다이얼로그가 표시되어야 한다
And "저장하지 않고 나가기" 옵션이 제공되어야 한다
And "취소" 옵션이 제공되어야 한다
```

---

## 품질 게이트

### 필수 통과 조건

| 항목 | 기준 |
|------|------|
| 단위 테스트 | 모든 시나리오 PASS |
| 테스트 커버리지 | 85% 이상 |
| TypeScript | 타입 에러 0개 |
| ESLint | 경고 0개 |
| 접근성 | ARIA 레이블 적용 완료 |

### 검증 방법

| 검증 유형 | 도구 | 명령어 |
|----------|------|--------|
| 단위 테스트 | Vitest | `npm test` |
| 커버리지 | Vitest | `npm run test:coverage` |
| 타입 검사 | TypeScript | `npm run type-check` |
| 린트 | ESLint | `npm run lint` |

---

## Definition of Done

### 컴포넌트 완료 조건

- [x] 모든 테스트 시나리오 통과
- [x] TypeScript 타입 완전 정의
- [x] Props 인터페이스 JSDoc 문서화
- [x] 에러 경계 처리 구현
- [x] 로딩/에러 상태 UI 구현
- [x] 접근성 속성 (aria-*) 적용

### 통합 완료 조건

- [x] 배럴 익스포트 업데이트
- [x] 기존 워크플로우와 연동 확인
- [x] Q&A 완료 후 문서 편집 플로우 테스트
- [x] 칸반 상태 전환 연동 확인

---

## 추적성 태그

| 관련 항목 | 참조 |
|----------|------|
| SPEC 문서 | SPEC-DOCUMENT-001/spec.md |
| 구현 계획 | SPEC-DOCUMENT-001/plan.md |
| PRD 기능 | product.md Feature 7 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-07 | workflow-spec | 초기 인수 기준 작성 |
| 1.0.0 | 2026-01-07 | Completed | All acceptance criteria verified with 81 passing tests |
