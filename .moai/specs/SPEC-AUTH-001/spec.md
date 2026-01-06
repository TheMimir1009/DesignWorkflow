# SPEC-AUTH-001: Multi-User Authentication with Project Access Control

---
id: SPEC-AUTH-001
version: "1.0.0"
status: "draft"
created: "2026-01-07"
updated: "2026-01-07"
author: "workflow-spec"
priority: "medium"
tags: [authentication, authorization, jwt, rbac, security]
---

## Overview

Multi-User Authentication with Project Access Control 시스템을 구현하여 사용자 인증 및 프로젝트별 권한 관리를 제공한다.

## Environment

- **Backend**: Express 4.x + jsonwebtoken + bcrypt
- **Storage**: workspace/users.json (사용자 데이터), workspace/projects/{id}/access.json (권한 매핑)
- **Frontend**: React 18.x, Zustand (authStore)
- **Security**: JWT 기반 토큰 인증, bcrypt 비밀번호 해싱

## Assumptions

- 단일 서버 환경에서 운영된다
- 사용자 데이터는 JSON 파일 기반으로 저장된다
- JWT 토큰은 클라이언트 localStorage에 저장된다
- 프로젝트당 최대 권한 레벨은 Owner, Editor, Viewer 3단계이다

## Requirements

### Ubiquitous Requirements (항상 적용)

- [REQ-U-001] 시스템은 **항상** 모든 사용자 작업에 대해 권한을 검증해야 한다
- [REQ-U-002] 시스템은 **항상** 비밀번호를 bcrypt로 해시하여 저장해야 한다

### Event-Driven Requirements (이벤트 기반)

- [REQ-E-001] **WHEN** 새 사용자가 등록될 때 **THEN** 기본 권한(Viewer)을 부여한다
- [REQ-E-002] **WHEN** 사용자가 로그인할 때 **THEN** JWT 토큰을 발급한다
- [REQ-E-003] **WHEN** JWT 토큰이 만료되면 **THEN** 재인증을 요청한다

### State-Driven Requirements (상태 기반)

- [REQ-S-001] **IF** 사용자가 프로젝트 소유자(Owner)라면 **THEN** 모든 프로젝트 작업을 허용한다
- [REQ-S-002] **IF** 사용자가 편집자(Editor) 권한이라면 **THEN** 읽기/쓰기 작업을 허용한다
- [REQ-S-003] **IF** 사용자가 뷰어(Viewer) 권한이라면 **THEN** 읽기 작업만 허용한다

### Unwanted Behavior (금지 사항)

- [REQ-N-001] 시스템은 권한 없는 프로젝트 접근을 **허용하지 않아야 한다**
- [REQ-N-002] 시스템은 평문 비밀번호를 **저장하지 않아야 한다**
- [REQ-N-003] 시스템은 만료된 토큰으로 API 접근을 **허용하지 않아야 한다**

### Optional Requirements (선택 사항)

- [REQ-O-001] **가능하면** 비밀번호 재설정 기능을 제공한다
- [REQ-O-002] **가능하면** 사용자 초대 기능을 제공한다

## Specifications

### Data Models

#### User Model

```typescript
interface User {
  id: string;           // UUID
  email: string;        // 고유 식별자
  passwordHash: string; // bcrypt 해시
  name: string;
  role: 'admin' | 'user';
  createdAt: string;    // ISO 8601
  updatedAt: string;
}
```

#### Project Access Model

```typescript
interface ProjectAccess {
  projectId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  grantedAt: string;
  grantedBy: string;
}
```

#### JWT Payload

```typescript
interface JWTPayload {
  sub: string;          // user.id
  email: string;
  role: string;
  iat: number;
  exp: number;
}
```

### Component Architecture

```
src/
├── components/
│   └── auth/
│       ├── LoginForm.tsx         # 로그인 폼
│       ├── RegisterForm.tsx      # 회원가입 폼
│       ├── UserManagement.tsx    # 사용자 관리 (관리자용)
│       ├── ProjectAccess.tsx     # 프로젝트 권한 설정
│       └── ProtectedRoute.tsx    # 인증 필요 라우트 래퍼
├── store/
│   └── authStore.ts              # 인증 상태 관리
├── services/
│   └── authService.ts            # 인증 API 호출
server/
├── routes/
│   └── auth.ts                   # 인증 API 엔드포인트
├── middleware/
│   └── authMiddleware.ts         # JWT 검증 미들웨어
└── utils/
    └── tokenManager.ts           # JWT 생성/검증
```

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | 새 사용자 등록 | No |
| POST | /api/auth/login | 로그인, JWT 발급 | No |
| POST | /api/auth/logout | 로그아웃 | Yes |
| GET | /api/auth/me | 현재 사용자 정보 | Yes |
| GET | /api/users | 사용자 목록 (관리자) | Yes (Admin) |
| PUT | /api/users/:userId | 사용자 정보 수정 | Yes (Admin/Self) |
| DELETE | /api/users/:userId | 사용자 삭제 | Yes (Admin) |
| GET | /api/projects/:projectId/access | 프로젝트 권한 조회 | Yes (Owner/Editor) |
| PUT | /api/projects/:projectId/access | 프로젝트 권한 설정 | Yes (Owner) |

### Security Specifications

- JWT 토큰 만료 시간: 24시간
- bcrypt salt rounds: 12
- 비밀번호 최소 길이: 8자
- 비밀번호 복잡도: 영문, 숫자 필수

## Traceability

- **Related SPECs**: SPEC-PROJECT-001 (프로젝트 관리)
- **Dependencies**: jsonwebtoken, bcrypt, uuid
- **Test Coverage Target**: 85%

## Constraints

- 동시 사용자 세션 제한 없음
- 소셜 로그인 미지원 (향후 확장 가능)
- 2FA 미지원 (향후 확장 가능)

---

**TAG**: SPEC-AUTH-001
**VERSION**: 1.0.0
**STATUS**: draft
