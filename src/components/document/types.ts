/**
 * Document Component Types
 * SPEC-DOCEDIT-002: Shared type definitions to resolve circular dependencies
 *
 * This module contains shared type definitions used by document components.
 * Extracting these types to a separate file resolves circular dependencies
 * between EnhancedDocumentEditor and SaveStatusIndicator.
 *
 * @module types
 */

/**
 * Document save status type
 *
 * Represents the current state of document save operations.
 * Used by both EnhancedDocumentEditor and SaveStatusIndicator.
 *
 * @example
 * ```tsx
 * const status: SaveStatus = 'saved';
 * const savingStatus: SaveStatus = 'saving';
 * ```
 *
 * @remarks
 * This type was extracted from EnhancedDocumentEditor to break circular dependency.
 * - EnhancedDocumentEditor defines the status
 * - SaveStatusIndicator displays the status
 * - Both need to import this shared type
 *
 * @see EnhancedDocumentEditor
 * @see SaveStatusIndicator
 */
export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

/**
 * Document metadata type
 *
 * Contains additional information about document state and history.
 * Optional fields provide flexibility for different use cases.
 *
 * @example
 * ```tsx
 * const metadata: DocumentMetadata = {
 *   lastSaved: new Date(),
 *   version: 1
 * };
 * ```
 */
export interface DocumentMetadata {
  /** Timestamp of last successful save */
  lastSaved?: Date;
  /** Current document version */
  version?: number;
  /** Author information */
  author?: string;
}

/**
 * Save operation result type
 *
 * Represents the result of a save operation attempt.
 *
 * @example
 * ```tsx
 * const result: SaveResult = {
 *   success: true,
 *   status: 'saved',
 *   timestamp: new Date()
 * };
 * ```
 */
export interface SaveResult {
  /** Whether the save operation succeeded */
  success: boolean;
  /** Current save status */
  status: SaveStatus;
  /** Timestamp of save operation */
  timestamp: Date;
  /** Error message if save failed */
  error?: string;
}

/**
 * Document save options type
 *
 * Configuration options for save operations.
 *
 * @example
 * ```tsx
 * const options: SaveOptions = {
 *   autoSave: true,
 *   debounceMs: 5000
 * };
 * ```
 */
export interface SaveOptions {
  /** Enable/disable auto-save */
  autoSave?: boolean;
  /** Debounce delay for auto-save in milliseconds */
  debounceMs?: number;
  /** Maximum retry attempts for failed saves */
  maxRetries?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelayMs?: number;
}
