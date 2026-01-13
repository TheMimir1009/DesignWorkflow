/**
 * SaveStatusIndicator Component Tests
 * TDD test suite for SPEC-DOCEDIT-001 Save Status Indicator
 *
 * Test Coverage:
 * - Display of different save states (saved, saving, error, unsaved)
 * - Last saved time display
 * - Error message display
 * - Icon and text animations
 * - Accessibility attributes
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SaveStatusIndicator } from '../../../src/components/document/SaveStatusIndicator';

describe('SaveStatusIndicator', () => {
  const baseProps = {
    status: 'saved' as const,
    lastSavedTime: new Date('2024-01-01T12:00:00Z'),
  };

  describe('Rendering', () => {
    it('should render save status indicator container', () => {
      render(<SaveStatusIndicator {...baseProps} />);

      expect(screen.getByTestId('save-status-indicator')).toBeInTheDocument();
    });

    it('should render with "saved" status by default', () => {
      render(<SaveStatusIndicator {...baseProps} />);

      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('should render "Saving..." status when saving', () => {
      render(<SaveStatusIndicator {...baseProps} status="saving" />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should render "Error" status when save failed', () => {
      render(
        <SaveStatusIndicator
          {...baseProps}
          status="error"
          errorMessage="Network error"
        />
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should render "Unsaved changes" status when unsaved', () => {
      render(<SaveStatusIndicator {...baseProps} status="unsaved" />);

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
  });

  describe('Last Saved Time', () => {
    it('should display last saved time when status is saved', () => {
      const savedTime = new Date('2024-01-01T12:00:00Z');
      render(<SaveStatusIndicator {...baseProps} lastSavedTime={savedTime} />);

      expect(screen.getByTestId('last-saved-time')).toBeInTheDocument();
    });

    it('should display relative time for recent saves', () => {
      const recentTime = new Date();
      render(<SaveStatusIndicator {...baseProps} lastSavedTime={recentTime} />);

      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });

    it('should not display last saved time when status is saving', () => {
      render(<SaveStatusIndicator {...baseProps} status="saving" />);

      expect(screen.queryByTestId('last-saved-time')).not.toBeInTheDocument();
    });

    it('should not display last saved time when status is error', () => {
      render(
        <SaveStatusIndicator
          {...baseProps}
          status="error"
          errorMessage="Failed"
        />
      );

      expect(screen.queryByTestId('last-saved-time')).not.toBeInTheDocument();
    });
  });

  describe('Error Messages', () => {
    it('should display error message when status is error', () => {
      const errorMessage = 'Network connection failed';
      render(
        <SaveStatusIndicator
          {...baseProps}
          status="error"
          errorMessage={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display error message when status is not error', () => {
      render(<SaveStatusIndicator {...baseProps} status="saved" />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Icons and Visual Indicators', () => {
    it('should display checkmark icon when status is saved', () => {
      render(<SaveStatusIndicator {...baseProps} status="saved" />);

      expect(screen.getByTestId('status-icon-saved')).toBeInTheDocument();
    });

    it('should display spinner icon when status is saving', () => {
      render(<SaveStatusIndicator {...baseProps} status="saving" />);

      expect(screen.getByTestId('status-icon-saving')).toBeInTheDocument();
    });

    it('should display error icon when status is error', () => {
      render(
        <SaveStatusIndicator
          {...baseProps}
          status="error"
          errorMessage="Failed"
        />
      );

      expect(screen.getByTestId('status-icon-error')).toBeInTheDocument();
    });

    it('should display dot icon when status is unsaved', () => {
      render(<SaveStatusIndicator {...baseProps} status="unsaved" />);

      expect(screen.getByTestId('status-icon-unsaved')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label describing current status', () => {
      render(<SaveStatusIndicator {...baseProps} status="saved" />);

      const indicator = screen.getByTestId('save-status-indicator');
      expect(indicator).toHaveAttribute('aria-label', 'Document saved');
    });

    it('should have aria-live for screen readers when status changes', () => {
      render(<SaveStatusIndicator {...baseProps} status="saving" />);

      const indicator = screen.getByTestId('save-status-indicator');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
    });

    it('should have appropriate aria-label for error status', () => {
      render(
        <SaveStatusIndicator
          {...baseProps}
          status="error"
          errorMessage="Network error"
        />
      );

      const indicator = screen.getByTestId('save-status-indicator');
      expect(indicator).toHaveAttribute('aria-label', 'Save error: Network error');
    });
  });

  describe('Styling and Classes', () => {
    it('should apply status-specific CSS classes', () => {
      const { rerender } = render(<SaveStatusIndicator {...baseProps} status="saved" />);

      let indicator = screen.getByTestId('save-status-indicator');
      expect(indicator).toHaveClass('status-saved');

      rerender(<SaveStatusIndicator {...baseProps} status="saving" />);
      indicator = screen.getByTestId('save-status-indicator');
      expect(indicator).toHaveClass('status-saving');

      rerender(<SaveStatusIndicator {...baseProps} status="error" />);
      indicator = screen.getByTestId('save-status-indicator');
      expect(indicator).toHaveClass('status-error');

      rerender(<SaveStatusIndicator {...baseProps} status="unsaved" />);
      indicator = screen.getByTestId('save-status-indicator');
      expect(indicator).toHaveClass('status-unsaved');
    });
  });
});
