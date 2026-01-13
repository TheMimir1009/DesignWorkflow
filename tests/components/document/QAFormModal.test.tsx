/**
 * QAFormModal Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QAFormModal } from '../../../src/components/document/QAFormModal';
import { useQAStore } from '../../../src/store/qaStore';

// Mock the store
vi.mock('../../../src/store/qaStore', () => ({
  useQAStore: vi.fn(),
}));

describe('QAFormModal', () => {
  const mockStartSession = vi.fn();
  const mockSetAnswer = vi.fn();
  const mockNextStep = vi.fn();
  const mockPrevStep = vi.fn();
  const mockCompleteSession = vi.fn();
  const mockResetSession = vi.fn();

  const defaultStoreState = {
    questions: [
      {
        id: 'q1',
        order: 1,
        text: 'Question 1',
        description: 'Description 1',
        inputType: 'textarea' as const,
        required: true,
        placeholder: null,
        maxLength: 2000,
        options: null,
      },
      {
        id: 'q2',
        order: 2,
        text: 'Question 2',
        description: 'Description 2',
        inputType: 'textarea' as const,
        required: false,
        placeholder: null,
        maxLength: 2000,
        options: null,
      },
    ],
    currentStep: 0,
    answers: {},
    isLoading: false,
    error: null,
    selectedCategory: 'game_mechanic' as const,
    startSession: mockStartSession,
    setAnswer: mockSetAnswer,
    nextStep: mockNextStep,
    prevStep: mockPrevStep,
    completeSession: mockCompleteSession,
    resetSession: mockResetSession,
    getCurrentQuestion: () => defaultStoreState.questions[defaultStoreState.currentStep],
    isCurrentStepValid: () => true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQAStore).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(defaultStoreState);
      }
      return defaultStoreState;
    });
  });

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    taskId: 'task-001',
    onComplete: vi.fn(),
    initialCategory: 'game_mechanic' as const,
  };

  it('should render when isOpen is true', () => {
    render(<QAFormModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<QAFormModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display modal title', () => {
    render(<QAFormModal {...defaultProps} />);

    expect(screen.getByText(/design questionnaire/i)).toBeInTheDocument();
  });

  it('should call startSession on mount', () => {
    render(<QAFormModal {...defaultProps} />);

    expect(mockStartSession).toHaveBeenCalledWith('task-001', 'game_mechanic');
  });

  it('should display current question', () => {
    render(<QAFormModal {...defaultProps} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('should call setAnswer when input changes', () => {
    render(<QAFormModal {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'My answer' } });

    expect(mockSetAnswer).toHaveBeenCalledWith('q1', 'My answer');
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<QAFormModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    vi.mocked(useQAStore).mockImplementation((selector) => {
      const state = { ...defaultStoreState, isLoading: true };
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });

    render(<QAFormModal {...defaultProps} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    vi.mocked(useQAStore).mockImplementation((selector) => {
      const state = { ...defaultStoreState, error: 'Something went wrong' };
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });

    render(<QAFormModal {...defaultProps} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should display category selector', () => {
    render(<QAFormModal {...defaultProps} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('should display progress indicator', () => {
    render(<QAFormModal {...defaultProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should call completeSession and onComplete when completing', async () => {
    mockCompleteSession.mockResolvedValueOnce({ message: 'Done', task: {} });

    vi.mocked(useQAStore).mockImplementation((selector) => {
      const state = {
        ...defaultStoreState,
        currentStep: 1, // Last step
      };
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });

    const onComplete = vi.fn();
    render(<QAFormModal {...defaultProps} onComplete={onComplete} />);

    const completeButton = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockCompleteSession).toHaveBeenCalledWith('task-001');
    });
  });

  it('should show category change warning', async () => {
    vi.mocked(useQAStore).mockImplementation((selector) => {
      const state = {
        ...defaultStoreState,
        answers: { q1: 'Some answer' },
      };
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });

    render(<QAFormModal {...defaultProps} />);

    // Try to change category
    const economyTab = screen.getByRole('tab', { name: /economy/i });
    fireEvent.click(economyTab);

    expect(screen.getByText(/changing category/i)).toBeInTheDocument();
  });

  it('should reset session on close', () => {
    const onClose = vi.fn();
    render(<QAFormModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockResetSession).toHaveBeenCalled();
  });
});
