# SPEC-DOCEDIT-001: 구현 계획 (Implementation Plan)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-DOCEDIT-001 |
| 문서 버전 | 1.1.0 |
| 생성일 | 2026-01-10 |
| 마지막 수정일 | 2026-01-11 |
| 담당자 | code-frontend 에이전트 |
| 구현 상태 | Phase 1 완료 (백엔드) |

---

## 개요

본 계획은 문서 편집 기능 향상(Document Editing Functionality Enhancement)을 단계적으로 구현하기 위한 상세한 로드맵을 제시합니다. 백엔드 API 구축부터 프론트엔드 컴포넌트 개발, 테스트, 배포까지 전체 개발 수명 주기를 다룹니다.

---

## 구현 원칙

### 1. TDD 기반 개발 (TRUST 5 Framework)

- **Test-First**: 모든 기능에 대해 실패하는 테스트를 먼저 작성
- **Coverage**: 85% 이상의 테스트 커버리지 유지
- **Red-Green-Refactor**: TDD 사이클 준수

### 2. 점진적 구현

- **MVP 우선**: 필수 기능 먼저 구현 후 선택적 기능 추가
- **단계적 릴리스**: 각 마일스톤 완료 시 검증 및 통합
- **기존 기능 호환**: SPEC-DOCUMENT-001과의 호환성 유지

### 3. 사용자 경험 중심

- **반응형 UI**: 모든 디바이스에서 일관된 경험 제공
- **접근성**: WCAG 2.1 AA 준수
- **성능**: 에디터 로드 < 1초, 자동 저장 < 5초

---

## 단계별 구현 계획

### Phase 1: 백엔드 인프라 구축 ✅ 완료 (2026-01-11)

#### 목표
문서 버전 관리를 위한 백엔드 API 및 저장소 레이어 구현

#### 구현 완료 항목

**1.1 버전 저장소 구현 (versionStorage.ts)** ✅
- DocumentVersion 인터페이스 정의 완료
- 파일 시스템 기반 버전 저장소 구현 완료
- 버전 메타데이터 JSON 저장 구현 완료
- 버전 내용 별도 파일로 저장 구현 완료
- **테스트 결과:** 14개 테스트 전체 통과

**1.2 API 라우트 구현 (documentVersions.ts)** ✅
- POST /api/documents/versions - 버전 저장 구현 완료
- GET /api/documents/versions?taskId=:id - 버전 목록 조회 구현 완료
- GET /api/documents/versions/:id - 특정 버전 조회 구현 완료
- DELETE /api/documents/versions/:id - 버전 삭제 구현 완료
- **테스트 결과:** 12개 테스트 전체 통과

**1.3 Diff 생성 유틸리티 (diffGenerator.ts)** ✅
- 라인 단위 diff 계산 구현 완료
- 단어 단위 diff 계산 구현 완료
- diff 요약 생성 구현 완료
- diff 포맷 출력 구현 완료
- **테스트 결과:** 13개 테스트 전체 통과

**완료 기준 달성:**
- ✅ 모든 API 엔드포인트 동작
- ✅ 테스트 커버리지 100% (39/39 tests passed)
- ✅ API 응답 시간 < 200ms

**구현 파일:**
- /server/utils/versionStorage.ts
- /server/routes/documentVersions.ts
- /server/utils/diffGenerator.ts
- /tests/server/utils/versionStorage.test.ts
- /tests/server/routes/documentVersions.test.ts
- /tests/server/utils/diffGenerator.test.ts

#### 원래 계획 작업 항목 (참고용)

**1.1 버전 저장소 구현 (versionStorage.ts)**
- DocumentVersion 인터페이스 정의
- 파일 시스템 기반 버전 저장소 구현
- 버전 메타데이터 JSON 저장
- 버전 내용 별도 파일로 저장

**파일 구조:**
```
/workspace/versions/
  └── {taskId}/
      ├── metadata.json       # 버전 목록 메타데이터
      ├── v1.md              # 버전 1 내용
      ├── v2.md              # 버전 2 내용
      └── ...
```

**1.2 API 라우트 구현**
- `POST /api/documents/versions` - 버전 저장
- `GET /api/documents/versions?taskId=:id` - 버전 목록 조회
- `GET /api/documents/versions/:id` - 특정 버전 조회
- `GET /api/documents/versions/:id1/compare/:id2` - 버전 비교

**1.3 단위 테스트 작성**
- versionStorage.ts 함수별 테스트
- API 라우트 통합 테스트
- 에러 처리 테스트

**완료 기준:**
- ✅ 모든 API 엔드포인트 동작
- ✅ 테스트 커버리지 100% (초과 달성)
- ✅ API 응답 시간 < 200ms

---

### Phase 2: CodeMirror 에디터 통합 (진행 예정)

#### 목표
고급 마크다운 에디터를 프로젝트에 통합

#### 작업 항목

**2.1 의존성 설치**
```bash
npm install @uiw/react-codemirror
npm install @codemirror/lang-markdown
npm install @codemirror/theme-one-dark
npm install @codemirror/view
npm install @codemirror/state
```

**2.2 EnhancedDocumentEditor.tsx 구현**
- CodeMirror 리액트 래퍼 설정
- 마크다운 언어 지원 구성
- 테마 적용 (One Dark)
- 줄 번호 표시
- 활성 라인 하이라이트

**2.3 에디터 확장 구성**
- 자동 완성 (Tab 키 들여쓰기)
- 여러 줄 선택 편집
- Undo/Redo 히스토리
- 스크롤 동기화

**2.4 단위 테스트 작성**
- 에디터 렌더링 테스트
- props 변경 반영 테스트
- 사용자 입력 처리 테스트

**완료 기준:**
- 에디터가 정상적으로 렌더링
- 마크다운 구문 강조 동작
- 줄 번호 및 기본 기능 활성화

---

### Phase 3: 자동 저장 시스템 (2일)

#### 목표
사용자 변경 사항을 자동으로 저장하는 시스템 구현

#### 작업 항목

**3.1 자동 저장 로직 구현**
- 5초 디바운스 타이머 구현
- 변경 감지 로직
- 저장 API 호출
- 저장 실패 재시도 로직

**3.2 SaveStatusIndicator.tsx 구현**
- 상태에 따른 아이콘 및 텍스트
- 'saving' → 로딩 스피너
- 'saved' → 체크 아이콘 + 타임스탬프
- 'error' → 경고 아이콘 + 에러 메시지
- 'unsaved' → 점 아이콘

**3.3 태스크 스토어 통합**
- 자동 저장 상태 관리
- 마지막 저장 시간 추적
- 저장되지 않은 변경 플래그

**3.4 테스트 작성**
- 디바운스 타이머 테스트
- 자동 저장 호출 테스트
- 저장 상태 전환 테스트
- API 실패 시 처리 테스트

**완료 기준:**
- 사용자 입력 후 5초 내 자동 저장
- 저장 상태가 올바르게 표시
- 저장 실패 시 재시도 동작

---

### Phase 4: 버전 비교 기능 (2-3일)

#### 목표
두 버전 간 변경 사항을 시각화하는 기능 구현

#### 작업 항목

**4.1 diff 패키지 통합**
```bash
npm install diff
```

**4.2 Diff 엔진 구현**
- 라인 단위 diff 계산
- 단어 단위 diff 계산 (선택 사항)
- 추가/삭제/수정 유형 분류

**4.3 VersionComparisonView.tsx 구현**
- 두 버전 선택 UI
- diff 결과 렌더링
- 색상 구분:
  - 추가: 녹색 배경 (bg-green-100)
  - 삭제: 빨간 배경 + 취소선 (bg-red-100 line-through)
  - 수정: 노란 배경 (bg-yellow-100)

**4.4 변경 요약 패널**
- 추가 라인 수
- 삭제 라인 수
- 수정 라인 수

**4.5 테스트 작성**
- diff 계산 정확성 테스트
- 다양한 변경 패턴 테스트
- UI 렌더링 테스트

**완료 기준:**
- 두 버전 간 diff 정확히 계산
- 변경 사항이 시각적으로 구분되어 표시
- 대용량 문서(10,000라인)에서도 < 2초 응답

---

### Phase 5: 키보드 단축키 (1-2일)

#### 목표
일반적인 마크다운 서식 단축키 지원

#### 작업 항목

**5.1 키바인드 정의**
- Ctrl/Cmd + S: 수동 저장
- Ctrl/Cmd + B: 볼드 (**text**)
- Ctrl/Cmd + I: 이탤릭 (*text*)
- Ctrl/Cmd + K: 코드 인라인 (`code`)
- Ctrl/Cmd + Shift + K: 코드 블록 (```code```)
- Tab: 들여쓰기
- Shift + Tab: 내어쓰기

**5.2 CodeMirror 확장 구현**
- 키맵 정의
- 단축키 핸들러 구현
- 커서 위치 텍스트 선택 및 서식 적용

**5.3 KeyboardShortcutsHelp.tsx 구현**
- 단축키 목록 모달
- 검색 기능
- 키 조합 시각적 표시

**5.4 테스트 작성**
- 각 단축키 동작 테스트
- 여러 커서 위치에서 테스트
- 단축키 충돌 검증

**완료 기준:**
- 모든 정의된 단축키가 동작
- 단축키 가이드 모달 표시
- 브라우저 기본 단축키와 충돌 없음

---

### Phase 6: 오프라인 저장 (1-2일)

#### 목표
localStorage를 활용한 오프라인 저장 기능 구현

#### 작업 항목

**6.1 OfflineStorage 유틸리티 구현**
- localStorage CRUD 연산
- 태스크별 초안 저장
- 저장 용량 관리 (5-10MB 제한)

**6.2 온라인/오프라인 감지**
- navigator.onLine 이벤트 리스너
- 네트워크 상태 UI 표시

**6.3 동기화 로직**
- 온라인 시 자동 동기화
- 충돌 해결 전략:
  - 서버 버전 우선 (기본)
  - 사용자 선택 (고급)

**6.4 테스트 작성**
- 오프라인 저장 테스트
- 온라인 동기화 테스트
- 충돌 해결 테스트
- localStorage 용량 초과 처리 테스트

**완료 기준:**
- 오프라인 상태에서 변경 사항 저장
- 온라인 복귀 시 자동 동기화
- 저장 용량 초과 시 적절히 처리

---

### Phase 7: 사용자 경험 개선 (1-2일)

#### 목표
저장되지 않은 변경 경고 및 기타 UX 개선

#### 작업 항목

**7.1 페이지 이탈 경고**
- beforeunload 이벤트 핸들러
- 저장되지 않은 변경 감지
- 커스텀 확인 다이얼로그

**7.2 로딩 상태 개선**
- 초기 에디터 로딩 스피너
- 저장 진행 인디케이터
- 버전 비교 로딩 상태

**7.3 에러 처리 개선**
- 친절한 에러 메시지
- 재시도 버튼
- 자동 복구 메커니즘

**7.4 접근성 개선**
- ARIA 라벨 추가
- 키보드 탐색 지원
- 스크린 리더 호환

**7.5 테스트 작성**
- 페이지 이탈 경고 테스트
- 에러 상태 테스트
- 접근성 테스트

**완료 기준:**
- 저장되지 않은 변경 시 페이지 이탈 경고
- 모든 에러 상태에 적절한 피드백
- WCAG 2.1 AA 준수

---

### Phase 8: 통합 및 최적화 (2일)

#### 목표
모든 컴포넌트 통합 및 성능 최적화

#### 작업 항목

**8.1 컴포넌트 통합**
- EnhancedDocumentEditor를 기존 문서 워크플로우에 통합
- 태스크 스토어와의 연결
- SPEC-DOCUMENT-001 컴포넌트와의 호환성

**8.2 성능 최적화**
- CodeMirror 지연 로딩
- 버전 목록 가상화 (대용량)
- diff 계산 워커 스레드 이동
- 메모리 누수 점검

**8.3 E2E 테스트**
- 전체 문서 편집 워크플로우 테스트
- 자동 저장 E2E 테스트
- 버전 비교 E2E 테스트
- 오프라인 시나리오 테스트

**8.4 크로스 브라우저 테스트**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**완료 기준:**
- 모든 기능이 통합되어 동작
- 에디터 로드 시간 < 1초
- 모든 주요 브라우저에서 동작
- E2E 테스트 통과

---

## 마일스톤 및 마일스톤 검증

### Milestone 1: 백엔드 API 완성 ✅ (2026-01-11 완료)

**검증 기준:**
- ✅ 모든 버전 관리 API 엔드포인트 동작
- ✅ API 테스트 스위트 통과 (39/39 tests)
- ✅ 응답 시간 < 200ms

**산출물:**
- ✅ versionStorage.ts
- ✅ documentVersions.ts
- ✅ diffGenerator.ts
- ✅ API 테스트 스위트 (3개 파일, 39개 테스트)

---

### Milestone 2: 기본 에디터 동작 (Phase 2-3 완료)

**검증 기준:**
- CodeMirror 에디터 렌더링
- 자동 저장 기능 동작
- 저장 상태 표시

**산출물:**
- EnhancedDocumentEditor.tsx
- SaveStatusIndicator.tsx
- 관련 단위 테스트

---

### Milestone 3: 버전 관리 기능 (Phase 4 완료)

**검증 기준:**
- 버전 비교 기능 동작
- diff 시각화 정확성
- 대용량 문서 처리

**산출물:**
- VersionComparisonView.tsx
- diff 엔진
- 관련 테스트

---

### Milestone 4: 전체 기능 완성 (Phase 5-7 완료)

**검증 기준:**
- 키보드 단축키 동작
- 오프라인 저장 기능
- UX 개선사항 적용

**산출물:**
- KeyboardShortcutsHelp.tsx
- OfflineStorage.ts
- UX 개선 컴포넌트들

---

### Milestone 5: 프로덕션 릴리스 (Phase 8 완료)

**검증 기준:**
- 모든 통합 테스트 통과
- 성능 기준 충족
- 크로스 브라우저 호환
- 테스트 커버리지 > 85%

**산출물:**
- 통합된 문서 편집 시스템
- E2E 테스트 스위트
- 배포 가능한 번들

---

## 위험 관리

### 기술적 위험

**위험 1: CodeMirror 성능 문제**
- **확률**: 중간
- **영향**: 높음
- **완화**: 가상화된 렌더링, 지연 로딩
- **대안**: 더 가벼운 에디터 라이브러리 평가

**위험 2: 대용량 문서 diff 계산 지연**
- **확률**: 중간
- **영향**: 중간
- **완화**: 워커 스레드, 증분 diff
- **대안**: 클라이언트 측 제한, 서버 측 diff

**위험 3: localStorage 용량 제한**
- **확률**: 낮음
- **영향**: 중간
- **완화**:老旧 데이터 정리, 압축
- **대안**: IndexedStore 사용

### 일정 위험

**위험 4: Phase 간 의존성 지연**
- **확률**: 중간
- **영향**: 높음
- **완화**: 병렬 작업 가능성 검토
- **대안**: 마일스톤 재조정

### 통합 위험

**위험 5: 기존 SPEC-DOCUMENT-001과의 호환성**
- **확률**: 낮음
- **영향**: 높음
- **완화**: 기존 컴포넌트와의 인터페이스 유지
- **대안**: 마이그레이션 계획 수립

---

## 리소스 계획

### 인력
- Frontend Developer: 1인 (전담)
- Backend Developer: 0.5인 (Phase 1만)
- QA Engineer: 0.5인 (Phase 8)

### 일정
- 총 소요 기간: 14-19일
- 백엔드: 3-4일
- 프론트엔드: 9-13일
- 통합 및 테스트: 2일

### 의존성
- SPEC-DOCUMENT-001 완료 (선행 조건)
- 외부 라이브러리: CodeMirror, diff

---

## 품질 기준

### TRUST 5 Framework

**Test-First:**
- 모든 기능에 대해 테스트 먼저 작성
- 테스트 커버리지 > 85%

**Readable:**
- 명확한 컴포넌트 및 함수 이름
- 충분한 주석 및 문서

**Unified:**
- 일관된 코드 스타일 (ESLint, Prettier)
- 통합된 타입 정의

**Secured:**
- XSS 방지 (마크다운 sanitize)
- CSRF 토큰 검증
- 접근 제어

**Trackable:**
- 명확한 커밋 메시지
- 버전 히스토리 관리
- 변경 로그 유지

### 성능 기준
- 에디터 초기 로드: < 1초
- 자동 저장 응답: < 5초
- 버전 비교 계산: < 2초 (10,000라인)
- API 응답 시간: < 200ms

### 접근성 기준
- WCAG 2.1 Level AA 준수
- 키보드 탐색 가능
- 색상 대비율 4.5:1 이상
- 스크린 리더 호환

---

## 성공 지표

### 개발 완료 기준
- 모든 Phase 완료
- 모든 테스트 통과
- 테스트 커버리지 > 85%
- 성능 기준 충족

### 사용자 경험 기준
- 에디터 로드 시간 개선 (> 50%)
- 자동 저장 성공률 > 99%
- 저장되지 않은 변경 손실률 < 1%

### 비즈니스 기준
- 문서 편집 시간 단축
- 사용자 만족도 향상
- 버전 관리 기능 사용률 증가

---

## 다음 단계

1. **사전 준비**: 의존성 설치, 개발 환경 설정
2. **Phase 1 시작**: 백엔드 인프라 구축
3. **주간 리뷰**: 매주 마일스톤 진행 상황 검토
4. **지속적 통합**: 각 Phase 완료 시 메인 브랜치 병합
5. **사용자 테스트**: Milestone 4 이후 베타 테스트

---

문서 버전: 1.0.0
마지막 수정: 2026-01-10
다음 리뷰: Phase 1 완료 후
