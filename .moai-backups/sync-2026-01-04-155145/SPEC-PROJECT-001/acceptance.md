# SPEC-PROJECT-001: 수락 기준 (Acceptance Criteria)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-PROJECT-001 |
| 제목 | 프로젝트(게임) 관리 기능 수락 기준 |
| 생성일 | 2026-01-02 |
| 관련 SPEC | SPEC-PROJECT-001/spec.md |

---

## 1. 수락 기준 개요

### 1.1 테스트 범위

- 프로젝트 CRUD 기능 (Create, Read, Update, Delete)
- 프로젝트 선택/전환 기능
- 상태 관리 동기화
- API 엔드포인트 동작
- UI 컴포넌트 상호작용

### 1.2 테스트 환경

- Node.js 20.x LTS
- React 18.x 개발 서버 (포트 5173)
- Express 백엔드 서버 (포트 3001)
- 브라우저: Chrome/Firefox 최신 버전

---

## 2. 기능별 수락 기준

### AC-001: 프로젝트 생성 - 기본 필드

**Given** 사용자가 애플리케이션에 접속하고 있고, ProjectSelector가 표시되어 있을 때

**When** 사용자가 "새 프로젝트" 버튼을 클릭하면

**Then**
- ProjectCreateModal이 화면 중앙에 표시된다
- 모달에는 다음 필드가 포함된다:
  - 프로젝트 이름 (필수, 텍스트 입력)
  - 설명 (선택, 텍스트 영역)
  - 기술 스택 (선택, 태그 입력)
  - 카테고리 (선택, 태그 입력)
- 취소 버튼과 생성 버튼이 표시된다
- 이름 필드가 비어있으면 생성 버튼이 비활성화된다

---

### AC-002: 프로젝트 생성 - 저장 및 자동 선택

**Given** ProjectCreateModal이 열려있고, 사용자가 프로젝트 이름 "테스트 게임"을 입력했을 때

**When** 사용자가 "생성" 버튼을 클릭하면

**Then**
- POST /api/projects API가 호출된다
- 성공 시:
  - 모달이 닫힌다
  - 새 프로젝트가 프로젝트 목록에 추가된다
  - 새 프로젝트가 자동으로 선택된다 (currentProjectId 업데이트)
  - 성공 토스트 메시지 "프로젝트가 생성되었습니다"가 표시된다
  - workspace/projects/{id}/ 디렉토리가 생성된다
  - project.json, RootRule.md, systems/, tasks/, archives/ 구조가 초기화된다
- 실패 시:
  - 에러 메시지가 모달 내에 표시된다
  - 모달은 열린 상태를 유지한다

---

### AC-003: 프로젝트 목록 조회 - 애플리케이션 시작

**Given** 애플리케이션이 시작되고, workspace/projects/에 2개의 프로젝트가 저장되어 있을 때

**When** 애플리케이션 초기 로드가 완료되면

**Then**
- GET /api/projects API가 호출된다
- 2개의 프로젝트가 Zustand store에 로드된다
- 프로젝트는 생성일 기준 최신순으로 정렬된다
- 첫 번째 프로젝트가 자동으로 선택된다
- ProjectSelector에 첫 번째 프로젝트 이름이 표시된다

---

### AC-004: 프로젝트 선택 - 드롭다운 열기

**Given** ProjectSelector가 표시되어 있고, 프로젝트 "게임 A"가 현재 선택되어 있을 때

**When** 사용자가 ProjectSelector를 클릭하면

**Then**
- 드롭다운 메뉴가 아래로 펼쳐진다
- 모든 프로젝트 목록이 표시된다
- 현재 선택된 "게임 A"에 체크 표시가 된다
- 목록 하단에 "새 프로젝트" 버튼이 표시된다

---

### AC-005: 프로젝트 선택 - 전환

**Given** ProjectSelector 드롭다운이 열려있고, "게임 A", "게임 B" 2개의 프로젝트가 있을 때

**When** 사용자가 "게임 B"를 클릭하면

**Then**
- 드롭다운이 닫힌다
- currentProjectId가 "게임 B"의 ID로 업데이트된다
- ProjectSelector에 "게임 B"가 표시된다
- 해당 프로젝트의 시스템 문서와 태스크 로드가 트리거된다 (후속 SPEC에서 구현)

---

### AC-006: 프로젝트 수정 - 설정 모달

**Given** ProjectSelector에서 "게임 A"가 선택되어 있을 때

**When** 사용자가 설정 버튼(기어 아이콘)을 클릭하면

**Then**
- ProjectSettingsModal이 표시된다
- 현재 프로젝트 정보가 폼에 로드된다:
  - 이름: "게임 A"
  - 설명: 기존 설명
  - 기술 스택: 기존 기술 스택 태그
  - 카테고리: 기존 카테고리 태그
- 4개의 탭이 표시된다: 기본 정보, 기술 스택, 카테고리, 위험 영역

**When** 사용자가 이름을 "게임 A 업데이트"로 수정하고 저장 버튼을 클릭하면

**Then**
- PUT /api/projects/{id} API가 호출된다
- 성공 시:
  - 모달이 닫힌다
  - 프로젝트 목록이 업데이트된다
  - ProjectSelector에 "게임 A 업데이트"가 표시된다
  - 성공 토스트 "프로젝트가 수정되었습니다"가 표시된다
  - workspace/projects/{id}/project.json의 updatedAt이 갱신된다

---

### AC-007: 프로젝트 삭제 - 확인 다이얼로그

**Given** ProjectSettingsModal이 열려있고, "위험 영역" 탭이 선택되어 있을 때

**When** 사용자가 "프로젝트 삭제" 버튼을 클릭하면

**Then**
- 확인 다이얼로그가 표시된다
- 경고 메시지: "이 작업은 되돌릴 수 없습니다. 프로젝트와 모든 관련 데이터가 삭제됩니다."
- 프로젝트 이름 입력 필드가 표시된다 (삭제 확인용)
- "삭제" 버튼은 프로젝트 이름을 정확히 입력해야 활성화된다

---

### AC-008: 프로젝트 삭제 - 실행

**Given** 삭제 확인 다이얼로그가 열려있고, 프로젝트 이름이 정확히 입력되어 있을 때

**When** 사용자가 "삭제" 버튼을 클릭하면

**Then**
- DELETE /api/projects/{id} API가 호출된다
- 성공 시:
  - 모든 다이얼로그와 모달이 닫힌다
  - 프로젝트가 목록에서 제거된다
  - workspace/projects/{id}/ 디렉토리가 삭제된다
  - 다른 프로젝트가 있으면 첫 번째 프로젝트가 자동 선택된다
  - 프로젝트가 없으면 빈 상태 메시지가 표시된다
  - 성공 토스트 "프로젝트가 삭제되었습니다"가 표시된다

---

## 3. 에지 케이스 테스트 시나리오

### EC-001: 프로젝트 없음 상태

**Given** workspace/projects/에 프로젝트가 없을 때

**When** 애플리케이션이 시작되면

**Then**
- ProjectSelector에 "프로젝트 선택" placeholder가 표시된다
- 드롭다운 클릭 시 "프로젝트가 없습니다. 새 프로젝트를 만들어주세요" 메시지가 표시된다
- "새 프로젝트" 버튼이 강조 표시된다

---

### EC-002: 중복 프로젝트 이름

**Given** "테스트 프로젝트"라는 이름의 프로젝트가 이미 존재할 때

**When** 사용자가 동일한 이름 "테스트 프로젝트"로 새 프로젝트를 생성하려고 하면

**Then**
- 경고 메시지 "동일한 이름의 프로젝트가 이미 존재합니다"가 표시된다
- 생성 버튼이 비활성화된다

---

### EC-003: 마지막 프로젝트 삭제

**Given** 프로젝트가 1개만 존재할 때

**When** 사용자가 해당 프로젝트를 삭제하면

**Then**
- 추가 경고: "마지막 프로젝트입니다. 삭제하면 모든 작업 데이터가 사라집니다."
- 삭제 후 빈 상태로 전환된다
- currentProjectId가 null로 설정된다

---

### EC-004: 모달 외부 클릭

**Given** ProjectCreateModal이 열려있을 때

**When** 사용자가 모달 외부(오버레이)를 클릭하면

**Then**
- 모달이 닫힌다
- 입력한 데이터는 저장되지 않는다

---

### EC-005: ESC 키로 모달 닫기

**Given** ProjectSettingsModal이 열려있을 때

**When** 사용자가 ESC 키를 누르면

**Then**
- 모달이 닫힌다
- 저장되지 않은 변경사항은 폐기된다

---

### EC-006: 키보드 네비게이션 (드롭다운)

**Given** ProjectSelector가 포커스되어 있을 때

**When** 사용자가 Enter 키를 누르면

**Then**
- 드롭다운이 열린다

**When** 드롭다운이 열린 상태에서 화살표 아래 키를 누르면

**Then**
- 다음 프로젝트 항목으로 포커스가 이동한다

**When** 프로젝트 항목에 포커스된 상태에서 Enter 키를 누르면

**Then**
- 해당 프로젝트가 선택된다
- 드롭다운이 닫힌다

---

## 4. API 테스트 시나리오

### API-001: GET /api/projects - 성공

**Given** workspace/projects/에 2개의 프로젝트가 있을 때

**When** GET /api/projects 요청을 보내면

**Then**
- 상태 코드: 200
- 응답 형식:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Project A",
      "description": "Description A",
      "techStack": ["Unity", "Node.js"],
      "categories": ["System", "Content"],
      "defaultReferences": [],
      "createdAt": "2026-01-02T10:00:00.000Z",
      "updatedAt": "2026-01-02T10:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "name": "Project B",
      ...
    }
  ],
  "error": null
}
```

---

### API-002: POST /api/projects - 성공

**Given** 유효한 프로젝트 데이터가 있을 때

**When** POST /api/projects 요청을 보내면:
```json
{
  "name": "New Project",
  "description": "New Description",
  "techStack": ["Unreal", "AWS"],
  "categories": ["Combat", "Economy"]
}
```

**Then**
- 상태 코드: 201
- 응답에 생성된 프로젝트 정보 포함
- id, createdAt, updatedAt이 자동 생성됨
- workspace/projects/{id}/ 디렉토리 구조가 생성됨

---

### API-003: POST /api/projects - 실패 (이름 없음)

**Given** 이름 필드가 누락된 요청일 때

**When** POST /api/projects 요청을 보내면:
```json
{
  "description": "No name"
}
```

**Then**
- 상태 코드: 400
- 응답:
```json
{
  "success": false,
  "data": null,
  "error": "프로젝트 이름은 필수입니다"
}
```

---

### API-004: PUT /api/projects/:id - 성공

**Given** ID가 "uuid-1"인 프로젝트가 존재할 때

**When** PUT /api/projects/uuid-1 요청을 보내면:
```json
{
  "name": "Updated Name"
}
```

**Then**
- 상태 코드: 200
- 응답에 업데이트된 프로젝트 정보 포함
- updatedAt이 갱신됨

---

### API-005: PUT /api/projects/:id - 실패 (프로젝트 없음)

**Given** ID가 "non-existent"인 프로젝트가 없을 때

**When** PUT /api/projects/non-existent 요청을 보내면

**Then**
- 상태 코드: 404
- 응답:
```json
{
  "success": false,
  "data": null,
  "error": "프로젝트를 찾을 수 없습니다"
}
```

---

### API-006: DELETE /api/projects/:id - 성공

**Given** ID가 "uuid-1"인 프로젝트가 존재할 때

**When** DELETE /api/projects/uuid-1 요청을 보내면

**Then**
- 상태 코드: 200
- 응답:
```json
{
  "success": true,
  "data": null,
  "error": null
}
```
- workspace/projects/uuid-1/ 디렉토리가 삭제됨

---

## 5. 비기능 요구사항 검증

### NFR-001: 성능 테스트

| 항목 | 기준 | 측정 방법 |
|------|------|-----------|
| 프로젝트 목록 로드 | 500ms 이내 | Chrome DevTools Network |
| 프로젝트 생성 | 1초 이내 | API 응답 시간 측정 |
| 프로젝트 전환 | 200ms 이내 | React Profiler |

### NFR-002: 데이터 무결성 검증

- [ ] 프로젝트 삭제 후 workspace에 잔여 데이터 없음 확인
- [ ] 저장 실패 시 기존 project.json 손상 없음 확인
- [ ] 동시 저장 시 데이터 충돌 없음 확인 (단일 사용자 환경)

### NFR-003: 접근성 검증

- [ ] 모든 버튼에 aria-label 속성 존재
- [ ] 모달 열림 시 포커스 트랩 동작
- [ ] 스크린 리더 호환성 테스트

---

## 6. Definition of Done

### 필수 완료 항목

- [ ] 모든 API 엔드포인트가 구현되고 테스트됨
- [ ] 모든 React 컴포넌트가 구현됨
- [ ] Zustand store가 API와 연동됨
- [ ] AC-001 ~ AC-008 수락 기준 통과
- [ ] EC-001 ~ EC-006 에지 케이스 통과
- [ ] API-001 ~ API-006 API 테스트 통과
- [ ] TypeScript 컴파일 오류 없음
- [ ] ESLint 경고 없음

### 권장 완료 항목

- [ ] Vitest 단위 테스트 작성 (커버리지 80% 이상)
- [ ] Storybook 컴포넌트 문서화
- [ ] E2E 테스트 시나리오 수동 검증

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
