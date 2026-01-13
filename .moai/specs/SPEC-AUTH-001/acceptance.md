# SPEC-AUTH-001: Acceptance Criteria

---
spec_id: SPEC-AUTH-001
version: "1.0.0"
status: "draft"
created: "2026-01-07"
updated: "2026-01-07"
---

## Overview

Multi-User Authentication with Project Access Control 시스템의 인수 기준.

## Test Scenarios

### Feature: User Registration

```gherkin
Scenario: 새 사용자 등록 성공
  Given 등록되지 않은 이메일 "newuser@example.com"
  When 사용자가 이름 "New User", 이메일 "newuser@example.com", 비밀번호 "Password123"으로 등록을 시도하면
  Then 새 계정이 생성되어야 한다
  And 응답 상태 코드는 201이어야 한다
  And 사용자에게 기본 권한(Viewer)이 부여되어야 한다
  And 비밀번호는 bcrypt로 해시되어 저장되어야 한다

Scenario: 중복 이메일로 등록 시도
  Given 이미 등록된 이메일 "existing@example.com"
  When 사용자가 같은 이메일로 등록을 시도하면
  Then 응답 상태 코드는 409 (Conflict)이어야 한다
  And 에러 메시지 "Email already exists"가 반환되어야 한다

Scenario: 유효하지 않은 이메일 형식
  Given 등록 폼이 표시됨
  When 사용자가 이메일 "invalid-email"로 등록을 시도하면
  Then 응답 상태 코드는 400이어야 한다
  And 에러 메시지 "Invalid email format"이 반환되어야 한다

Scenario: 비밀번호 정책 미충족
  Given 등록 폼이 표시됨
  When 사용자가 비밀번호 "short"로 등록을 시도하면
  Then 응답 상태 코드는 400이어야 한다
  And 에러 메시지 "Password must be at least 8 characters"가 반환되어야 한다
```

### Feature: User Login

```gherkin
Scenario: 로그인 성공
  Given 등록된 사용자 "user@example.com" (비밀번호: "Password123")
  When 올바른 이메일과 비밀번호로 로그인하면
  Then 응답 상태 코드는 200이어야 한다
  And JWT 토큰이 발급되어야 한다
  And 토큰에 사용자 ID, 이메일, 역할이 포함되어야 한다
  And 사용자 정보가 반환되어야 한다

Scenario: 잘못된 비밀번호로 로그인 시도
  Given 등록된 사용자 "user@example.com"
  When 잘못된 비밀번호로 로그인을 시도하면
  Then 응답 상태 코드는 401이어야 한다
  And 에러 메시지 "Invalid credentials"가 반환되어야 한다

Scenario: 존재하지 않는 사용자로 로그인 시도
  Given 등록되지 않은 이메일 "nonexistent@example.com"
  When 해당 이메일로 로그인을 시도하면
  Then 응답 상태 코드는 401이어야 한다
  And 에러 메시지 "Invalid credentials"가 반환되어야 한다
```

### Feature: JWT Token Validation

```gherkin
Scenario: 유효한 토큰으로 인증된 요청
  Given 로그인한 사용자의 유효한 JWT 토큰
  When Authorization 헤더에 토큰을 포함하여 /api/auth/me를 요청하면
  Then 응답 상태 코드는 200이어야 한다
  And 현재 사용자 정보가 반환되어야 한다

Scenario: 만료된 토큰으로 요청
  Given 만료된 JWT 토큰
  When Authorization 헤더에 만료된 토큰을 포함하여 보호된 API를 요청하면
  Then 응답 상태 코드는 401이어야 한다
  And 에러 메시지 "Token expired"가 반환되어야 한다

Scenario: 토큰 없이 보호된 API 요청
  Given 인증되지 않은 상태
  When Authorization 헤더 없이 보호된 API를 요청하면
  Then 응답 상태 코드는 401이어야 한다
  And 에러 메시지 "No token provided"가 반환되어야 한다

Scenario: 유효하지 않은 토큰으로 요청
  Given 조작되거나 유효하지 않은 토큰
  When Authorization 헤더에 해당 토큰을 포함하여 요청하면
  Then 응답 상태 코드는 401이어야 한다
  And 에러 메시지 "Invalid token"이 반환되어야 한다
```

### Feature: Project Access Control

```gherkin
Scenario: Owner 권한으로 프로젝트 접근
  Given 사용자가 프로젝트 A의 Owner 권한을 가짐
  When 프로젝트 A의 태스크를 조회/생성/수정/삭제하면
  Then 모든 작업이 허용되어야 한다

Scenario: Editor 권한으로 태스크 생성
  Given 사용자가 프로젝트 B에 Editor 권한을 가짐
  When 프로젝트 B에 새 태스크를 생성하면
  Then 태스크가 성공적으로 생성되어야 한다
  And 응답 상태 코드는 201이어야 한다

Scenario: Viewer 권한으로 태스크 생성 시도
  Given 사용자가 프로젝트 C에 Viewer 권한을 가짐
  When 프로젝트 C에 새 태스크를 생성하려고 하면
  Then 응답 상태 코드는 403이어야 한다
  And 에러 메시지 "Insufficient permissions"가 반환되어야 한다

Scenario: 권한 없는 프로젝트 접근
  Given 사용자가 프로젝트 D에 대한 권한이 없음
  When 프로젝트 D의 태스크를 조회하려고 하면
  Then 응답 상태 코드는 403이어야 한다
  And 에러 메시지 "Access denied"가 반환되어야 한다

Scenario: Owner가 사용자 권한 변경
  Given 사용자가 프로젝트 E의 Owner
  And 다른 사용자가 프로젝트 E의 Viewer
  When Owner가 해당 사용자의 권한을 Editor로 변경하면
  Then 권한이 성공적으로 변경되어야 한다
  And 응답 상태 코드는 200이어야 한다

Scenario: Non-Owner가 사용자 권한 변경 시도
  Given 사용자가 프로젝트 F의 Editor
  When 다른 사용자의 권한을 변경하려고 하면
  Then 응답 상태 코드는 403이어야 한다
  And 에러 메시지 "Only owners can modify access"가 반환되어야 한다
```

### Feature: User Management (Admin)

```gherkin
Scenario: 관리자가 사용자 목록 조회
  Given 관리자 권한을 가진 사용자
  When GET /api/users를 요청하면
  Then 응답 상태 코드는 200이어야 한다
  And 모든 사용자 목록이 반환되어야 한다
  And 비밀번호 해시는 포함되지 않아야 한다

Scenario: 일반 사용자가 사용자 목록 조회 시도
  Given 일반 사용자 권한을 가진 사용자
  When GET /api/users를 요청하면
  Then 응답 상태 코드는 403이어야 한다

Scenario: 관리자가 사용자 삭제
  Given 관리자 권한을 가진 사용자
  And 삭제 대상 사용자 ID
  When DELETE /api/users/:userId를 요청하면
  Then 응답 상태 코드는 200이어야 한다
  And 해당 사용자가 삭제되어야 한다
```

### Feature: Password Security

```gherkin
Scenario: 비밀번호 해싱 검증
  Given 새 사용자 등록 요청 (비밀번호: "Password123")
  When 사용자가 성공적으로 등록되면
  Then 저장된 비밀번호는 원본과 달라야 한다
  And 저장된 비밀번호는 bcrypt 해시 형식이어야 한다
  And bcrypt.compare로 원본 비밀번호 검증이 가능해야 한다

Scenario: 평문 비밀번호 저장 방지
  Given 사용자 데이터 저장소
  When 모든 사용자의 비밀번호 필드를 검사하면
  Then 평문 비밀번호가 존재하지 않아야 한다
  And 모든 비밀번호는 "$2b$" 또는 "$2a$"로 시작해야 한다
```

## Quality Gates

### Code Quality

- [ ] ESLint 에러 0개
- [ ] TypeScript 타입 에러 0개
- [ ] 코드 복잡도 < 10 (McCabe)

### Test Coverage

- [ ] 전체 테스트 커버리지 >= 85%
- [ ] 인증 모듈 커버리지 >= 90%
- [ ] 권한 모듈 커버리지 >= 90%

### Security

- [ ] OWASP Top 10 취약점 없음
- [ ] 비밀번호 평문 저장 없음
- [ ] SQL Injection 취약점 없음 (해당 시)
- [ ] XSS 취약점 없음

### Performance

- [ ] 로그인 API 응답 시간 < 200ms
- [ ] 토큰 검증 시간 < 10ms
- [ ] 동시 사용자 100명 처리 가능

## Definition of Done

### Backend

- [ ] 모든 API 엔드포인트 구현 완료
- [ ] JWT 미들웨어 구현 및 테스트 완료
- [ ] 역할 기반 접근 제어 구현 완료
- [ ] 단위 테스트 작성 완료
- [ ] API 문서화 완료

### Frontend

- [ ] 로그인/회원가입 UI 구현 완료
- [ ] ProtectedRoute 컴포넌트 구현 완료
- [ ] authStore 상태 관리 구현 완료
- [ ] 에러 처리 및 사용자 피드백 구현 완료
- [ ] 컴포넌트 테스트 작성 완료

### Integration

- [ ] Frontend-Backend 통합 테스트 완료
- [ ] 기존 기능과의 호환성 검증 완료
- [ ] E2E 테스트 작성 완료 (선택적)

## Verification Methods

### Unit Testing

- Jest/Vitest for backend utilities
- React Testing Library for frontend components
- Mock JWT and bcrypt for isolated testing

### Integration Testing

- Supertest for API endpoint testing
- MSW (Mock Service Worker) for frontend API mocking

### Manual Testing Checklist

- [ ] 새 사용자 등록 후 자동 로그인 확인
- [ ] 로그아웃 후 보호된 페이지 접근 차단 확인
- [ ] 토큰 만료 후 재인증 요청 확인
- [ ] 권한별 기능 접근 제한 확인
- [ ] 다중 브라우저 세션 동작 확인

---

**TAG**: SPEC-AUTH-001
**VERSION**: 1.0.0
**STATUS**: draft
