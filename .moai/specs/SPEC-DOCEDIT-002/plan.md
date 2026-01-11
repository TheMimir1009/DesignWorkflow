# 구현 계획 (Implementation Plan)

## 개요 (Overview)

본 문서는 SPEC-DOCEDIT-002의 구현 계획을 상세하게 기술합니다. TDD 접근 방식(RED-GREEN-REFACTOR)을 따르며, 순환 참조 문제를 해결하기 위한 단계별 작업을 정의합니다.

## TDD 접근 방식 (TDD Approach)

### RED 단계: 실패하는 테스트 작성

1. 순환 참조 감지 테스트 작성
2. 타입 import 테스트 작성
3. 컴포넌트 렌더링 테스트 작성

### GREEN 단계: 최소한의 구현

1. types.ts 파일 생성
2. 타입 이동 및 import 수정
3. 모든 테스트 통과 확인

### REFACTOR 단계: 코드 개선

1. 불필요한 import 제거
2. 타입 정의 최적화
3. 코드 정리 및 포맷팅

## 작업 분해 (Task Breakdown)

### Phase 1: 준비 단계 (Preparation)

#### 1.1 영향받는 파일 분석

**목표**: 순환 참조에 관련된 모든 파일과 의존성을 식별합니다.

**작업**:
- EnhancedDocumentEditor.tsx 파일 분석
- SaveStatusIndicator.tsx 파일 분석
- 현재 SaveStatus 타입 정의 확인
- import 구조 파악

**산출물**: 의존성 분석 문서

#### 1.2 테스트 환경 설정

**목표**: 순환 참조 감지를 위한 테스트 환경을 구축합니다.

**작업**:
- 테스트 파일 생성 경로 확인
- 필요한 테스트 유틸리티 import
- 순환 참조 감지 헬퍼 함수 준비

**산출물**: 테스트 스켈레톤 파일

### Phase 2: RED 단계 - 실패하는 테스트 작성

#### 2.1 순환 참조 감지 테스트

**파일**: `src/components/document/__tests__/circularDependency.test.ts`

**테스트 케이스**:

```typescript
describe('Circular Dependency Detection', () => {
  it('should not detect circular dependency between EnhancedDocumentEditor and SaveStatusIndicator', () => {
    // 순환 참조가 없는지 확인
  });

  it('should allow independent import of SaveStatus type', () => {
    // SaveStatus 타입이 독립적으로 import 가능한지 확인
  });
});
```

#### 2.2 타입 정의 테스트

**테스트 케이스**:

```typescript
describe('SaveStatus Type', () => {
  it('should have correct structure', () => {
    // SaveStatus 타입 구조 확인
  });

  it('should support all status values', () => {
    // 'idle' | 'saving' | 'saved' | 'error' 값 확인
  });

  it('should support optional fields', () => {
    // lastSaved, error 선택적 필드 확인
  });
});
```

#### 2.3 컴포넌트 통합 테스트

**테스트 케이스**:

```typescript
describe('Component Integration', () => {
  it('should render EnhancedDocumentEditor without circular dependency', () => {
    // 컴포넌트 렌더링 테스트
  });

  it('should render SaveStatusIndicator with imported type', () => {
    // SaveStatusIndicator 렌더링 테스트
  });
});
```

### Phase 3: GREEN 단계 - 구현

#### 3.1 types.ts 파일 생성

**파일**: `src/components/document/types.ts`

**구현 내용**:

```typescript
/**
 * Document save status type definition
 * Extracted from EnhancedDocumentEditor to resolve circular dependency
 */

export interface SaveStatus {
  /** Current save state */
  status: 'idle' | 'saving' | 'saved' | 'error';
  /** Timestamp of last successful save */
  lastSaved?: Date;
  /** Error message if save failed */
  error?: string;
}

/**
 * Props for save status display components
 */
export interface SaveStatusDisplayProps {
  /** Current save status */
  saveStatus: SaveStatus;
  /** Optional custom class name */
  className?: string;
}
```

#### 3.2 EnhancedDocumentEditor.tsx 수정

**변경 사항**:
- 기존 SaveStatus 타입 정의 제거
- types.ts에서 SaveStatus import
- 다른 import 문 정리

**변경 전**:
```typescript
// EnhancedDocumentEditor.tsx 내부
interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

import { SaveStatusIndicator } from './SaveStatusIndicator';
```

**변경 후**:
```typescript
import { SaveStatus } from './types';
import { SaveStatusIndicator } from './SaveStatusIndicator';
```

#### 3.3 SaveStatusIndicator.tsx 수정

**변경 사항**:
- EnhancedDocumentEditor에서 타입 import 제거
- types.ts에서 SaveStatus import

**변경 전**:
```typescript
import type { SaveStatus } from './EnhancedDocumentEditor';
```

**변경 후**:
```typescript
import type { SaveStatus } from './types';
```

### Phase 4: REFACTOR 단계 - 개선

#### 4.1 불필요한 import 제거

**확인 항목**:
- 사용되지 않는 import 제거
- import 순서 정리 (TypeScript 스타일 가이드 준수)
- type import 명시화

#### 4.2 타입 정의 최적화

**확인 항목**:
- 타입 명명 규칙 준수
- JSDoc 주석 완성도
- 타입 확장성 고려

#### 4.3 코드 정리

**확인 항목**:
- ESLint 규칙 준수
- Prettier 포맷팅
- 일관된 들여쓰기

## 파일 수정 목록 (File Modification List)

| 순서 | 파일 경로 | 작업 유형 | 설명 |
|------|-----------|-----------|------|
| 1 | `src/components/document/types.ts` | 생성 | SaveStatus 타입 정의 |
| 2 | `src/components/document/EnhancedDocumentEditor.tsx` | 수정 | 타입 import 변경 |
| 3 | `src/components/document/SaveStatusIndicator.tsx` | 수정 | 타입 import 변경 |
| 4 | `src/components/document/__tests__/circularDependency.test.ts` | 생성 | 순환 참조 감지 테스트 |
| 5 | `src/components/document/__tests__/types.test.ts` | 생성 | 타입 정의 테스트 |

## 의존성 관계 (Dependencies)

```
[테스트 작성] → [types.ts 생성] → [import 수정] → [검증]
     ↑                                                    ↓
     └───────────────────── [실패 시 재작성] ←──────────────┘
```

### 작업 순서

1. 테스트 파일 생성 (순환 참조 감지)
2. types.ts 파일 생성
3. EnhancedDocumentEditor.tsx 수정
4. SaveStatusIndicator.tsx 수정
5. 테스트 실행 및 검증
6. 실패 시 2-4단계 반복

## 검증 계획 (Validation Plan)

### 정적 분석

1. **TypeScript 컴파일**
   ```bash
   tsc --noEmit
   ```
   - 타입 에러 없는지 확인
   - 순환 참조 경고 없는지 확인

2. **Webpack 모듈 분석**
   ```bash
   npm run build -- --analyze
   ```
   - 번들 크기 확인
   - 모듈 의존성 그래프 확인

### 런타임 테스트

1. **단위 테스트 실행**
   ```bash
   npm test -- circularDependency
   npm test -- types
   ```

2. **통합 테스트 실행**
   ```bash
   npm test -- --coverage
   ```

### 수동 검증

1. 애플리케이션 시작
2. EnhancedDocumentEditor가 포함된 페이지 접속
3. 하얀 화면이 아닌 정상적인 UI 확인
4. 개발자 콘솔에서 경고 메시지 확인

## 위험 완화 (Risk Mitigation)

### 식별된 위험

1. **타입 불일치**: 타입 분리 과정에서 기존 코드와의 호환성 문제 발생 가능
   - 완화: 기존 타입 구조를 그대로 유지

2. **누락된 import**: 타입 이동 후 import 누락 가능
   - 완화: TypeScript 컴파일러 검증 활용

3. **기능 회귀**: 타입 변경으로 인한 런타임 오류 가능
   - 완화: 포괄적인 테스트 커버리지 유지

### 롤백 계획

문제 발생 시 다음 단계로 롤백:
1. types.ts 파일 삭제
2. EnhancedDocumentEditor.tsx에 타입 정의 복원
3. SaveStatusIndicator.tsx의 import 복원

## 완료 기준 (Completion Criteria)

- [ ] 모든 테스트가 통과한다
- [ ] TypeScript 컴파일 에러가 없다
- [ ] Webpack 빌드 시 순환 참조 경고가 없다
- [ ] 애플리케이션이 정상적으로 렌더링된다
- [ ] 코드가 ESLint 규칙을 준수한다
- [ ] 변경 사항이 문서화되었다
