/**
 * ArchiveConfirmDialog Tests
 * TDD test suite for archive confirmation dialog
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchiveConfirmDialog } from '../ArchiveConfirmDialog';

describe('ArchiveConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    taskTitle: 'Test Task',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<ArchiveConfirmDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog when isOpen is true', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display task title in message', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    expect(screen.getByText(/Test Task/)).toBeInTheDocument();
  });

  it('should display archive confirmation message', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    expect(screen.getByText(/archive this task/i)).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /archive/i }));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByTestId('dialog-backdrop'));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should display warning about prototype status', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    expect(
      screen.getByText(/only prototype tasks can be archived/i)
    ).toBeInTheDocument();
  });

  it('should display info about restoring archived tasks', () => {
    render(<ArchiveConfirmDialog {...defaultProps} />);

    expect(screen.getByText(/restore.*later/i)).toBeInTheDocument();
  });
});
