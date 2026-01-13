/**
 * Document Components Index
 * Exports all document-related components
 *
 * SPEC-DOCUMENT-001: Document Generation and Editing Pipeline
 */

// Q&A Form Components (existing)
export { CategorySelector } from './CategorySelector';
export { ProgressIndicator } from './ProgressIndicator';
export { QuestionStep } from './QuestionStep';
export { QAFormModal } from './QAFormModal';

// Document Editing Components (SPEC-DOCUMENT-001)
export { DocumentPreview } from './DocumentPreview';
export { DocumentEditor } from './DocumentEditor';
export { RevisionPanel } from './RevisionPanel';
export { VersionHistory } from './VersionHistory';

// Enhanced Document Editor (SPEC-DOCEDIT-001)
export { EnhancedDocumentEditor } from './EnhancedDocumentEditor';
export { SaveStatusIndicator } from './SaveStatusIndicator';
export { DiffViewerModal } from './DiffViewerModal';

// Document Viewer Modal
export { DocumentViewerModal } from './DocumentViewerModal';

// Hooks
export { useBeforeUnload } from './hooks/useBeforeUnload';

// Types - Q&A Form
export type { CategorySelectorProps } from './CategorySelector';
export type { ProgressIndicatorProps } from './ProgressIndicator';
export type { QuestionStepProps } from './QuestionStep';
export type { QAFormModalProps } from './QAFormModal';

// Types - Document Editing (SPEC-DOCUMENT-001)
export type { DocumentPreviewProps } from './DocumentPreview';
export type { DocumentEditorProps, EditorMode } from './DocumentEditor';
export type { RevisionPanelProps } from './RevisionPanel';
export type { VersionHistoryProps } from './VersionHistory';

// Types - Enhanced Document Editor (SPEC-DOCEDIT-001)
export type { EnhancedDocumentEditorProps, SaveStatus } from './EnhancedDocumentEditor';
export type { SaveStatusIndicatorProps } from './SaveStatusIndicator';
export type { DiffViewerModalProps } from './DiffViewerModal';

// Types - Document Viewer Modal
export type { DocumentViewerModalProps } from './DocumentViewerModal';
