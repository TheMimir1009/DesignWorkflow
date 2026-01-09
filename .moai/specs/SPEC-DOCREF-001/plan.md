# SPEC-DOCREF-001: 구현 계획

## 구현 개요

완료된 태스크의 문서를 조회하는 백엔드 API를 구현합니다.

---

## 단계별 구현 계획

### Phase 1: 유틸리티 함수 구현

**파일**: `server/utils/completedDocStorage.ts`

구현 항목:
- `getCompletedDocuments(projectId, options)`: 완료 문서 목록 조회
- `getCompletedDocumentById(projectId, taskId)`: 단일 문서 상세 조회
- `searchDocuments(projectId, keyword)`: 키워드 검색
- `filterByDocumentType(documents, types)`: 문서 타입 필터링
- `filterByReference(documents, referenceIds)`: 참조 시스템 필터링

예상 작업량: 약 150-200 줄

### Phase 2: API 라우트 구현

**파일**: `server/routes/completedDocuments.ts`

구현 항목:
- GET `/api/projects/:projectId/completed-documents` 라우트
- GET `/api/projects/:projectId/completed-documents/:taskId` 라우트
- 쿼리 파라미터 파싱 및 검증
- 에러 핸들링

예상 작업량: 약 100-150 줄

### Phase 3: 서버 통합

**파일**: `server/index.ts`

구현 항목:
- 새 라우터 등록
- 기존 라우팅 구조에 통합

예상 작업량: 약 5-10 줄

### Phase 4: 타입 정의

**파일**: `src/types/index.ts`

구현 항목:
- `CompletedDocumentSummary` 인터페이스
- `CompletedDocumentDetail` 인터페이스
- `CompletedDocumentsResponse` 인터페이스

예상 작업량: 약 30-40 줄

---

## 기술 스택

- Express 4.x
- TypeScript 5.x
- Node.js 파일 시스템 API

---

## 의존성 관계

```
completedDocStorage.ts
  ├── taskStorage.ts (prototype 상태 태스크 조회)
  ├── archiveStorage.ts (아카이브된 태스크 조회)
  └── projectStorage.ts (프로젝트 존재 확인)

completedDocuments.ts (라우트)
  └── completedDocStorage.ts
```

---

## 테스트 전략

### 단위 테스트

- `completedDocStorage.test.ts`: 유틸리티 함수 테스트
  - 문서 조회 로직
  - 검색 기능
  - 필터링 기능

### 통합 테스트

- `completedDocuments.test.ts`: API 엔드포인트 테스트
  - HTTP 요청/응답 검증
  - 쿼리 파라미터 처리
  - 에러 케이스

---

## 구현 순서

1. 타입 정의 추가 (types/index.ts)
2. 유틸리티 함수 구현 (completedDocStorage.ts)
3. 유틸리티 테스트 작성 및 검증
4. API 라우트 구현 (completedDocuments.ts)
5. 서버 통합 (index.ts)
6. 통합 테스트 작성 및 검증

---

## 리스크 및 대응

| 리스크 | 영향 | 대응 방안 |
|--------|------|----------|
| 대용량 문서 조회 성능 | 중 | 페이지네이션 적용, 요약 정보만 반환 |
| 파일 시스템 접근 오류 | 중 | try-catch로 에러 핸들링 |
| 동시 접근 문제 | 낮 | 읽기 전용 API이므로 영향 적음 |

---

## 완료 기준

- [ ] 모든 API 엔드포인트 구현
- [ ] 검색 및 필터링 기능 동작
- [ ] 단위 테스트 통과 (커버리지 85%+)
- [ ] 통합 테스트 통과
- [ ] API 응답 시간 500ms 이하
