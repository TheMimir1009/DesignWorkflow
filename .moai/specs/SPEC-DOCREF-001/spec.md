---
id: SPEC-DOCREF-001
version: "1.0.0"
status: "completed"
created: "2026-01-09"
updated: "2026-01-09"
author: "AI Workflow Team"
priority: "HIGH"
---

# SPEC-DOCREF-001: 완료 태스크 문서 조회 API

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-09 | AI Workflow Team | 초안 작성 |

---

## 1. 개요

### 1.1 목적

AI가 Design Document를 생성한 후, 사용자가 이전에 완료된 태스크의 문서들(Design Doc, PRD, Prototype)을 조회할 수 있는 백엔드 API를 제공합니다.

### 1.2 범위

- 완료 상태(prototype)의 태스크 문서 조회
- 아카이브된 태스크 문서 조회
- 검색 및 필터링 기능
- 문서 메타데이터 및 내용 반환

### 1.3 관련 문서

- PRD: `.moai/project/product.md`
- SPEC-ARCHIVE-001: 아카이브 기능
- SPEC-TASK-001: 태스크 관리

---

## 2. 요구사항

### 2.1 기능 요구사항 (EARS 형식)

#### REQ-001: 완료 태스크 문서 조회 엔드포인트

**When** 사용자가 `/api/projects/:projectId/completed-documents` 엔드포인트에 GET 요청을 보내면,
**the system shall** 해당 프로젝트의 완료된 태스크와 아카이브된 태스크의 문서 목록을 반환한다.

**인수 기준:**
- AC-001-1: prototype 상태의 태스크 문서 포함
- AC-001-2: 아카이브된 태스크 문서 포함
- AC-001-3: 각 문서의 메타데이터(제목, 생성일, 상태) 포함

#### REQ-002: 키워드 검색

**Where** 검색 기능이 활성화되어 있을 때,
**when** 사용자가 `?search=keyword` 쿼리 파라미터로 검색하면,
**the system shall** 태스크 제목 및 문서 내용에서 해당 키워드를 포함하는 결과만 반환한다.

**인수 기준:**
- AC-002-1: 태스크 제목에서 검색
- AC-002-2: Feature List 내용에서 검색
- AC-002-3: Design Document 내용에서 검색
- AC-002-4: 대소문자 구분 없이 검색

#### REQ-003: 문서 타입 필터링

**When** 사용자가 `?documentType=design` 쿼리 파라미터를 전달하면,
**the system shall** 해당 타입의 문서가 있는 태스크만 반환한다.

**인수 기준:**
- AC-003-1: `design` - Design Document가 있는 태스크
- AC-003-2: `prd` - PRD가 있는 태스크
- AC-003-3: `prototype` - Prototype이 있는 태스크
- AC-003-4: 복수 타입 필터링 지원 (`?documentType=design,prd`)

#### REQ-004: 참조 시스템 필터링

**When** 사용자가 `?reference=systemId` 쿼리 파라미터를 전달하면,
**the system shall** 해당 시스템을 참조하는 태스크만 반환한다.

**인수 기준:**
- AC-004-1: references 배열에 해당 시스템 ID가 포함된 태스크 반환
- AC-004-2: 복수 시스템 필터링 지원

#### REQ-005: 단일 문서 상세 조회

**When** 사용자가 `/api/projects/:projectId/completed-documents/:taskId` 엔드포인트에 GET 요청을 보내면,
**the system shall** 해당 태스크의 모든 문서 내용을 상세히 반환한다.

**인수 기준:**
- AC-005-1: Feature List 전체 내용 반환
- AC-005-2: Design Document 전체 내용 반환
- AC-005-3: PRD 전체 내용 반환
- AC-005-4: Prototype 정보 반환
- AC-005-5: 참조 시스템 목록 반환

---

## 3. 기술 설계

### 3.1 API 엔드포인트

#### GET /api/projects/:projectId/completed-documents

**요청 파라미터:**
```
- projectId (path): 프로젝트 UUID
- search (query, optional): 검색 키워드
- documentType (query, optional): design | prd | prototype (복수: design,prd)
- reference (query, optional): 참조 시스템 ID (복수: id1,id2)
- includeArchived (query, optional): true | false (기본값: true)
- limit (query, optional): 반환 개수 제한 (기본값: 50)
- offset (query, optional): 페이지네이션 오프셋 (기본값: 0)
```

**응답 형식:**
```typescript
interface CompletedDocumentSummary {
  taskId: string;
  title: string;
  status: 'prototype' | 'archived';
  references: string[];
  hasDesignDoc: boolean;
  hasPrd: boolean;
  hasPrototype: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

interface CompletedDocumentsResponse {
  success: boolean;
  data: {
    documents: CompletedDocumentSummary[];
    total: number;
    limit: number;
    offset: number;
  };
  error: null;
}
```

#### GET /api/projects/:projectId/completed-documents/:taskId

**응답 형식:**
```typescript
interface CompletedDocumentDetail {
  taskId: string;
  title: string;
  status: 'prototype' | 'archived';
  references: string[];
  featureList: string;
  designDocument: string | null;
  prd: string | null;
  prototype: string | null;
  qaAnswers: QAAnswer[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}
```

### 3.2 데이터 소스

문서는 두 곳에서 조회:
1. **태스크 저장소**: `workspace/projects/{projectId}/tasks/` - prototype 상태 태스크
2. **아카이브 저장소**: `workspace/projects/{projectId}/archives/` - 아카이브된 태스크

### 3.3 파일 구조

```
server/
├── routes/
│   └── completedDocuments.ts    # 새 라우트 파일
├── utils/
│   └── completedDocStorage.ts   # 완료 문서 조회 유틸리티
```

---

## 4. 비기능 요구사항

### 4.1 성능

- NFR-001: 문서 목록 조회 응답 시간 < 500ms
- NFR-002: 단일 문서 상세 조회 응답 시간 < 200ms
- NFR-003: 최대 1000개 태스크까지 검색 지원

### 4.2 보안

- NFR-004: 프로젝트 접근 권한 확인 필수
- NFR-005: SQL Injection 방지 (파라미터 검증)

---

## 5. 의존성

### 5.1 내부 의존성

- `/server/utils/taskStorage.ts`: 태스크 조회
- `/server/utils/archiveStorage.ts`: 아카이브 조회
- `/server/utils/projectStorage.ts`: 프로젝트 검증

### 5.2 외부 의존성

- Express 4.x
- TypeScript 5.x

---

## 6. 테스트 시나리오

### TC-001: 완료 문서 목록 조회

```gherkin
Given 프로젝트에 prototype 상태 태스크 2개와 아카이브된 태스크 1개가 있을 때
When GET /api/projects/{projectId}/completed-documents 요청을 보내면
Then 3개의 문서 요약 정보가 반환되어야 함
And 각 문서에 hasDesignDoc, hasPrd, hasPrototype 플래그가 포함되어야 함
```

### TC-002: 키워드 검색

```gherkin
Given 태스크 제목에 "전투"가 포함된 태스크가 있을 때
When GET /api/projects/{projectId}/completed-documents?search=전투 요청을 보내면
Then 해당 태스크만 반환되어야 함
```

### TC-003: 문서 타입 필터링

```gherkin
Given Design Document가 있는 태스크 2개와 없는 태스크 1개가 있을 때
When GET /api/projects/{projectId}/completed-documents?documentType=design 요청을 보내면
Then Design Document가 있는 2개 태스크만 반환되어야 함
```

### TC-004: 단일 문서 상세 조회

```gherkin
Given 완료된 태스크가 있을 때
When GET /api/projects/{projectId}/completed-documents/{taskId} 요청을 보내면
Then 태스크의 모든 문서 내용(featureList, designDocument, prd, prototype)이 반환되어야 함
```

---

## 7. 참고사항

### 7.1 구현 참고

- 기존 `archiveStorage.ts`의 패턴 참조
- 기존 `taskStorage.ts`의 조회 로직 재사용

### 7.2 확장 고려사항

- 향후 문서 버전 관리 기능 추가 가능
- 문서 유사도 검색 기능 확장 가능
