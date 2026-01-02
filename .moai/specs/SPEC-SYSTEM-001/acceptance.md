# SPEC-SYSTEM-001: 수락 기준 (Acceptance Criteria)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SYSTEM-001 |
| 제목 | 시스템 문서 관리 기능 수락 기준 |
| 생성일 | 2026-01-02 |
| 관련 SPEC | SPEC-SYSTEM-001/spec.md |

---

## 1. 수락 기준 개요

### 1.1 테스트 범위

- 시스템 문서 CRUD 기능 (Create, Read, Update, Delete)
- 카테고리별 그룹화 및 표시
- 검색 및 태그 기반 필터링
- 마크다운 에디터 및 미리보기
- API 엔드포인트 동작
- UI 컴포넌트 상호작용

### 1.2 테스트 환경

- Node.js 20.x LTS
- React 18.x 개발 서버 (포트 5173)
- Express 백엔드 서버 (포트 3001)
- 브라우저: Chrome/Firefox 최신 버전
- 의존성: SPEC-PROJECT-001 완료 상태

---

## 2. 기능별 수락 기준

### AC-001: 시스템 문서 생성 - 기본 필드

**Given** 사용자가 프로젝트를 선택하고 시스템 사이드바가 표시되어 있을 때

**When** 사용자가 "시스템 문서 추가" 버튼을 클릭하면

**Then**
- SystemCreateModal이 화면 중앙에 표시된다
- 모달에는 다음 필드가 포함된다:
  - 문서 이름 (필수, 텍스트 입력)
  - 카테고리 (필수, 드롭다운 선택 또는 직접 입력)
  - 태그 (선택, 태그 입력)
  - 의존 문서 (선택, 다중 선택)
  - 콘텐츠 (선택, 마크다운 에디터)
- 취소 버튼과 저장 버튼이 표시된다
- 이름 필드가 비어있으면 저장 버튼이 비활성화된다
- 카테고리가 선택되지 않으면 저장 버튼이 비활성화된다

---

### AC-002: 시스템 문서 생성 - 저장 및 목록 업데이트

**Given** SystemCreateModal이 열려있고, 사용자가 다음을 입력했을 때:
- 이름: "캐릭터 시스템"
- 카테고리: "System"
- 태그: ["core", "player"]
- 콘텐츠: "# 캐릭터 시스템\n\n캐릭터 관련 설명..."

**When** 사용자가 "저장" 버튼을 클릭하면

**Then**
- POST /api/projects/:projectId/systems API가 호출된다
- 성공 시:
  - 모달이 닫힌다
  - 새 문서가 사이드바 목록에 추가된다
  - 해당 카테고리("System")가 자동으로 확장된다
  - 성공 토스트 메시지 "시스템 문서가 생성되었습니다"가 표시된다
  - workspace/projects/{projectId}/systems/systems.json에 메타데이터가 추가된다
  - workspace/projects/{projectId}/systems/{id}.md 파일이 생성된다
- 실패 시:
  - 에러 메시지가 모달 내에 표시된다
  - 모달은 열린 상태를 유지한다

---

### AC-003: 시스템 문서 목록 조회 - 카테고리별 그룹화

**Given** 프로젝트에 다음 시스템 문서가 있을 때:
- "Character System" (카테고리: System)
- "Combat System" (카테고리: System)
- "Economy Rules" (카테고리: Economy)
- "UI Guidelines" (카테고리: UI)

**When** 해당 프로젝트를 선택하면

**Then**
- GET /api/projects/:projectId/systems API가 호출된다
- 사이드바에 카테고리별로 그룹화되어 표시된다:
  - System (2) - 접기/펼치기 가능
    - Character System
    - Combat System
  - Economy (1)
    - Economy Rules
  - UI (1)
    - UI Guidelines
- 각 카테고리는 문서 수를 표시한다
- 카테고리 내 문서는 이름 알파벳순으로 정렬된다

---

### AC-004: 시스템 문서 목록 조회 - 프로젝트 전환

**Given** "프로젝트 A"가 선택되어 있고 해당 프로젝트의 시스템 문서 목록이 표시되어 있을 때

**When** 사용자가 ProjectSelector에서 "프로젝트 B"를 선택하면

**Then**
- "프로젝트 A"의 시스템 문서 목록이 초기화된다
- GET /api/projects/:projectIdB/systems API가 호출된다
- "프로젝트 B"의 시스템 문서 목록이 로드되어 표시된다
- 검색어와 태그 필터가 초기화된다
- 카테고리 확장 상태가 초기화된다

---

### AC-005: 시스템 문서 검색 - 키워드 검색

**Given** 사이드바에 10개의 시스템 문서가 표시되어 있을 때

**When** 사용자가 검색 필드에 "character"를 입력하면

**Then**
- 입력 후 300ms debounce가 적용된다
- 문서 이름 또는 태그에 "character"가 포함된 문서만 표시된다
- 매칭되는 카테고리만 확장되어 표시된다
- 검색 결과가 없으면 "검색 결과가 없습니다" 메시지가 표시된다
- 검색 초기화 버튼(X)이 표시된다

**When** 사용자가 검색 초기화 버튼을 클릭하면

**Then**
- 검색어가 비워진다
- 전체 문서 목록이 다시 표시된다

---

### AC-006: 시스템 문서 검색 - 태그 필터링

**Given** 다음 태그를 가진 문서가 있을 때:
- "Character System": tags = ["core", "player"]
- "Combat System": tags = ["core", "battle"]
- "Economy Rules": tags = ["economy", "balance"]

**When** 사용자가 태그 필터에서 "core" 태그를 선택하면

**Then**
- "Character System"과 "Combat System"만 표시된다
- "Economy Rules"는 숨겨진다
- 선택된 태그가 필터 영역에 표시된다

**When** 사용자가 추가로 "player" 태그를 선택하면

**Then**
- "Character System"만 표시된다 (AND 조건)
- 두 개의 태그가 필터 영역에 표시된다

**When** 사용자가 "필터 초기화" 버튼을 클릭하면

**Then**
- 모든 태그 필터가 제거된다
- 전체 문서 목록이 표시된다

---

### AC-007: 시스템 문서 수정

**Given** "Character System" 문서가 사이드바에 표시되어 있을 때

**When** 사용자가 문서 카드의 수정 버튼(연필 아이콘)을 클릭하면

**Then**
- SystemEditModal이 표시된다
- 기존 데이터가 폼에 로드된다:
  - 이름: "Character System"
  - 카테고리: "System"
  - 태그: ["core", "player"]
  - 콘텐츠: 기존 마크다운 콘텐츠
  - 의존 문서: 기존 의존성 목록

**When** 사용자가 이름을 "Character System v2"로 수정하고 저장 버튼을 클릭하면

**Then**
- PUT /api/projects/:projectId/systems/:id API가 호출된다
- 성공 시:
  - 모달이 닫힌다
  - 문서 목록이 업데이트된다
  - 사이드바에 "Character System v2"가 표시된다
  - 성공 토스트 "시스템 문서가 수정되었습니다"가 표시된다
  - workspace의 systems.json과 .md 파일이 업데이트된다

---

### AC-008: 시스템 문서 삭제

**Given** "Economy Rules" 문서가 사이드바에 표시되어 있을 때

**When** 사용자가 문서 카드의 삭제 버튼(휴지통 아이콘)을 클릭하면

**Then**
- 확인 다이얼로그가 표시된다
- 경고 메시지: "이 시스템 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."

**When** 사용자가 "삭제" 버튼을 클릭하면

**Then**
- DELETE /api/projects/:projectId/systems/:id API가 호출된다
- 성공 시:
  - 다이얼로그가 닫힌다
  - 문서가 사이드바 목록에서 제거된다
  - "Economy" 카테고리에 문서가 없으면 카테고리 섹션이 숨겨진다
  - workspace에서 systems.json 엔트리와 .md 파일이 삭제된다
  - 성공 토스트 "시스템 문서가 삭제되었습니다"가 표시된다

---

### AC-009: 마크다운 에디터 동작

**Given** SystemCreateModal 또는 SystemEditModal이 열려있을 때

**When** 사용자가 마크다운 에디터에 다음을 입력하면:
```markdown
# 제목

## 부제목

- 목록 항목 1
- 목록 항목 2

**굵은 글씨** 와 *기울임*
```

**Then**
- 실시간 미리보기 패널에 렌더링된 마크다운이 표시된다
- 미리보기에서 제목, 목록, 강조 스타일이 적용된다
- 에디터와 미리보기가 나란히 표시된다 (또는 탭 전환)

---

### AC-010: 시스템 문서 미리보기

**Given** "Character System" 문서가 사이드바에 표시되어 있을 때

**When** 사용자가 문서 카드의 미리보기 버튼(눈 아이콘)을 클릭하면

**Then**
- SystemPreview 패널/모달이 표시된다
- 다음 정보가 표시된다:
  - 문서 이름: "Character System"
  - 카테고리 뱃지: "System"
  - 태그 목록: ["core", "player"]
  - 의존 문서 링크 (있는 경우)
  - 렌더링된 마크다운 콘텐츠
- 닫기 버튼과 수정 버튼이 표시된다

**When** 사용자가 수정 버튼을 클릭하면

**Then**
- 미리보기가 닫힌다
- SystemEditModal이 열린다

---

## 3. 에지 케이스 테스트 시나리오

### EC-001: 시스템 문서 없음 상태

**Given** 프로젝트에 시스템 문서가 없을 때

**When** 해당 프로젝트를 선택하면

**Then**
- 사이드바에 "시스템 문서가 없습니다" 메시지가 표시된다
- "첫 번째 시스템 문서를 추가해보세요" 안내 문구가 표시된다
- "시스템 문서 추가" 버튼이 강조 표시된다

---

### EC-002: 중복 문서 이름

**Given** "Character System"이라는 이름의 문서가 프로젝트에 이미 존재할 때

**When** 사용자가 동일한 이름으로 새 문서를 생성하려고 하면

**Then**
- 경고 메시지 "동일한 이름의 시스템 문서가 이미 존재합니다"가 표시된다
- 저장 버튼이 비활성화된다

---

### EC-003: 의존 문서 삭제 시 경고

**Given** "Combat System"이 "Character System"을 의존 문서로 참조하고 있을 때

**When** 사용자가 "Character System"을 삭제하려고 하면

**Then**
- 추가 경고: "이 문서는 다른 문서에서 참조하고 있습니다:"
- 참조하는 문서 목록: "Combat System"
- "그래도 삭제하시겠습니까?" 확인 메시지가 표시된다
- 삭제 확인 시 정상적으로 삭제되고 참조 문서의 dependencies에서 제거된다

---

### EC-004: 카테고리 변경 시 이동

**Given** "Character System"이 "System" 카테고리에 있을 때

**When** 사용자가 수정 모달에서 카테고리를 "Core"로 변경하고 저장하면

**Then**
- 문서가 "System" 카테고리에서 제거된다
- 문서가 "Core" 카테고리에 추가된다
- "System" 카테고리에 문서가 없으면 해당 섹션이 숨겨진다
- "Core" 카테고리가 새로 생성되거나 확장된다

---

### EC-005: ESC 키로 모달 닫기

**Given** SystemCreateModal이 열려있고 일부 데이터가 입력되어 있을 때

**When** 사용자가 ESC 키를 누르면

**Then**
- 모달이 닫힌다
- 입력한 데이터는 저장되지 않는다
- (선택) 데이터가 입력된 경우 확인 다이얼로그 표시

---

### EC-006: 사이드바 접기/펼치기

**Given** 시스템 사이드바가 펼쳐져 있을 때

**When** 사용자가 사이드바 접기 버튼을 클릭하면

**Then**
- 사이드바가 접힌다 (아이콘만 표시 또는 완전히 숨김)
- 메인 콘텐츠 영역이 확장된다

**When** 사용자가 사이드바 펼치기 버튼을 클릭하면

**Then**
- 사이드바가 다시 펼쳐진다
- 이전 상태 (확장된 카테고리 등)가 유지된다

---

### EC-007: 100개 이상 문서 성능

**Given** 프로젝트에 120개의 시스템 문서가 있을 때

**When** 해당 프로젝트를 선택하면

**Then**
- 문서 목록 로드가 500ms 이내에 완료된다
- 스크롤이 부드럽게 동작한다
- 검색 필터링이 100ms 이내에 결과를 표시한다

---

## 4. API 테스트 시나리오

### API-001: GET /api/projects/:projectId/systems - 성공

**Given** 프로젝트에 3개의 시스템 문서가 있을 때

**When** GET /api/projects/:projectId/systems 요청을 보내면

**Then**
- 상태 코드: 200
- 응답 형식:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "projectId": "project-uuid",
      "name": "Character System",
      "category": "System",
      "tags": ["core", "player"],
      "content": "# Character System\n\n...",
      "dependencies": [],
      "createdAt": "2026-01-02T10:00:00.000Z",
      "updatedAt": "2026-01-02T10:00:00.000Z"
    },
    ...
  ],
  "error": null
}
```

---

### API-002: POST /api/projects/:projectId/systems - 성공

**Given** 유효한 시스템 문서 데이터가 있을 때

**When** POST /api/projects/:projectId/systems 요청을 보내면:
```json
{
  "name": "New System",
  "category": "System",
  "tags": ["new"],
  "content": "# New System\n\nContent here.",
  "dependencies": []
}
```

**Then**
- 상태 코드: 201
- 응답에 생성된 문서 정보 포함
- id, projectId, createdAt, updatedAt이 자동 생성됨
- workspace/projects/:projectId/systems/systems.json에 메타데이터 추가됨
- workspace/projects/:projectId/systems/{id}.md 파일 생성됨

---

### API-003: POST /api/projects/:projectId/systems - 실패 (필수 필드 누락)

**Given** 이름 필드가 누락된 요청일 때

**When** POST /api/projects/:projectId/systems 요청을 보내면:
```json
{
  "category": "System"
}
```

**Then**
- 상태 코드: 400
- 응답:
```json
{
  "success": false,
  "data": null,
  "error": "문서 이름은 필수입니다"
}
```

---

### API-004: PUT /api/projects/:projectId/systems/:id - 성공

**Given** ID가 "uuid-1"인 시스템 문서가 존재할 때

**When** PUT /api/projects/:projectId/systems/uuid-1 요청을 보내면:
```json
{
  "name": "Updated System Name",
  "tags": ["updated", "new-tag"]
}
```

**Then**
- 상태 코드: 200
- 응답에 업데이트된 문서 정보 포함
- updatedAt이 갱신됨
- workspace의 systems.json과 .md 파일이 업데이트됨

---

### API-005: PUT /api/projects/:projectId/systems/:id - 실패 (문서 없음)

**Given** ID가 "non-existent"인 문서가 없을 때

**When** PUT /api/projects/:projectId/systems/non-existent 요청을 보내면

**Then**
- 상태 코드: 404
- 응답:
```json
{
  "success": false,
  "data": null,
  "error": "시스템 문서를 찾을 수 없습니다"
}
```

---

### API-006: DELETE /api/projects/:projectId/systems/:id - 성공

**Given** ID가 "uuid-1"인 시스템 문서가 존재할 때

**When** DELETE /api/projects/:projectId/systems/uuid-1 요청을 보내면

**Then**
- 상태 코드: 200
- 응답:
```json
{
  "success": true,
  "data": { "deleted": true },
  "error": null
}
```
- workspace의 systems.json에서 해당 엔트리 제거됨
- workspace의 uuid-1.md 파일 삭제됨

---

### API-007: GET /api/projects/:projectId/systems/categories - 성공

**Given** 프로젝트에 "System", "Economy", "UI" 카테고리의 문서가 있을 때

**When** GET /api/projects/:projectId/systems/categories 요청을 보내면

**Then**
- 상태 코드: 200
- 응답:
```json
{
  "success": true,
  "data": ["Economy", "System", "UI"],
  "error": null
}
```
- 카테고리는 알파벳순으로 정렬됨

---

### API-008: GET /api/projects/:projectId/systems/tags - 성공

**Given** 프로젝트 문서에 "core", "player", "battle", "economy" 태그가 있을 때

**When** GET /api/projects/:projectId/systems/tags 요청을 보내면

**Then**
- 상태 코드: 200
- 응답:
```json
{
  "success": true,
  "data": ["battle", "core", "economy", "player"],
  "error": null
}
```
- 태그는 알파벳순으로 정렬됨
- 중복 태그는 제거됨

---

## 5. 비기능 요구사항 검증

### NFR-001: 성능 테스트

| 항목 | 기준 | 측정 방법 |
|------|------|-----------|
| 시스템 문서 목록 로드 | 500ms 이내 (100개 기준) | Chrome DevTools Network |
| 검색 필터링 | 100ms 이내 | React Profiler |
| 문서 생성/수정/삭제 | 1초 이내 | API 응답 시간 측정 |
| 마크다운 미리보기 렌더링 | 200ms 이내 | React Profiler |

### NFR-002: 데이터 무결성 검증

- [ ] 문서 삭제 시 .md 파일도 함께 삭제됨 확인
- [ ] systems.json과 개별 .md 파일 동기화 확인
- [ ] 저장 실패 시 기존 데이터 손상 없음 확인
- [ ] 의존 문서 삭제 시 참조 무결성 처리 확인

### NFR-003: 접근성 검증

- [ ] 모든 버튼에 aria-label 속성 존재
- [ ] 모달 열림 시 포커스 트랩 동작
- [ ] 키보드 네비게이션 지원 (Tab, Enter, ESC)
- [ ] 스크린 리더 호환성 테스트

---

## 6. Definition of Done

### 필수 완료 항목

- [ ] 모든 API 엔드포인트가 구현되고 테스트됨 (API-001 ~ API-008)
- [ ] 모든 React 컴포넌트가 구현됨
  - [ ] SystemSidebar.tsx
  - [ ] SystemList.tsx
  - [ ] SystemCard.tsx
  - [ ] SystemCreateModal.tsx
  - [ ] SystemEditModal.tsx
  - [ ] SystemPreview.tsx
- [ ] Zustand systemStore가 API와 연동됨
- [ ] AC-001 ~ AC-010 수락 기준 통과
- [ ] EC-001 ~ EC-007 에지 케이스 통과
- [ ] TypeScript 컴파일 오류 없음
- [ ] ESLint 경고 없음

### 권장 완료 항목

- [ ] Vitest 단위 테스트 작성 (커버리지 80% 이상)
- [ ] 마크다운 에디터 실시간 미리보기 구현
- [ ] 태그 자동완성 구현
- [ ] 100개 문서 성능 테스트 통과
- [ ] 접근성 테스트 통과

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
