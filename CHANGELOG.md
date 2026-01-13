# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- SPEC-DOCEDIT-002: Circular dependency fix for document components
  - Created shared `types.ts` file with `SaveStatus` type
  - Updated `EnhancedDocumentEditor.tsx` to import from `types.ts`
  - Updated `SaveStatusIndicator.tsx` to import from `types.ts`
  - Added circular dependency detection tests (7/7 passed)
  - Fixed blank screen issue caused by component circular imports

### Changed
- `src/components/document/EnhancedDocumentEditor.tsx`: Import SaveStatus from types.ts
- `src/components/document/SaveStatusIndicator.tsx`: Import SaveStatus from types.ts

### Fixed
- Resolved circular dependency between EnhancedDocumentEditor and SaveStatusIndicator
- Fixed blank screen issue (white screen) caused by circular module imports

### Test Coverage
- Added `src/components/document/__tests__/types.test.ts` - 100% coverage
- Added `src/components/document/__tests__/circularDependency.test.ts` - 100% coverage

## [1.1.0] - 2026-01-11

### Added - SPEC-DOCEDIT-001 Phase 1 (Backend)

#### Features
- **Document Version Storage System** (`versionStorage.ts`)
  - File system-based version storage
  - Sequential version numbering
  - Version metadata management
  - CRUD operations for document versions
  - 14 test cases with 100% coverage

- **Document Version API Routes** (`documentVersions.ts`)
  - `POST /api/documents/versions` - Create new version
  - `GET /api/documents/versions?taskId=:id` - List versions by task
  - `GET /api/documents/versions/:id` - Get specific version
  - `DELETE /api/documents/versions/:id` - Delete version
  - 12 test cases with 100% coverage

- **Diff Generation Utility** (`diffGenerator.ts`)
  - Line-by-line diff calculation
  - Word-by-word diff calculation
  - Change summary generation
  - Formatted diff output
  - 13 test cases with 100% coverage

#### Technical Details
- **Total Implementation:** 3 backend modules, 6 files (3 source + 3 tests)
- **Test Coverage:** 100% (39/39 tests passed)
- **Code Quality:** TRUST 5 Framework compliant
- **Performance:** All API responses < 200ms
- **Static Analysis:** Zero TypeScript errors, zero ESLint warnings

#### Files Added
- `/server/utils/versionStorage.ts` (245 lines)
- `/server/routes/documentVersions.ts` (178 lines)
- `/server/utils/diffGenerator.ts` (156 lines)
- `/tests/server/utils/versionStorage.test.ts` (312 lines)
- `/tests/server/routes/documentVersions.test.ts` (267 lines)
- `/tests/server/utils/diffGenerator.test.ts` (289 lines)

#### Documentation
- Updated SPEC-DOCEDIT-001 status: draft → in_progress
- Created implementation summary document
- Updated plan.md with Phase 1 completion status
- Updated acceptance.md with backend criteria status

### Changed
- SPEC-DOCEDIT-001 spec status updated to "in_progress"
- Implementation progress tracking initiated

### Test Results
- **Unit Tests:** 27/27 passed
- **Integration Tests:** 8/8 passed
- **Error Handling Tests:** 4/4 passed
- **Total:** 39/39 passed (100%)

---

## [1.0.0] - Previous Release

### Initial Project Structure
- AI Workflow Kanban system
- Document management basic features
- Task management system
- User authentication

---

## Version Summary

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-11 | SPEC-DOCEDIT-001 Phase 1 backend implementation |
| 1.0.0 | Previous | Initial project release |

---

## Links

- [SPEC-DOCEDIT-001](.moai/specs/SPEC-DOCEDIT-001/spec.md)
- [Implementation Summary](.moai/specs/SPEC-DOCEDIT-001/implementation-summary.md)
- [Acceptance Criteria](.moai/specs/SPEC-DOCEDIT-001/acceptance.md)
