# SPEC-DOCEDIT-001: 인수 기준 (Acceptance Criteria)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-DOCEDIT-001 |
| 문서 버전 | 1.1.0 |
| 생성일 | 2026-01-10 |
| 마지막 수정일 | 2026-01-11 |
| 검증 방법 | Given-When-Then (BDD) |
| 구현 상태 | Phase 1 완료 (백엔드 100%) |

---

## 개요

본 문서는 SPEC-DOCEDIT-001(문서 편집 기능 향상)의 인수 기준을 정의합니다. 각 요구사항별로 명확한 검증 기준을 제시하여 구현 완료 여부를 판단할 수 있도록 합니다.

## 인수 기준 현황 (2026-01-11 기준)

### 완료된 인수 기준

- ✅ **AC-EDIT-004**: 버전 관리 백엔드 (REQ-EDIT-004)
  - 모든 백엔드 API 구현 완료
  - 39개 테스트 전체 통과
  - 100% 커버리지 달성

### 진행 예정 인수 기준

- ⏳ **AC-EDIT-001**: 향상된 마크다운 에디터 (REQ-EDIT-001)
- ⏳ **AC-EDIT-002**: 자동 저장 (REQ-EDIT-002)
- ⏳ **AC-EDIT-003**: 저장 상태 표시기 (REQ-EDIT-003)
- ⏳ **AC-EDIT-005**: 변경 비교 시각화 (REQ-EDIT-005)
- ⏳ **AC-EDIT-006**: 에디터 단축키 (REQ-EDIT-006)
- ⏳ **AC-EDIT-007**: 저장되지 않은 변경 경고 (REQ-EDIT-007)
- ⏳ **AC-EDIT-008**: 오프라인 저장 (REQ-EDIT-008)

---

## 인수 기준 목록

### AC-EDIT-001: 향상된 마크다운 에디터 (REQ-EDIT-001)

**목표**: 구문 강조, 줄 번호, 에디터 단축키를 지원하는 고급 마크다운 에디터 제공

#### Scenario 1: 에디터 초기 로드

**Given** 사용자가 문서 편집 페이지에 접근
**When** 페이지가 로드됨
**Then** CodeMirror 기반 에디터가 1초 이내에 렌더링됨
**And** 에디터는 마크다운 구문 강조를 지원함
**And** 에디터는 줄 번호를 표시함
**And** 에디터는 One Dark 테마가 적용됨

**검증 방법:**
```typescript
// 테스트 코드 예시
test('editor renders within 1 second', async () => {
  const startTime = Date.now();
  render(<EnhancedDocumentEditor initialContent="# Test" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);
  await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(1000);
});
```

#### Scenario 2: 마크다운 구문 강조

**Given** 에디터가 로드됨
**When** 사용자가 마크다운 문법을 입력함
**Then** 해당 문법에 따라 구문 강조가 적용됨
**And** 헤딩(#), 볼드(**), 이탤릭(*), 코드(``) 등이 다르게 표시됨

**검증 방법:**
```typescript
test('markdown syntax highlighting works', () => {
  const { container } = render(<EnhancedDocumentEditor initialContent="# Heading\n\n**bold** and *italic*" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);
  const headings = container.querySelectorAll('.cm-heading');
  const strongs = container.querySelectorAll('.cm-strong');
  const ems = container.querySelectorAll('.cm-emphasis');
  expect(headings.length).toBeGreaterThan(0);
  expect(strongs.length).toBeGreaterThan(0);
  expect(ems.length).toBeGreaterThan(0);
});
```

#### Scenario 3: 줄 번호 표시

**Given** 에디터가 로드됨
**When** 사용자가 여러 줄의 텍스트를 입력함
**Then** 각 라인 왼쪽에 줄 번호가 표시됨
**And** 줄 번호는 1부터 순차적으로 증가함

**검증 방법:**
```typescript
test('line numbers are displayed', () => {
  const content = "Line 1\nLine 2\nLine 3";
  const { container } = render(<EnhancedDocumentEditor initialContent={content} taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);
  const lineNumbers = container.querySelectorAll('.cm-lineNumbers');
  expect(lineNumbers.length).toBe(3);
});
```

---

### AC-EDIT-002: 자동 저장 (REQ-EDIT-002)

**목표**: 사용자 수정 후 5초 이내에 자동 저장

#### Scenario 1: 자동 저장 타이머

**Given** 사용자가 에디터에서 내용을 수정
**When** 마지막 수정 후 5초가 경과함
**Then** 시스템은 자동으로 변경 사항을 저장함
**And** 저장 상태가 "Saving..."으로 변경됨

**검증 방법:**
```typescript
test('auto-save triggers after 5 seconds of inactivity', async () => {
  const onSave = jest.fn();
  const { user } = setup(<EnhancedDocumentEditor initialContent="Original" taskId="123" onSave={onSave} onSaveStatusChange={jest.fn()} />);
  const editor = screen.getByRole('textbox');

  await user.type(editor, ' modified');
  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(0), { timeout: 4000 });
  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), { timeout: 2000 });
});
```

#### Scenario 2: 디바운스 동작

**Given** 사용자가 에디터에서 연속으로 입력
**When** 사용자가 매초마다 입력을 계속함
**Then** 자동 저장 타이머는 매번 리셋됨
**And** 마지막 입력 후 5초까지 저장되지 않음

**검증 방법:**
```typescript
test('debounce timer resets on continuous input', async () => {
  const onSave = jest.fn();
  const { user } = setup(<EnhancedDocumentEditor initialContent="Original" taskId="123" onSave={onSave} onSaveStatusChange={jest.fn()} />);
  const editor = screen.getByRole('textbox');

  await user.type(editor, 'a');
  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(0), { timeout: 2000 });

  await user.type(editor, 'b');
  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(0), { timeout: 2000 });

  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), { timeout: 4000 });
});
```

#### Scenario 3: 자동 저장 성공

**Given** 자동 저장이 트리거됨
**When** 저장이 성공적으로 완료됨
**Then** 저장 상태가 "Saved"로 변경됨
**And** 마지막 저장 시간이 표시됨

**검증 방법:**
```typescript
test('save status updates to Saved after successful save', async () => {
  const onSaveStatusChange = jest.fn();
  const onSave = jest.fn().mockResolvedValue(undefined);
  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={onSave} onSaveStatusChange={onSaveStatusChange} />);

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Modified' } });
  await waitFor(() => {
    expect(onSaveStatusChange).toHaveBeenCalledWith('saving');
  }, { timeout: 100 });

  await waitFor(() => {
    expect(onSaveStatusChange).toHaveBeenCalledWith('saved');
  }, { timeout: 6000 });
});
```

---

### AC-EDIT-003: 저장 상태 표시기 (REQ-EDIT-003)

**목표**: 저장 진행 상황을 명확히 시각화

#### Scenario 1: Saving 상태 표시

**Given** 사용자가 변경 사항을 저장함
**When** 저장이 진행 중임
**Then** "Saving..." 메시지와 로딩 스피너가 표시됨
**And** 메시지는 파란색/회색으로 표시됨

**검증 방법:**
```typescript
test('displays saving status', () => {
  render(<SaveStatusIndicator status="saving" />);
  expect(screen.getByText('Saving...')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveClass('text-blue-500');
});
```

#### Scenario 2: Saved 상태 표시

**Given** 저장이 완료됨
**When** 저장이 성공함
**Then** "Saved" 메시지와 체크 아이콘이 표시됨
**And** 마지막 저장 시간이 함께 표시됨

**검증 방법:**
```typescript
test('displays saved status with timestamp', () => {
  const lastSaved = new Date('2026-01-10T10:30:00');
  render(<SaveStatusIndicator status="saved" lastSavedTime={lastSaved} />);
  expect(screen.getByText(/saved/i)).toBeInTheDocument();
  expect(screen.getByText(/last saved/i)).toBeInTheDocument();
});
```

#### Scenario 3: Error 상태 표시

**Given** 저장이 실패함
**When** 저장 API가 에러를 반환함
**Then** "Error" 메시지와 경고 아이콘이 표시됨
**And** 에러 메시지가 표시됨
**And** 재시도 버튼이 제공됨

**검증 방법:**
```typescript
test('displays error status with retry button', () => {
  render(<SaveStatusIndicator status="error" errorMessage="Network error" />);
  expect(screen.getByText(/error/i)).toBeInTheDocument();
  expect(screen.getByText(/network error/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});
```

---

### AC-EDIT-004: 버전 관리 백엔드 (REQ-EDIT-004) ✅ 완료

**목표**: 모든 문서 버전을 저장하고 조회하는 백엔드 API

**구현 완료일:** 2026-01-11
**테스트 결과:** 12개 테스트 전체 통과 (100%)

#### Scenario 1: 버전 저장

**Given** 유효한 태스크 ID와 문서 내용이 있음
**When** POST /api/documents/versions를 호출함
**Then** 새 버전이 생성됨
**And** 버전 번호가 1씩 증가함
**And** 타임스탬프가 기록됨

**검증 방법:**
```typescript
test('POST /api/documents/versions creates new version', async () => {
  const response = await fetch('/api/documents/versions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskId: 'task-123',
      content: '# New Document\n\nContent here',
      author: 'user-1'
    })
  });

  expect(response.status).toBe(201);
  const data = await response.json();
  expect(data.versionNumber).toBeDefined();
  expect(data.timestamp).toBeDefined();
});
```

#### Scenario 2: 버전 목록 조회

**Given** 특정 태스크에 여러 버전이 존재
**When** GET /api/documents/versions?taskId=:id를 호출함
**Then** 모든 버전의 목록이 최신 순으로 반환됨
**And** 각 버전의 메타데이터가 포함됨

**검증 방법:**
```typescript
test('GET /api/documents/versions returns version list', async () => {
  const response = await fetch('/api/documents/versions?taskId=task-123');
  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.versions).toBeInstanceOf(Array);
  expect(data.versions[0].versionNumber).toBeGreaterThan(data.versions[1].versionNumber);
});
```

#### Scenario 3: 특정 버전 조회

**Given** 특정 버전 ID가 존재
**When** GET /api/documents/versions/:id를 호출함
**Then** 해당 버전의 전체 내용이 반환됨

**검증 방법:**
```typescript
test('GET /api/documents/versions/:id returns specific version', async () => {
  const response = await fetch('/api/documents/versions/version-456');
  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.content).toBeDefined();
  expect(data.versionNumber).toBeDefined();
});
```

---

### AC-EDIT-005: 변경 비교 시각화 (REQ-EDIT-005)

**목표**: 두 버전 간 변경 사항을 색상으로 구분하여 시각화

#### Scenario 1: 추가된 라인 표시

**Given** 버전 1과 버전 2를 비교
**When** 버전 2에 새로운 라인이 추가됨
**Then** 추가된 라인은 녹색 배경으로 표시됨
**And** 라인 왼쪽에 "+" 기호가 표시됨

**검증 방법:**
```typescript
test('displays added lines in green', () => {
  const version1 = { content: 'Line 1\nLine 2' };
  const version2 = { content: 'Line 1\nAdded Line\nLine 2' };

  render(<VersionComparisonView version1={version1} version2={version2} onClose={jest.fn()} />);

  const addedLines = screen.getAllByText(/added line/i);
  expect(addedLines[0]).toHaveClass('bg-green-100');
});
```

#### Scenario 2: 삭제된 라인 표시

**Given** 버전 1과 버전 2를 비교
**When** 버전 1에 있던 라인이 버전 2에서 삭제됨
**Then** 삭제된 라인은 빨간 배경과 취소선으로 표시됨
**And** 라인 왼쪽에 "-" 기호가 표시됨

**검증 방법:**
```typescript
test('displays removed lines in red with strikethrough', () => {
  const version1 = { content: 'Line 1\nLine 2\nLine 3' };
  const version2 = { content: 'Line 1\nLine 3' };

  render(<VersionComparisonView version1={version1} version2={version2} onClose={jest.fn()} />);

  const removedLines = screen.getAllByText(/line 2/i);
  expect(removedLines[0]).toHaveClass('bg-red-100', 'line-through');
});
```

#### Scenario 3: 변경 요약 표시

**Given** 두 버전을 비교함
**When** 비교 결과가 계산됨
**Then** 추가/삭제/수정 라인 수가 요약되어 표시됨

**검증 방법:**
```typescript
test('displays change summary', () => {
  const version1 = { content: 'Line 1\nLine 2\nLine 3' };
  const version2 = { content: 'Line 1\nModified\nLine 3\nAdded' };

  render(<VersionComparisonView version1={version1} version2={version2} onClose={jest.fn()} />);

  expect(screen.getByText(/1 lines added/i)).toBeInTheDocument();
  expect(screen.getByText(/1 lines removed/i)).toBeInTheDocument();
  expect(screen.getByText(/1 lines modified/i)).toBeInTheDocument();
});
```

---

### AC-EDIT-006: 에디터 단축키 (REQ-EDIT-006)

**목표**: 일반적인 마크다운 서식 단축키 지원

#### Scenario 1: 볼드 단축키 (Ctrl/Cmd + B)

**Given** 에디터에서 텍스트가 선택됨
**When** 사용자가 Ctrl/Cmd + B를 누름
**Then** 선택된 텍스트가 **bold** 형식으로 변환됨

**검증 방법:**
```typescript
test('Ctrl+B applies bold formatting', () => {
  const { container } = render(<EnhancedDocumentEditor initialContent="selected text" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);
  const editor = container.querySelector('.cm-content');

  // 텍스트 선택 후 Ctrl+B 시뮬레이션
  fireEvent.keyDown(editor, { key: 'b', ctrlKey: true });

  // **selected text**로 변환되었는지 확인
  expect(editor).toHaveTextContent('**selected text**');
});
```

#### Scenario 2: 이탤릭 단축키 (Ctrl/Cmd + I)

**Given** 에디터에서 텍스트가 선택됨
**When** 사용자가 Ctrl/Cmd + I를 누름
**Then** 선택된 텍스트가 *italic* 형식으로 변환됨

#### Scenario 3: 코드 인라인 단축키 (Ctrl/Cmd + K)

**Given** 에디터에서 텍스트가 선택됨
**When** 사용자가 Ctrl/Cmd + K를 누름
**Then** 선택된 텍스트가 `code` 형식으로 변환됨

#### Scenario 4: 단축키 가이드 표시

**Given** 에디터가 로드됨
**When** 사용자가 "?" 또는 "F1" 키를 누름
**Then** 사용 가능한 모든 단축키 목록이 모달로 표시됨

**검증 방법:**
```typescript
test('displays keyboard shortcuts help on F1', () => {
  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);
  fireEvent.keyDown(document, { key: 'F1' });
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
});
```

---

### AC-EDIT-007: 저장되지 않은 변경 경고 (REQ-EDIT-007)

**목표**: 페이지 이탈 시 저장되지 않은 변경 경고

#### Scenario 1: 저장되지 않은 변경 감지

**Given** 사용자가 에디터에서 내용을 수정
**When** 저장되지 않은 변경이 존재
**Then** 시스템은 변경 플래그를 설정함

**검증 방법:**
```typescript
test('sets unsaved changes flag on edit', () => {
  let hasUnsavedChanges = false;
  const { user } = setup(<EnhancedDocumentEditor
    initialContent="Original"
    taskId="123"
    onSave={jest.fn()}
    onSaveStatusChange={jest.fn()}
    onUnsavedChange={(flag) => { hasUnsavedChanges = flag; }}
  />);

  const editor = screen.getByRole('textbox');
  fireEvent.change(editor, { target: { value: 'Modified' } });

  expect(hasUnsavedChanges).toBe(true);
});
```

#### Scenario 2: 페이지 이탈 경고 표시

**Given** 저장되지 않은 변경이 존재
**When** 사용자가 페이지를 새로고침하거나 창을 닫으려 함
**Then** 브라우저 기본 확인 다이얼로그가 표시됨
**And** "변경 사항이 저장되지 않았습니다. 정말 떠나시겠습니까?" 메시지가 표시됨

**검증 방법:**
```typescript
test('shows browser confirmation dialog on page exit with unsaved changes', () => {
  const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });
  const preventDefaultSpy = jest.fn();

  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Modified' } });

  window.dispatchEvent(beforeUnloadEvent);

  expect(beforeUnloadEvent.defaultPrevented).toBe(true);
});
```

#### Scenario 3: 저장 후 경고 제거

**Given** 저장되지 않은 변경이 존재
**When** 변경 사항이 저장됨
**Then** 변경 플래그가 해제됨
**And** 페이지 이탈 시 경고가 표시되지 않음

**검증 방법:**
```typescript
test('removes unsaved changes flag after save', async () => {
  let hasUnsavedChanges = false;
  const onSave = jest.fn().mockResolvedValue(undefined);

  const { user } = setup(<EnhancedDocumentEditor
    initialContent="Original"
    taskId="123"
    onSave={onSave}
    onSaveStatusChange={jest.fn()}
    onUnsavedChange={(flag) => { hasUnsavedChanges = flag; }}
  />);

  const editor = screen.getByRole('textbox');
  await user.type(editor, ' Modified');

  // 저장 버튼 클릭
  await user.click(screen.getByRole('button', { name: /save/i }));

  await waitFor(() => {
    expect(hasUnsavedChanges).toBe(false);
  });
});
```

---

### AC-EDIT-008: 오프라인 저장 (REQ-EDIT-008)

**목표**: localStorage를 활용한 오프라인 저장

#### Scenario 1: 오프라인 상태 감지

**Given** 애플리케이션이 온라인 상태
**When** 네트워크 연결이 끊김
**Then** 시스템은 오프라인 상태를 감지함
**And** "오프라인 모드" 표시가 나타남

**검증 방법:**
```typescript
test('detects offline status', () => {
  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);

  // 오프라인 상태 시뮬레이션
  Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
  window.dispatchEvent(new Event('offline'));

  expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
});
```

#### Scenario 2: 오프라인 저장

**Given** 애플리케이션이 오프라인 상태
**When** 사용자가 문서를 수정함
**Then** 변경 사항이 localStorage에 저장됨
**And** "로컬에 저장됨" 메시지가 표시됨

**검증 방법:**
```typescript
test('saves to localStorage when offline', async () => {
  Object.defineProperty(navigator, 'onLine', { value: false });
  const { user } = setup(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);

  const editor = screen.getByRole('textbox');
  await user.type(editor, ' Modified');

  await waitFor(() => {
    const saved = localStorage.getItem('draft-task-123');
    expect(saved).toContain('Modified');
  });
});
```

#### Scenario 3: 온라인 복귀 시 동기화

**Given** 오프라인 상태에서 localStorage에 변경 사항이 저장됨
**When** 네트워크 연결이 복구됨
**Then** 시스템은 자동으로 서버에 변경 사항을 동기화함
**And** 동기화 완료 메시지가 표시됨

**검증 방법:**
```typescript
test('syncs to server when back online', async () => {
  const onSave = jest.fn().mockResolvedValue(undefined);

  // 오프라인 상태에서 변경
  Object.defineProperty(navigator, 'onLine', { value: false });
  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={onSave} onSaveStatusChange={jest.fn()} />);

  // 온라인 복귀 시뮬레이션
  Object.defineProperty(navigator, 'onLine', { value: true });
  window.dispatchEvent(new Event('online'));

  await waitFor(() => {
    expect(onSave).toHaveBeenCalled();
  });
});
```

#### Scenario 4: 충돌 해결

**Given** 오프라인 상태에서 변경한 내용과 서버 변경 내용이 충돌
**When** 동기화가 시도됨
**Then** 사용자에게 충돌 알림이 표시됨
**And** 사용자는 로컬 버전 또는 서버 버전 중 하나를 선택할 수 있음

**검증 방법:**
```typescript
test('prompts user to resolve conflicts', async () => {
  // 오프라인 변경과 서버 변경 시뮬레이션
  const onSave = jest.fn().mockRejectedValue(new Error('Conflict detected'));

  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={onSave} onSaveStatusChange={jest.fn()} />);

  Object.defineProperty(navigator, 'onLine', { value: true });
  window.dispatchEvent(new Event('online'));

  await waitFor(() => {
    expect(screen.getByText(/conflict detected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep local/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use server/i })).toBeInTheDocument();
  });
});
```

---

## 비기능 요구사항 인수 기준

### AC-NFR-001: 성능 기준

#### Scenario 1: 에디터 로드 시간

**Given** 사용자가 문서 편집 페이지에 접근
**When** 페이지가 로드됨
**Then** 에디터가 1초 이내에 렌더링 완료됨

**검증 방법:**
```typescript
test('editor loads within 1 second', async () => {
  const startTime = performance.now();
  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);
  await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
  const loadTime = performance.now() - startTime;
  expect(loadTime).toBeLessThan(1000);
});
```

#### Scenario 2: 자동 저장 응답 시간

**Given** 자동 저장이 트리거됨
**When** 저장 API가 호출됨
**Then** 5초 이내에 저장이 완료됨

#### Scenario 3: 버전 비교 성능

**Given** 10,000라인의 문서 두 버전을 비교
**When** diff 계산이 수행됨
**Then** 2초 이내에 결과가 표시됨

---

### AC-NFR-002: 접근성 기준

#### Scenario 1: 키보드 탐색

**Given** 키보드만 사용 가능한 환경
**When** 사용자가 Tab 키로 에디터와 버튼을 탐색함
**Then** 모든 인터랙티브 요소에 접근 가능함

**검증 방법:**
```typescript
test('all interactive elements are keyboard accessible', () => {
  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);

  const saveButton = screen.getByRole('button', { name: /save/i });
  saveButton.focus();
  expect(saveButton).toHaveFocus();
});
```

#### Scenario 2: ARIA 라벨

**Given** 스크린 리더 사용자
**When** 에디터와 UI 요소를 탐색함
**Then** 모든 요소에 적절한 ARIA 라벨이 제공됨

**검증 방법:**
```typescript
test('editor has proper ARIA labels', () => {
  render(<EnhancedDocumentEditor initialContent="Test" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);
  const editor = screen.getByRole('textbox');
  expect(editor).toHaveAttribute('aria-label', expect.stringContaining('markdown editor'));
});
```

#### Scenario 3: 색상 대비율

**Given** WCAG 2.1 AA 표준
**When** 모든 UI 요소의 색상 대비율을 측정
**Then** 텍스트와 배경의 대비율이 4.5:1 이상임

---

### AC-NFR-003: 보안 기준

#### Scenario 1: XSS 방지

**Given** 악의적인 사용자가 HTML 태그를 포함한 마크다운을 입력
**When** 문서가 렌더링됨
**Then** 스크립트 태그가 실행되지 않음
**And** 안전한 HTML로 sanitize됨

**검증 방법:**
```typescript
test('sanitizes malicious HTML in markdown', () => {
  const maliciousContent = '# Test\n\n<script>alert("XSS")</script>';
  render(<DocumentPreview content={maliciousContent} />);

  const scriptTags = screen.container.querySelectorAll('script');
  expect(scriptTags.length).toBe(0);
});
```

#### Scenario 2: CSRF 보호

**Given** 인증된 사용자
**When** 버전 저장 API를 호출함
**Then** CSRF 토큰이 검증됨

---

## 통합 테스트 시나리오

### AC-INT-001: 전체 문서 편집 워크플로우

#### Scenario: 문서 생성부터 버전 비교까지

**Given** 사용자가 새 문서를 생성
**When** 사용자가 내용을 입력하고 자동 저장 대기
**Then** 문서가 저장되고 버전 1이 생성됨
**And** 사용자가 추가 수정 후 버전 2 생성
**And** 버전 1과 2를 비교 가능함

**검증 방법:**
```typescript
test('complete document editing workflow', async () => {
  const { user } = setup(<EnhancedDocumentEditor initialContent="" taskId="123" onSave={jest.fn()} onSaveStatusChange={jest.fn()} />);

  // 1. 첫 번째 내용 입력
  const editor = screen.getByRole('textbox');
  await user.type(editor, '# First Version');
  await waitFor(() => expect(screen.getByText(/saved/i)).toBeInTheDocument(), { timeout: 6000 });

  // 2. 두 번째 수정
  await user.clear(editor);
  await user.type(editor, '# Second Version\n\nAdded content');
  await waitFor(() => expect(screen.getByText(/saved/i)).toBeInTheDocument(), { timeout: 6000 });

  // 3. 버전 비교
  await user.click(screen.getByRole('button', { name: /versions/i }));
  await user.click(screen.getAllByRole('button', { name: /compare/i })[0]);

  expect(screen.getByText(/1 lines added/i)).toBeInTheDocument();
});
```

---

## 성공 지표

### 개발 완료 기준

- 모든 인수 기준(AC-EDIT-001 ~ AC-EDIT-008) 충족
- 비기능 요구사항(AC-NFR-001 ~ AC-NFR-003) 충족
- 테스트 커버리지 85% 이상
- 모든 시나리오 테스트 통과

### 사용자 경험 기준

- 에디터 로드 시간 < 1초
- 자동 저장 성공률 > 99%
- 버전 비교 응답 시간 < 2초
- 저장되지 않은 변경 손실률 < 1%

### 기술적 품질 기준

- TypeScript 오류 0개
- ESLint 경고 0개
- 접근성 WCAG 2.1 AA 준수
- 모든 주요 브라우저 호환

---

## 다음 단계

1. **각 인수 기준별 테스트 케이스 작성**: Jest + React Testing Library
2. **자동화된 테스트 스위트 구축**: CI/CD 파이프라인 통합
3. **수동 테스트 수행**: 크로스 브라우저, 접근성 테스트
4. **인수 테스트 통과**: 모든 AC 충족 확인
5. **프로덕션 릴리스**: 배포 및 모니터링

---

문서 버전: 1.0.0
마지막 수정: 2026-01-10
다음 리뷰: Phase 8 완료 후
