# SPEC-AUTH-001: Implementation Plan

---
spec_id: SPEC-AUTH-001
version: "1.0.0"
status: "draft"
created: "2026-01-07"
updated: "2026-01-07"
---

## Overview

Multi-User Authentication with Project Access Control 시스템의 구현 계획.

## Implementation Phases

### Phase 1: Core Authentication (Priority: High)

핵심 인증 기능 구현

#### Milestone 1.1: Data Layer

- [ ] workspace/users.json 파일 구조 설계 및 초기화
- [ ] User 모델 TypeScript 인터페이스 정의
- [ ] 사용자 데이터 CRUD 유틸리티 함수 구현
  - readUsers(), writeUsers()
  - findUserById(), findUserByEmail()
  - createUser(), updateUser(), deleteUser()

#### Milestone 1.2: Authentication API

- [ ] POST /api/auth/register 엔드포인트 구현
  - 이메일 중복 검사
  - bcrypt 비밀번호 해싱
  - 새 사용자 생성 및 저장
- [ ] POST /api/auth/login 엔드포인트 구현
  - 이메일/비밀번호 검증
  - JWT 토큰 생성 및 반환
- [ ] POST /api/auth/logout 엔드포인트 구현
- [ ] GET /api/auth/me 엔드포인트 구현

#### Milestone 1.3: JWT Middleware

- [ ] tokenManager.ts 구현
  - generateToken(user): JWT 생성
  - verifyToken(token): JWT 검증
  - decodeToken(token): 페이로드 추출
- [ ] authMiddleware.ts 구현
  - Authorization 헤더 파싱
  - 토큰 검증 및 사용자 정보 req에 첨부
  - 만료/무효 토큰 처리

#### Milestone 1.4: Frontend Auth Store

- [ ] authStore.ts (Zustand) 구현
  - user 상태 관리
  - token 관리 (localStorage)
  - login(), logout(), checkAuth() 액션
- [ ] authService.ts 구현
  - register(), login(), logout(), getMe() API 호출
  - Authorization 헤더 자동 첨부

### Phase 2: Authorization (Priority: High)

역할 기반 접근 제어 구현

#### Milestone 2.1: Role System

- [ ] Role 열거형 정의 (Owner, Editor, Viewer)
- [ ] ProjectAccess 인터페이스 정의
- [ ] workspace/projects/{id}/access.json 구조 설계

#### Milestone 2.2: Project Access API

- [ ] GET /api/projects/:projectId/access 구현
- [ ] PUT /api/projects/:projectId/access 구현
  - Owner만 권한 변경 가능
  - 권한 부여/수정/삭제

#### Milestone 2.3: Authorization Middleware

- [ ] requireRole(role) 미들웨어 구현
- [ ] checkProjectAccess(requiredRole) 미들웨어 구현
- [ ] 기존 프로젝트 API에 권한 검사 적용

### Phase 3: Frontend Integration (Priority: Medium)

사용자 인터페이스 구현

#### Milestone 3.1: Auth UI Components

- [ ] LoginForm.tsx 컴포넌트 구현
  - 이메일/비밀번호 입력
  - 유효성 검사
  - 에러 메시지 표시
- [ ] RegisterForm.tsx 컴포넌트 구현
  - 이름/이메일/비밀번호 입력
  - 비밀번호 확인
  - 회원가입 성공 시 자동 로그인

#### Milestone 3.2: Protected Routes

- [ ] ProtectedRoute.tsx 컴포넌트 구현
  - 미인증 사용자 리다이렉트
  - 로딩 상태 표시
- [ ] 기존 라우트에 ProtectedRoute 적용

#### Milestone 3.3: User Management UI

- [ ] UserManagement.tsx 컴포넌트 구현 (관리자 전용)
  - 사용자 목록 표시
  - 사용자 정보 수정/삭제
- [ ] ProjectAccess.tsx 컴포넌트 구현
  - 프로젝트 멤버 목록
  - 권한 수준 변경
  - 멤버 초대/제거

### Phase 4: Optional Features (Priority: Low)

선택적 기능 구현

#### Milestone 4.1: Password Reset

- [ ] 비밀번호 재설정 요청 API
- [ ] 재설정 토큰 생성 및 검증
- [ ] 비밀번호 재설정 UI

#### Milestone 4.2: User Invitation

- [ ] 프로젝트 초대 API
- [ ] 초대 수락/거절 처리
- [ ] 초대 UI 컴포넌트

## Technical Approach

### Backend Architecture

```
server/
├── routes/
│   ├── auth.ts          # 인증 관련 라우트
│   └── users.ts         # 사용자 관리 라우트
├── middleware/
│   ├── authMiddleware.ts    # JWT 검증
│   └── roleMiddleware.ts    # 역할 기반 접근 제어
├── utils/
│   ├── tokenManager.ts      # JWT 생성/검증
│   ├── passwordUtils.ts     # bcrypt 해싱
│   └── userStorage.ts       # 사용자 데이터 접근
└── types/
    └── auth.ts              # 인증 관련 타입 정의
```

### Frontend Architecture

```
src/
├── components/auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ProtectedRoute.tsx
│   ├── UserManagement.tsx
│   └── ProjectAccess.tsx
├── store/
│   └── authStore.ts
├── services/
│   └── authService.ts
└── hooks/
    └── useAuth.ts           # 인증 상태 훅
```

### Security Considerations

- bcrypt salt rounds: 12 (보안과 성능 균형)
- JWT 알고리즘: HS256
- JWT 비밀키: 환경변수에서 로드 (JWT_SECRET)
- 비밀번호 정책: 최소 8자, 영문+숫자 필수
- XSS 방지: httpOnly 쿠키 고려 (선택적)

## Risks and Mitigations

### Risk 1: JSON 파일 동시 쓰기 충돌

- **영향**: 데이터 손실 가능
- **완화**: 파일 락 메커니즘 또는 쓰기 큐 구현
- **대안**: 추후 SQLite/PostgreSQL 마이그레이션 고려

### Risk 2: JWT 토큰 탈취

- **영향**: 세션 하이재킹
- **완화**:
  - 적절한 토큰 만료 시간 (24시간)
  - HTTPS 적용
  - 토큰 갱신 메커니즘 구현

### Risk 3: 비밀번호 무차별 대입 공격

- **영향**: 계정 탈취
- **완화**:
  - 로그인 시도 횟수 제한
  - 계정 잠금 정책
  - CAPTCHA 고려

## Dependencies

### Backend Dependencies

- jsonwebtoken: ^9.0.0 - JWT 생성/검증
- bcrypt: ^5.1.0 - 비밀번호 해싱
- uuid: ^9.0.0 - 사용자 ID 생성

### Frontend Dependencies

- zustand: (기존 설치됨) - 상태 관리
- react-hook-form: (선택적) - 폼 관리

## Success Criteria

- [ ] 모든 EARS 요구사항 충족
- [ ] 테스트 커버리지 85% 이상
- [ ] 보안 취약점 없음 (OWASP Top 10 기준)
- [ ] API 응답 시간 200ms 이내

---

**TAG**: SPEC-AUTH-001
**VERSION**: 1.0.0
**STATUS**: draft
