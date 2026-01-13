# 인수 테스트 (Acceptance Tests)

## 개요 (Overview)

본 문서는 SPEC-DOCEDIT-002의 인수 테스트 시나리오를 정의합니다. Given/When/Then 형식을 사용하여 테스트 케이스를 명확하게 기술합니다.

## 성공 기준 (Success Criteria)

1. **순환 참조 제거**: Webpack 빌드 시 순환 참조 경고가 발생하지 않아야 함
2. **정상 렌더링**: 애플리케이션이 하얀 화면 없이 정상적으로 렌더링되어야 함
3. **테스트 통과**: 모든 단위 테스트 및 통합 테스트가 통과해야 함
4. **타입 호환성**: 기존 SaveStatus 타입을 사용하는 모든 코드가 정상 작동해야 함

## 테스트 시나리오 (Test Scenarios)

### 시나리오 1: 순환 참조 감지 제거

**설명**: EnhancedDocumentEditor와 SaveStatusIndicator 간의 순환 참조가 제거되었는지 확인합니다.

#### Given/When/Then

**Given** (사전 조건):
- 애플리케이션이 빌드 가능한 상태로 준비되어 있다
- types.ts 파일이 src/components/document/ 경로에 생성되어 있다
- SaveStatus 타입이 types.ts에 정의되어 있다

**When** (실행 동작):
- Webpack이 애플리케이션을 번들링할 때
- TypeScript 컴파일러가 타입 검증을 수행할 때

**Then** (예상 결과):
- 순환 참조 경고(circular dependency warning)가 출력되지 않아야 한다
- 빌드 프로세스가 성공적으로 완료되어야 한다
- EnhancedDocumentEditor와 SaveStatusIndicator가 독립적으로 로드되어야 한다

```typescript
// 검증 방법
describe('Scenario 1: Circular Dependency Removal', () => {
  it('should build without circular dependency warnings', async () => {
    const buildResult = await runBuild();
    expect(buildResult.warnings).not.toContain('circular dependency');
    expect(buildResult.success).toBe(true);
  });
});
```

---

### 시나리오 2: 컴포넌트 정상 렌더링

**설명**: 순환 참조 제거 후 컴포넌트가 정상적으로 렌더링되는지 확인합니다.

#### Given/When/Then

**Given** (사전 조건):
- 애플리케이션이 실행 중인 상태이다
- EnhancedDocumentEditor 컴포넌트가 페이지에 마운트되어 있다
- SaveStatus 타입이 types.ts에서 import 되어 있다

**When** (실행 동작):
- 사용자가 EnhancedDocumentEditor가 포함된 페이지에 접속할 때
- 컴포넌트가 초기 렌더링을 수행할 때

**Then** (예상 결과):
- 페이지가 정상적으로 렌더링되어야 한다
- 하얀 화면(Blank Screen)이 표시되지 않아야 한다
- EnhancedDocumentEditor의 모든 UI 요소가 표시되어야 한다
- SaveStatusIndicator가 올바른 상태를 표시해야 한다

```typescript
// 검증 방법
describe('Scenario 2: Component Rendering', () => {
  it('should render EnhancedDocumentEditor without blank screen', () => {
    const { container } = render(<EnhancedDocumentEditor />);
    expect(container.firstChild).not.toBeNull();
    expect(container.textContent?.length).toBeGreaterThan(0);
  });

  it('should display SaveStatusIndicator correctly', () => {
    const saveStatus: SaveStatus = { status: 'idle' };
    const { getByText } = render(<SaveStatusIndicator saveStatus={saveStatus} />);
    expect(getByText(/저장됨|저장 중|대기 중/)).toBeInTheDocument();
  });
});
```

---

## 엣지 케이스 테스트 (Edge Case Tests)

### 엣지 케이스 1: 모든 SaveStatus 상태 값

**설명**: SaveStatus 타입의 모든 가능한 상태 값이 정상 처리되는지 확인합니다.

#### Given/When/Then

**Given** (사전 조건):
- SaveStatus 타입이 types.ts에서 import 되어 있다
- SaveStatusIndicator 컴포넌트가 준비되어 있다

**When** (실행 동작):
- 각각의 상태 값('idle', 'saving', 'saved', 'error')으로 컴포넌트를 렌더링할 때

**Then** (예상 결과):
- 'idle' 상태가 올바르게 표시되어야 한다
- 'saving' 상태가 로딩 인디케이터와 함께 표시되어야 한다
- 'saved' 상태가 성공 메시지로 표시되어야 한다
- 'error' 상태가 에러 메시지와 함께 표시되어야 한다

```typescript
describe('Edge Case 1: All SaveStatus Values', () => {
  const statuses: SaveStatus['status'][] = ['idle', 'saving', 'saved', 'error'];

  statuses.forEach((status) => {
    it(`should handle status: ${status}`, () => {
      const saveStatus: SaveStatus = { status };
      const { container } = render(<SaveStatusIndicator saveStatus={saveStatus} />);
      expect(container).toHaveTextContent(/./); // 내용이 존재해야 함
    });
  });
});
```

---

### 엣지 케이스 2: 선택적 필드 처리

**설명**: SaveStatus 타입의 선택적 필드(lastSaved, error)가 올바르게 처리되는지 확인합니다.

#### Given/When/Then

**Given** (사전 조건):
- SaveStatus 타입이 types.ts에서 정의되어 있다
- 선택적 필드가 포함된 데이터 구조가 준비되어 있다

**When** (실행 동작):
- lastSaved 필드가 있는 SaveStatus 객체로 렌더링할 때
- error 필드가 있는 SaveStatus 객체로 렌더링할 때
- 모든 필드가 없는 최소 SaveStatus 객체로 렌더링할 때

**Then** (예상 결과):
- lastSaved가 있을 때 마지막 저장 시간이 표시되어야 한다
- error가 있을 때 에러 메시지가 표시되어야 한다
- 선택적 필드가 없어도 컴포넌트가 렌더링되어야 한다

```typescript
describe('Edge Case 2: Optional Fields', () => {
  it('should render with lastSaved field', () => {
    const saveStatus: SaveStatus = {
      status: 'saved',
      lastSaved: new Date('2026-01-11T10:00:00')
    };
    const { container } = render(<SaveStatusIndicator saveStatus={saveStatus} />);
    expect(container).toHaveTextContent(/2026-01-11|10:00/);
  });

  it('should render with error field', () => {
    const saveStatus: SaveStatus = {
      status: 'error',
      error: 'Network error'
    };
    const { container } = render(<SaveStatusIndicator saveStatus={saveStatus} />);
    expect(container).toHaveTextContent(/Network error/);
  });

  it('should render minimal SaveStatus object', () => {
    const saveStatus: SaveStatus = { status: 'idle' };
    const { container } = render(<SaveStatusIndicator saveStatus={saveStatus} />);
    expect(container.firstChild).not.toBeNull();
  });
});
```

---

### 엣지 케이스 3: 타입 import 독립성

**설명**: 각 컴포넌트가 독립적으로 타입을 import 할 수 있는지 확인합니다.

#### Given/When/Then

**Given** (사전 조건):
- types.ts 파일이 존재하고 SaveStatus 타입이 정의되어 있다
- EnhancedDocumentEditor와 SaveStatusIndicator가 서로를 import 하지 않은 상태이다

**When** (실행 동작):
- EnhancedDocumentEditor만 단독으로 import 할 때
- SaveStatusIndicator만 단독으로 import 할 때
- 두 컴포넌트를 동시에 import 할 때

**Then** (예상 결과):
- 각 컴포넌트가 독립적으로 import 될 때 에러가 발생하지 않아야 한다
- 두 컴포넌트를 동시에 import 할 때 순환 참조가 발생하지 않아야 한다

```typescript
describe('Edge Case 3: Import Independence', () => {
  it('should import EnhancedDocumentEditor independently', async () => {
    const module = await import('./EnhancedDocumentEditor');
    expect(module.EnhancedDocumentEditor).toBeDefined();
  });

  it('should import SaveStatusIndicator independently', async () => {
    const module = await import('./SaveStatusIndicator');
    expect(module.SaveStatusIndicator).toBeDefined();
  });

  it('should import both components without circular dependency', async () => {
    const [editorModule, indicatorModule] = await Promise.all([
      import('./EnhancedDocumentEditor'),
      import('./SaveStatusIndicator')
    ]);
    expect(editorModule.EnhancedDocumentEditor).toBeDefined();
    expect(indicatorModule.SaveStatusIndicator).toBeDefined();
  });
});
```

---

### 엣지 케이스 4: 핫 모듈 재배치(HMR)

**설명**: 개발 중 핫 모듈 재배치 시 순환 참조가 재발하지 않는지 확인합니다.

#### Given/When/Then

**Given** (사전 조건):
- 개발 서버가 실행 중인 상태이다
- HMR(Hot Module Replacement)이 활성화되어 있다

**When** (실행 동작):
- types.ts 파일을 수정하고 저장할 때
- EnhancedDocumentEditor.tsx를 수정하고 저장할 때
- SaveStatusIndicator.tsx를 수정하고 저장할 때

**Then** (예상 결과):
- HMR이 정상적으로 수행되어야 한다
- 페이지가 새로고침되지 않아야 한다(preserve state)
- 콘솔에 순환 참조 경고가 출력되지 않아야 한다

---

## 자동화된 테스트 실행 (Automated Test Execution)

### 테스트 스크립트

```bash
# 단위 테스트 실행
npm test -- src/components/document/__tests__/circularDependency.test.ts

# 타입 검증
npx tsc --noEmit

# 빌드 테스트 (순환 참조 감지)
npm run build

# 커버리지 확인
npm test -- --coverage --collectCoverageFrom=src/components/document/*
```

### CI/CD 파이프라인 통합

```yaml
# .github/workflows/test-docedit-002.yml
name: SPEC-DOCEDIT-002 Tests

on:
  pull_request:
    paths:
      - 'src/components/document/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test -- --coverage

      - name: Build check
        run: npm run build

      - name: Check for circular dependencies
        run: |
          if grep -r "circular dependency" dist/; then
            echo "Circular dependency detected!"
            exit 1
          fi
```

---

## 인수 체크리스트 (Acceptance Checklist)

개발 완료 후 다음 항목을 모두 확인하세요:

- [ ] 빌드 시 순환 참조 경고가 발생하지 않는다
- [ ] TypeScript 컴파일 에러가 없다
- [ ] 애플리케이션이 하얀 화면 없이 정상 렌더링된다
- [ ] EnhancedDocumentEditor 컴포넌트가 정상 작동한다
- [ ] SaveStatusIndicator 컴포넌트가 정상 작동한다
- [ ] 모든 SaveStatus 상태 값이 올바르게 표시된다
- [ ] 선택적 필드(lastSaved, error)가 올바르게 처리된다
- [ ] 각 컴포넌트가 독립적으로 import 가능하다
- [ ] HMR 환경에서 순환 참조가 재발하지 않는다
- [ ] 모든 단위 테스트가 통과한다
- [ ] 테스트 커버리지가 85% 이상이다
- [ ] ESLint 규칙을 준수한다
- [ ] 코드가 Prettier로 포맷팅되었다

---

## 문서화 (Documentation)

변경 사항에 대한 문서화 항목:

- [ ] types.ts 파일에 JSDoc 주석이 추가되었다
- [ ] 마이그레이션 가이드가 작성되었다 (필요 시)
- [ ] CHANGELOG.md에 변경 내용이 기록되었다
- [ ] 관련 SPEC 문서가 업데이트되었다
