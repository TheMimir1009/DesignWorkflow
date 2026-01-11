---
id: SPEC-DOCEDIT-002
version: 1.0.0
status: draft
created: 2026-01-11
updated: 2026-01-11
author: User
priority: HIGH
title: 순환 참조 수정 (Circular Dependency Fix)
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-11 | User | 초안 작성 |

## 문제 정의 (Problem Statement)

### 배경

EnhancedDocumentEditor와 SaveStatusIndicator 컴포넌트 간의 순환 참조(Circular Dependency)로 인해 애플리케이션이 하얀 화면(Blank Screen) 상태로 렌더링되지 않는 문제가 발생합니다.

### 순환 참조 구조

```
EnhancedDocumentEditor.tsx
         ↓ (imports)
    SaveStatusIndicator.tsx
         ↓ (imports SaveStatus type)
    EnhancedDocumentEditor.tsx
```

### 영향

- 사용자 인터페이스가 렌더링되지 않음
- 애플리케이션이 정상적으로 작동하지 않음
- 개발자 콘솔에서 순환 참조 경고 발생

### 원인 분석

SaveStatus 타입이 EnhancedDocumentEditor 파일에 정의되어 있고, SaveStatusIndicator 컴포넌트가 이 타입을 import 하여 사용합니다. 동시에 EnhancedDocumentEditor는 SaveStatusIndicator 컴포넌트를 import 하여 사용합니다. 이러한 상호 의존 관계가 순환 참조를 발생시킵니다.

## 해결 방안 (Solution)

### 접근 방식

SaveStatus 타입을 별도의 `types.ts` 파일로 분리하여 순환 참조를 제거합니다. 이를 통해 두 컴포넌트가 독립적으로 타입을 import 할 수 있습니다.

### 아키텍처 변경

```
변경 전:
EnhancedDocumentEditor.tsx ←→ SaveStatusIndicator.tsx

변경 후:
           types.ts
              ↑
              ↑
  EnhancedDocumentEditor.tsx  SaveStatusIndicator.tsx
```

## 요구사항 (Requirements)

### EARS 형식 요구사항

#### Ubiquitous (전역 요구사항)

1. **WHEN** 애플리케이션이 로드될 때, **THE SYSTEM SHALL** 하얀 화면 없이 정상적으로 렌더링되어야 한다.

2. **WHILE** 컴포넌트 간의 타입 공유가 필요할 때, **THE SYSTEM SHALL** 순환 참조 없이 타입을 import 할 수 있어야 한다.

#### Event-driven (이벤트 기반)

3. **WHEN** SaveStatusIndicator 컴포넌트가 SaveStatus 타입을 필요로 할 때, **THE SYSTEM SHALL** 별도의 types 파일에서 타입을 제공해야 한다.

4. **WHEN** EnhancedDocumentEditor 컴포넌트가 렌더링될 때, **THE SYSTEM SHALL** 순환 참조 경고 없이 컴포넌트를 로드해야 한다.

#### State-driven (상태 기반)

5. **WHILE** 타입 재구성이 진행되는 동안, **THE SYSTEM SHALL** 기존 기능에 대한 호환성을 유지해야 한다.

#### Unwanted (금지 사항)

6. **THE SYSTEM SHALL NOT** 타입 분리 후에도 순환 참조 경고를 발생시켜서는 안 된다.

7. **THE SYSTEM SHALL NOT** 기존 SaveStatus 타입의 구조를 변경하여 기존 코드와의 호환성을 깨서는 안 된다.

#### Optional (선택 사항)

8. **WHERE POSSIBLE**, 타입 정의를 위해 TypeScript의 `type` 대신 `interface`를 사용하여 확장성을 확보해야 한다.

9. **WHERE POSSIBLE**, 관련 타입들을 하나의 types/barrel 파일로 통합하여 import 편의성을 높여야 한다.

## 기술적 사항 (Technical Details)

### 관련 파일

| 파일 경로 | 변경 유형 | 설명 |
|-----------|-----------|------|
| `src/components/document/types.ts` | 생성 | SaveStatus 타입 정의 |
| `src/components/document/EnhancedDocumentEditor.tsx` | 수정 | types.ts에서 SaveStatus import |
| `src/components/document/SaveStatusIndicator.tsx` | 수정 | types.ts에서 SaveStatus import |

### 타입 정의

```typescript
// types.ts
export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}
```

## 성공 기준 (Success Criteria)

1. 빌드 시 순환 참조 경고가 발생하지 않아야 한다
2. 애플리케이션이 정상적으로 렌더링되어야 한다
3. 모든 관련 테스트가 통과해야 한다
4. SaveStatus 타입을 사용하는 모든 컴포넌트가 정상적으로 동작해야 한다

## 참고 (References)

- Circular Dependency 문서: https://webpack.js.org/guides/tree-shaking/#circular-dependencies
- TypeScript Module Resolution: https://www.typescriptlang.org/docs/handbook/modules/theory.html#module-resolution
