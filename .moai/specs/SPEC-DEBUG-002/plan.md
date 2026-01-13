# SPEC-DEBUG-002: Implementation Plan

## 1. Implementation Phases

### Phase 1: Preparation & Setup (준비 단계)

**목표 (Objective)**: 개발 환경 설정 및 기존 코드 분석

**작업 항목 (Tasks)**:
- Task 1.1: 기존 Debug Console 컴포넌트 구조 분석
- Task 1.2: Debug Console 상태 관리(store) 파악
- Task 1.3: 키보드 이벤트 처리 라이브러리 검토 (React 표준 hook vs 라이브러리)

**산출물 (Deliverables)**:
- 기존 컴포넌트 분석 문서
- 통합 전략 문서

### Phase 2: Core Hook Development (핵심 Hook 개발)

**목표 (Objective)**: 단축키 처리 커스텀 Hook 구현

**작업 항목 (Tasks)**:
- Task 2.1: `useDebugShortcut.ts` Hook 구현
- Task 2.2: 플랫폼별 키 조합 감지 로직 구현
- Task 2.3: 입력 필드 포커스 감지 로직 구현
- Task 2.4: 이벤트 리스너 등록/해제 관리 구현

**기술 명세 (Technical Specs)**:
```typescript
// Hook Signature
export function useDebugShortcut(
  toggleFn: () => void,
  config?: DebugShortcutConfig
): UseDebugShortcutReturn;
```

**산출물 (Deliverables)**:
- `src/hooks/useDebugShortcut.ts`

### Phase 3: State Management Integration (상태 관리 통합)

**목표 (Objective)**: Debug Console 상태와 단축키 연동

**작업 항목 (Tasks)**:
- Task 3.1: 기존 debugConsoleStore 분석 및 확장
- Task 3.2: 토글 함수 export/확장
- Task 3.3: Hook과 Store 통합 테스트

**산출물 (Deliverables)**:
- 업데이트된 `src/store/debugConsoleStore.ts`

### Phase 4: UI Component Enhancement (UI 컴포넌트 개선)

**목표 (Objective)**: 단축키 힌트 표시 및 통합

**작업 항목 (Tasks)**:
- Task 4.1: DebugConsoleToggle 컴포넌트에 단축키 힌트 추가
- Task 4.2: 플랫폼별 힌트 텍스트 분기 (Ctrl vs Cmd)
- Task 4.3: 단축키 비활성화 시 힌트 숨김 처리

**UI 명세 (UI Specs)**:
```
macOS:   [Debug] (Cmd+Alt+D)
Windows: [Debug] (Ctrl+Alt+D)
```

**산출물 (Deliverables)**:
- 업데이트된 `src/components/debug/DebugConsoleToggle.tsx`

### Phase 5: Integration & Wiring (통합 및 연결)

**목표 (Objective)**: 애플리케이션에 단축키 기능 통합

**작업 항목 (Tasks)**:
- Task 5.1: App 레벨 또는 적절한 컴포넌트에 Hook 적용
- Task 5.2: Debug Console 토글 버튼과 Hook 연결
- Task 5.3: 설정 페이지 연동 (단축키 활성화/비활성화)

**산출물 (Deliverables)**:
- 통합된 메인 컴포넌트

### Phase 6: Testing & QA (테스트 및 품질 보증)

**목표 (Objective)**: 전체 기능 테스트 및 버그 수정

**작업 항목 (Tasks)**:
- Task 6.1: 유닛 테스트 작성 (Hook 로직)
- Task 6.2: 통합 테스트 작성 (상태 관리)
- Task 6.3: E2E 테스트 작성 (사용자 시나리오)
- Task 6.4: 크로스 플랫폼 테스트 (macOS, Windows)
- Task 6.5: 접근성 테스트

**산출물 (Deliverables)**:
- `src/hooks/__tests__/useDebugShortcut.test.ts`
- `tests/store/debugConsoleStore.test.ts`
- 테스트 결과 보고서

---

## 2. Task Decomposition (상세 작업 분해)

### Task List

| ID | 작업명 | 우선순위 | 의존 | 예상 파일 |
|----|--------|----------|------|-----------|
| T-01 | 기존 Debug Console 분석 | P0 | - | Analysis Doc |
| T-02 | useDebugShortcut Hook 구현 | P0 | T-01 | src/hooks/useDebugShortcut.ts |
| T-03 | 플랫폼별 키 처리 구현 | P0 | T-02 | src/hooks/useDebugShortcut.ts |
| T-04 | 입력 필드 감지 로직 | P0 | T-02 | src/hooks/useDebugShortcut.ts |
| T-05 | debugConsoleStore 확장 | P0 | T-01 | src/store/debugConsoleStore.ts |
| T-06 | DebugConsoleToggle 개선 | P1 | T-02 | src/components/debug/DebugConsoleToggle.tsx |
| T-07 | 앱 레벨 통합 | P1 | T-02, T-05 | App.tsx |
| T-08 | 유닛 테스트 작성 | P1 | T-02 | src/hooks/__tests__/useDebugShortcut.test.ts |
| T-09 | 통합 테스트 작성 | P1 | T-05 | tests/store/debugConsoleStore.test.ts |
| T-10 | E2E 테스트 작성 | P2 | T-07 | tests/e2e/debugShortcut.spec.ts |

---

## 3. File Structure

### New Files

```
src/
└── hooks/
    ├── useDebugShortcut.ts                    # Main hook implementation
    └── __tests__/
        └── useDebugShortcut.test.ts           # Hook unit tests

tests/
└── e2e/
    └── debugShortcut.spec.ts                  # E2E tests
```

### Modified Files

```
src/
├── components/
│   └── debug/
│       └── DebugConsoleToggle.tsx             # Add shortcut hint
├── store/
│   └── debugConsoleStore.ts                   # Extend if needed
└── App.tsx                                    # Integrate hook
```

---

## 4. Risk Analysis

### Technical Risks

| 리스크 | 확률 | 영향 | 완화 전략 |
|--------|------|------|-----------|
| 기존 Debug Console와의 호환성 문제 | 중 | 중 | 철저한 기존 코드 분석, 테스트 커버리지 확보 |
| 플랫폼별 키 이벤트 차이로 인한 버그 | 중 | 중 | 각 플랫폼별 테스트, 조건부 로직 분리 |
| 입력 필드에서의 이벤트 중복 발생 | 낮 | 높 | activeElement 체크 강화, 포커스 트래킹 |
| 이벤트 리스너 메모리 누수 | 낮 | 중 | useEffect cleanup 엄격 관리 |
| 단축키 충돌 (브라우저/OS 기능) | 중 | 저 | 충돌 키 조합 조사, 대안 단축키 마련 |

### UX Risks

| 리스크 | 확률 | 영향 | 완화 전략 |
|--------|------|------|-----------|
| 단축키 발견 어려움 | 중 | 중 | UI 명시적 힌트, 온보딩 가이드 |
| 사용자가 단축키를 변경하고 싶음 | 중 | 저 | 향후 설정 UI 추가 계획 |

### Schedule Risks

| 리스크 | 확률 | 영향 | 완화 전략 |
|--------|------|------|-----------|
| 기존 코드 복잡도로 인한 분석 지연 | 중 | 중 | 사전 코드 파악 시간 충분 확보 |
| 테스트 환경 설정 문제 | 낮 | 저 | Playwright/Cypress 설정 사전 검토 |

---

## 5. Dependencies

### External Dependencies

```
react: ^18.x       # React framework
@testing-library:  # Testing utilities
```

### Internal Dependencies

```
src/store/debugConsoleStore.ts     # Console state management
src/components/debug/DebugConsole.tsx  # Main console component
```

---

## 6. Acceptance Criteria Checklist

- [ ] 단축키 입력 시 Debug Console이 토글된다
- [ ] 입력 필드 포커스 시 단축키가 동작하지 않는다
- [ ] macOS에서 Cmd+Alt+D가 동작한다
- [ ] Windows/Linux에서 Ctrl+Alt+D가 동작한다
- [ ] 토글 버튼에 단축키 힌트가 표시된다
- [ ] 컴포넌트 unmount 시 이벤트 리스너가 제거된다
- [ ] 모든 유닛 테스트가 통과한다
- [ ] 모든 E2E 테스트가 통과한다

---

## 7. Rollout Plan

### Phase 1: Internal Testing (1일)
- 개발자 테스트
- 유닛/통합 테스트 실행

### Phase 2: User Acceptance Testing (1일)
- 내부 사용자 테스트
- 피드백 수집

### Phase 3: Deployment (본 릴리즈에 포함)
- 기능 플래그로 관리 가능성 검토
- 릴리즈 노트 작성

---

## 8. Future Enhancements

1. **사용자 정의 단축키**: 설정 페이지에서 단축키 변경 기능
2. **다중 단축키 지원**: 여러 단축키 조합 등록
3. **단축키 도움말**: 단축키 목록 표시 패널
4. **음성 안내**: 스크린 리더용 단축키 변경 안내
