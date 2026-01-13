---
id: SPEC-DEBUG-002
version: 1.1.0
status: completed
completed: "2026-01-12"
created: 2025-01-11
updated: 2026-01-12
author: MoAI-ADK
priority: medium
parent: null
tags: [debug, keyboard, shortcut, console, toggle]
---

# SPEC-DEBUG-002: 키보드 단축키 Debug Console 토글

## 1. Overview

### 1.1 Purpose
사용자가 키보드 단축키를 통해 Debug Console을 빠르게 표시/숨김 전환할 수 있는 기능을 구현합니다. 이는 개발자 경험을 개선하고 디버깅 작업 효율을 높이는 것을 목표로 합니다.

### 1.2 Scope
- 키보드 단축키 조합 감지 (Ctrl/Cmd + Alt + D)
- Debug Console 표시 상태 토글
- 접근성 고려한 단축키 설정 가능성
- 기존 Debug Console 컴포넌트와의 통합

### 1.3 Background
현재 Debug Console을 표시하기 위해 마우스로 버튼을 클릭해야 하며, 빈번한 디버깅 작업에서 이는 상당한 비효율을 초래합니다. VS Code, Chrome DevTools 등 주요 개발 도구들이 키보드 단축키를 제공하는 것처럼, 본 애플리케이션도 유사한 UX를 제공해야 합니다.

---

## 2. Requirements (EARS Format)

### 2.1 Ubiquitous Language (보편 용어)

| 용어 (Term) | 정의 (Definition) |
|------------|-------------------|
| Debug Console | 디버깅 정보를 표시하는 개발자 전용 패널 컴포넌트 |
| Toggle | 상태를 반전시키는 동작 (표시/숨김 전환) |
| Keyboard Shortcut | 키보드 조합으로 실행하는 명령 |
| Modifiers | Ctrl, Cmd, Alt, Shift 등 보조 키 |

### 2.2 Requirement Specifications

#### 2.2.1 Preserve Requirements (유지 요구사항)

**WHEN** 시스템이 정상 실행 중일 때, **THE SYSTEM SHALL** 기존 Debug Console의 모든 기능을 유지한다.

**WHILE** 사용자가 단축키 기능을 사용할 때, **THE SYSTEM SHALL** 기존 버튼 클릭 방식도 동시에 지원한다.

#### 2.2.2 Prevent Requirements (방지 요구사항)

**WHERE** 사용자가 단축키를 입력할 때, **THE SYSTEM SHALL PREVENT** 입력 필드에서의 키 조합이 Debug Console을 토글하지 않는다.

**IF** 사용자가 input/textarea 요소에 포커스되어 있다면, **THE SYSTEM SHALL PREVENT** 단축키가 동작하여 입력 방해가 발생하는 것을 막는다.

#### 2.2.3 Response Requirements (응답 요구사항)

**DURING** 단축키가 감지되었을 때, **THE SYSTEM SHALL** Debug Console 상태를 즉시 전환한다.

**WHEN** 사용자가 단축키를 입력하면, **THE SYSTEM SHALL** 100ms 이내에 토글 동작을 완료한다.

#### 2.2.4 Enable Requirements (활성화 요구사항)

**WHEN** 사용자가 설정에서 Debug Console 단축키를 활성화하면, **THE SYSTEM SHALL** 키보드 이벤트 리스너를 등록한다.

**IF** 사용자가 단축키를 비활성화하면, **THE SYSTEM SHALL** 관련 이벤트 리스너를 제거한다.

#### 2.2.5 If-Then Requirements (조건-결과 요구사항)

**IF** `Ctrl/Cmd + Alt + D` 조합이 감지되고 입력 필드에 포커스가 없다면, **THEN** 시스템은 Debug Console을 토글한다.

**IF** macOS 환경이라면, **THEN** `Cmd + Alt + D`를 단축키로 사용한다.

**IF** Windows/Linux 환경이라면, **THEN** `Ctrl + Alt + D`를 단축키로 사용한다.

**IF** Debug Console이 현재 숨겨진 상태라면, **THEN** 단축키 입력 후 Console을 표시한다.

**IF** Debug Console이 현재 표시된 상태라면, **THEN** 단축키 입력 후 Console을 숨긴다.

---

## 3. UI/UX Specifications

### 3.1 Visual Design

#### 3.1.1 Shortcut Hint
단축키 정보를 기존 Debug Console 토글 버튼에 힌트로 표시합니다:

```
┌─────────────────────────────────────┐
│  [Debug] (Ctrl+Alt+D)               │
└─────────────────────────────────────┘
```

### 3.2 Interaction Design

#### 3.2.1 Toggle Behavior
```
┌──────────────────────────────────────────────────────────┐
│                    User Action Flow                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   User presses Ctrl+Alt+D                               │
│           │                                              │
│           ▼                                              │
│   Check: Is focus on input field?                       │
│           │                                              │
│           ├── Yes → Ignore shortcut                      │
│           │                                              │
│           └── No → Toggle Console State                  │
│                      │                                   │
│                      ▼                                   │
│              Update UI immediately                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### 3.2.2 Keyboard Event Handling Flow
```
┌──────────────────────────────────────────────────────────┐
│                  Event Propagation                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   1. Global keydown event captured                      │
│                                                          │
│   2. Check modifier keys (Ctrl/Cmd + Alt)               │
│                                                          │
│   3. Check main key (D)                                 │
│                                                          │
│   4. Verify active element (not input/textarea)         │
│                                                          │
│   5. Execute toggle action                              │
│                                                          │
│   6. Prevent default behavior                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Platform-Specific Behavior

| 플랫폼 | 단축키 | 비고 |
|--------|--------|------|
| macOS | Cmd + Alt + D | Cmd 키 사용 |
| Windows | Ctrl + Alt + D | Ctrl 키 사용 |
| Linux | Ctrl + Alt + D | Ctrl 키 사용 |

---

## 4. Technical Architecture

### 4.1 Component Structure

```
src/
├── hooks/
│   └── useDebugShortcut.ts      # Keyboard shortcut hook
├── components/
│   └── debug/
│       └── DebugConsoleToggle.tsx  # Enhanced toggle button
└── store/
    └── debugConsoleStore.ts      # Console state management
```

### 4.2 Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Keyboard   │────▶│     Hook     │────▶│    Store     │
│    Event     │     │ useDebug...  │     │   Console    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │     UI       │
                                          │   Console    │
                                          └──────────────┘
```

### 4.3 Interface Definition

```typescript
// Keyboard Shortcut Configuration
interface DebugShortcutConfig {
  key: string;           // 'd'
  modifiers: {
    ctrl?: boolean;
    meta?: boolean;      // Cmd on macOS
    alt?: boolean;
    shift?: boolean;
  };
  enabled: boolean;
}

// Hook Return Value
interface UseDebugShortcutReturn {
  isSupported: boolean;
  isListening: boolean;
  register: () => void;
  unregister: () => void;
}
```

### 4.4 Event Handler Logic

```
┌──────────────────────────────────────────────────────────┐
│              Key Event Handler Logic                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  function handleKeyDown(event: KeyboardEvent): void {   │
│                                                          │
│    // 1. Check modifier keys                            │
│    const hasCorrectModifiers =                          │
│      (event.ctrlKey || event.metaKey) && event.altKey;  │
│                                                          │
│    // 2. Check main key                                 │
│    const isCorrectKey = event.key.toLowerCase() === 'd'; │
│                                                          │
│    // 3. Check active element                           │
│    const activeElement = document.activeElement;        │
│    const isInputFocused =                               │
│      activeElement?.tagName === 'INPUT' ||              │
│      activeElement?.tagName === 'TEXTAREA';             │
│                                                          │
│    // 4. Execute conditionally                          │
│    if (hasCorrectModifiers && isCorrectKey &&           │
│        !isInputFocused) {                               │
│      toggleDebugConsole();                              │
│      event.preventDefault();                            │
│    }                                                    │
│  }                                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Notes

### 5.1 Browser Compatibility

| 기능 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| KeyboardEvent | Full | Full | Full | Full |
| metaKey | Full | Full | Full | Full |
| preventDefault | Full | Full | Full | Full |

### 5.2 Accessibility Considerations

1. **키보드 네비게이션 지원**: 단축키가 키보드 접근성을 저해하지 않아야 함
2. **스크린 리더 알림**: Console 토글 시 스크린 리더 사용자에게 상태 변경 알림
3. **사용자 정의**: 접근성 요구에 따라 단축키 변경 가능

### 5.3 Performance Considerations

1. **이벤트 리스너 최적화**: 전역 리스너 사용 시 불필요한 처리 방지
2. **디바운싱 불필요**: 단축키는 즉시 응답 필요
3. **메모리 관리**: 컴포넌트 unmount 시 리스너 제거 필수

---

## 6. Related Specifications

- **SPEC-DEBUG-001**: Debug Console 기본 기능 명세
- **SPEC-KANBAN-001**: Kanban Board 컴포넌트 구조
- **SPEC-SYSTEM-001**: 전역 시스템 아키텍처

---

## 7. Version History

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|----------|--------|
| 1.1.0 | 2026-01-12 | 구현 완료, 상태 변경 (draft -> completed) | MoAI-ADK |
| 1.0.0 | 2025-01-11 | 초기 초안 작성 | MoAI-ADK |
