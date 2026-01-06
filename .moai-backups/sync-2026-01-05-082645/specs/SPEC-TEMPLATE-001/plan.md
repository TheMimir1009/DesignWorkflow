---
id: SPEC-TEMPLATE-001
version: "1.0.0"
status: "draft"
created: "2026-01-04"
updated: "2026-01-04"
author: "manager-spec"
priority: "medium"
---

# SPEC-TEMPLATE-001: Implementation Plan

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | manager-spec | Initial plan creation |

---

## TAG BLOCK

```yaml
spec_id: SPEC-TEMPLATE-001
document_type: implementation-plan
created: 2026-01-04
updated: 2026-01-04
```

---

## Implementation Overview

### Scope Summary

Template System은 Q&A 질문 템플릿, 문서 구조 템플릿, AI 프롬프트 템플릿을 관리하는 통합 시스템입니다. 기존 QuestionTemplate 타입을 확장하고, 변수 치환 시스템을 구현하여 동적 템플릿 적용을 지원합니다.

### Technical Approach

- **Backend First**: Express API 및 파일 스토리지 구현
- **Type Extension**: 기존 QuestionTemplate을 Template 시스템으로 통합
- **Component Reuse**: MarkdownEditor, TagInput 등 기존 컴포넌트 재사용
- **State Pattern**: Zustand 스토어로 템플릿 상태 관리

---

## Implementation Milestones

### Phase 1: Core Infrastructure (Primary Goal)

#### Objective
백엔드 API와 기본 데이터 모델 구축

#### Tasks

1. **Type Definitions Extension**
   - Template, TemplateVariable, TemplateCategory 타입 정의
   - TemplateState 인터페이스 추가
   - CreateTemplateDto, UpdateTemplateDto 정의

2. **Backend API Implementation**
   - server/routes/templates.ts 라우트 생성
   - CRUD 엔드포인트 구현 (GET, POST, PUT, DELETE)
   - server/utils/templateStorage.ts 파일 시스템 유틸리티

3. **File Storage Structure**
   - workspace/templates/ 디렉토리 구조 생성
   - templates.json 메타데이터 인덱스 구현
   - 카테고리별 하위 디렉토리 구성

4. **Default Templates Migration**
   - 기존 game_mechanic.json, economy.json, growth.json 통합
   - 새 Template 형식으로 변환

#### Deliverables
- Template API endpoints 완성
- 파일 기반 템플릿 저장 시스템
- 기본 Q&A 템플릿 3종

---

### Phase 2: Template Editor UI (Secondary Goal)

#### Objective
템플릿 생성/편집 UI 컴포넌트 구현

#### Tasks

1. **Template Store Creation**
   - src/store/templateStore.ts Zustand 스토어
   - 템플릿 목록, 선택, 필터링 상태 관리
   - API 통신 액션 구현

2. **Template List Components**
   - TemplateManager.tsx 메인 페이지
   - TemplateList.tsx 카테고리별 목록
   - TemplateCard.tsx 개별 템플릿 카드

3. **Template Modal Components**
   - TemplateCreateModal.tsx 생성 모달
   - TemplateEditModal.tsx 편집 모달
   - 카테고리 선택, 이름 입력, 콘텐츠 편집

4. **Variable Editor Component**
   - TemplateVariableEditor.tsx 변수 정의 UI
   - 변수 추가/삭제/수정 기능
   - 변수 타입 선택 (text, textarea, select, number)

#### Deliverables
- 템플릿 관리 UI 완성
- 변수 정의 에디터
- 카테고리별 필터링

---

### Phase 3: Template Application (Tertiary Goal)

#### Objective
템플릿 적용 및 미리보기 기능 구현

#### Tasks

1. **Variable Parser Utility**
   - src/utils/templateParser.ts 변수 파싱 로직
   - {{variable_name}} 패턴 인식
   - 변수 치환 알고리즘 구현

2. **Template Preview Component**
   - TemplatePreview.tsx 미리보기 컴포넌트
   - 샘플 값으로 변수 치환 표시
   - Markdown 렌더링 (문서 템플릿용)

3. **Variable Input Form**
   - TemplateVariableForm.tsx 변수 입력 폼
   - 동적 폼 필드 생성
   - 필수/선택 변수 처리

4. **Application API**
   - POST /templates/:id/apply 엔드포인트
   - 변수 값 검증
   - 치환된 콘텐츠 반환

#### Deliverables
- 변수 치환 시스템 완성
- 템플릿 미리보기 기능
- 동적 변수 입력 폼

---

### Phase 4: Integration (Final Goal)

#### Objective
기존 시스템과 통합 및 프로젝트 설정 연동

#### Tasks

1. **Q&A Form Integration**
   - QAFormModal.tsx와 템플릿 연동
   - 템플릿 선택 시 질문 자동 로드
   - 카테고리 변경 시 템플릿 전환

2. **Project Settings Integration**
   - ProjectSettingsModal에 기본 템플릿 설정 추가
   - 프로젝트별 템플릿 오버라이드
   - GET /projects/:projectId/templates API

3. **Import/Export Feature**
   - TemplateImportExport.tsx 컴포넌트
   - JSON 내보내기/가져오기
   - 템플릿 유효성 검증

4. **Navigation Integration**
   - Header 또는 Sidebar에 템플릿 관리 링크
   - 템플릿 페이지 라우팅 설정

#### Deliverables
- Q&A 시스템 템플릿 통합
- 프로젝트 설정 연동
- Import/Export 기능

---

## Technical Architecture

### File Structure

```
src/
├── components/
│   └── template/
│       ├── TemplateManager.tsx
│       ├── TemplateList.tsx
│       ├── TemplateCard.tsx
│       ├── TemplateCreateModal.tsx
│       ├── TemplateEditModal.tsx
│       ├── TemplatePreview.tsx
│       ├── TemplateVariableEditor.tsx
│       ├── TemplateVariableForm.tsx
│       └── TemplateImportExport.tsx
├── store/
│   └── templateStore.ts
├── services/
│   └── templateService.ts
├── utils/
│   └── templateParser.ts
└── types/
    └── index.ts (Template types 추가)

server/
├── routes/
│   └── templates.ts
└── utils/
    └── templateStorage.ts

workspace/
└── templates/
    ├── templates.json
    ├── qa-questions/
    ├── document-structure/
    └── prompts/
```

### Data Flow

```
User Action (Create Template)
    ↓
TemplateCreateModal (UI)
    ↓
templateStore.createTemplate() (State)
    ↓
templateService.create() (API Call)
    ↓
POST /api/templates (Express Route)
    ↓
templateStorage.save() (File I/O)
    ↓
Response → Store Update → UI Re-render
```

### Variable Substitution Flow

```
Template Content: "{{project_name}}의 {{feature_name}} 설계"
                        ↓
Variable Values: { project_name: "게임A", feature_name: "전투시스템" }
                        ↓
templateParser.substitute()
                        ↓
Result: "게임A의 전투시스템 설계"
```

---

## Dependencies

### Internal Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| SPEC-PROJECT-001 | Required | 프로젝트 컨텍스트 (projectId) |
| SPEC-SYSTEM-001 | Optional | 시스템 문서 참조 패턴 |
| MarkdownEditor | Reuse | 문서 템플릿 편집 |
| TagInput | Reuse | 변수 태그 입력 |
| ConfirmDialog | Reuse | 삭제 확인 다이얼로그 |

### External Dependencies

| Package | Purpose |
|---------|---------|
| zustand | Template state management |
| react-markdown | Document template preview |
| uuid | Template ID generation |

---

## Risk Mitigation

### Risk 1: Variable Parsing Complexity

**Mitigation**:
- 정규식 기반 단순 파서로 시작
- {{...}} 패턴만 지원 (중첩 미지원)
- 충분한 단위 테스트 작성

### Risk 2: Template-Project Coupling

**Mitigation**:
- projectId: null로 전역 템플릿 지원
- 프로젝트 삭제 시 템플릿 유지
- 참조 무결성 경고 표시

### Risk 3: Large Template Content

**Mitigation**:
- 목록에서는 메타데이터만 로드
- 콘텐츠는 편집/미리보기 시 Lazy Load
- 10KB 이상 템플릿 경고

---

## Quality Gates

### Phase 1 Quality Gates

- All API endpoints return correct status codes
- File storage creates expected directory structure
- Default templates load successfully
- Unit test coverage >= 80%

### Phase 2 Quality Gates

- Template CRUD UI functions correctly
- Category filtering works
- Variable editor supports all types
- Component tests pass

### Phase 3 Quality Gates

- Variable substitution handles all edge cases
- Preview renders correctly for all template types
- Performance: substitution < 50ms

### Phase 4 Quality Gates

- Q&A form loads template questions
- Project settings persist template choices
- Import/Export round-trip preserves data
- E2E test: full template workflow passes

---

## Success Criteria

1. Template CRUD 작업이 500ms 이내에 완료
2. 변수 치환이 50ms 이내에 완료
3. 3가지 기본 카테고리의 템플릿 지원
4. 기존 Q&A 시스템과 seamless 통합
5. Import/Export로 템플릿 백업/복원 가능
6. 테스트 커버리지 85% 이상

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | workflow-spec | Initial plan creation |
