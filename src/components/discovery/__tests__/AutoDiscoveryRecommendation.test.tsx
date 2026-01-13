/**
 * AutoDiscoveryRecommendation Component Tests
 * Tests for the main discovery recommendation UI
 * AC-004: UI rendering, AC-005: Individual add, AC-006: Add all, AC-010: Duplicate prevention
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoDiscoveryRecommendation } from '../AutoDiscoveryRecommendation';
import { useDiscoveryStore } from '../../../store/discoveryStore';
import { useReferenceStore } from '../../../store/referenceStore';
import type { RecommendedSystem } from '../../../services/discoveryService';

// Mock the stores
vi.mock('../../../store/discoveryStore', () => ({
  useDiscoveryStore: vi.fn(),
}));

vi.mock('../../../store/referenceStore', () => ({
  useReferenceStore: vi.fn(),
}));

describe('AutoDiscoveryRecommendation', () => {
  const mockRecommendations: RecommendedSystem[] = [
    { id: 'sys-1', name: 'Character System', relevanceScore: 95, matchReason: 'Character tag matching' },
    { id: 'sys-2', name: 'Experience System', relevanceScore: 88, matchReason: 'Experience, level keyword matching' },
    { id: 'sys-3', name: 'Inventory System', relevanceScore: 75, matchReason: 'Item keyword matching' },
  ];

  const mockFetchRecommendations = vi.fn();
  const mockRefresh = vi.fn();
  const mockAddToReferences = vi.fn();
  const mockAddAllToReferences = vi.fn();
  const mockClearError = vi.fn();

  const defaultDiscoveryState = {
    recommendations: [],
    isLoading: false,
    error: null,
    lastAnalyzedText: '',
    isAIGenerated: false,
    analyzedKeywords: [],
    fetchRecommendations: mockFetchRecommendations,
    refresh: mockRefresh,
    addToReferences: mockAddToReferences,
    addAllToReferences: mockAddAllToReferences,
    clearError: mockClearError,
    clearRecommendations: vi.fn(),
  };

  const mockIsReferenceSelected = vi.fn();

  const defaultReferenceState = {
    selectedReferences: [],
    isReferenceSelected: mockIsReferenceSelected,
    addReference: vi.fn(),
  };

  const defaultProps = {
    projectId: 'project-1',
    featureText: 'A'.repeat(150), // More than 100 chars
    existingReferenceIds: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDiscoveryStore).mockReturnValue(defaultDiscoveryState);
    vi.mocked(useReferenceStore).mockReturnValue(defaultReferenceState);
    mockIsReferenceSelected.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Loading state shows skeleton
  it('should show skeleton when loading', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      isLoading: true,
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  // Test 2: Recommendation cards render
  it('should render recommendation cards when data is available', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    expect(screen.getByText('Character System')).toBeInTheDocument();
    expect(screen.getByText('Experience System')).toBeInTheDocument();
    expect(screen.getByText('Inventory System')).toBeInTheDocument();
  });

  // Test 3: Progress bar accuracy
  it('should render relevance progress bars with correct width', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    const progressBars = screen.getAllByTestId('relevance-progress');
    expect(progressBars[0]).toHaveStyle({ width: '95%' });
    expect(progressBars[1]).toHaveStyle({ width: '88%' });
    expect(progressBars[2]).toHaveStyle({ width: '75%' });
  });

  // Test 4: Add button click calls callback
  it('should call onSystemAdded when add button is clicked', async () => {
    const user = userEvent.setup();
    const onSystemAdded = vi.fn();

    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    render(
      <AutoDiscoveryRecommendation
        {...defaultProps}
        onSystemAdded={onSystemAdded}
      />
    );

    // Find the first "Add" button (not "Add All" or "Already Added")
    const addButton = screen.getByRole('button', { name: /^add character system$/i });
    await user.click(addButton);

    expect(mockAddToReferences).toHaveBeenCalledWith('sys-1');
    expect(onSystemAdded).toHaveBeenCalledWith('sys-1');
  });

  // Test 5: Already added systems show disabled button
  it('should show disabled button for already added systems', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    mockIsReferenceSelected.mockImplementation((id: string) => id === 'sys-1');

    render(
      <AutoDiscoveryRecommendation
        {...defaultProps}
        existingReferenceIds={['sys-1']}
      />
    );

    expect(screen.getByText('Already Added')).toBeInTheDocument();
  });

  // Test 6: Add All button functionality
  it('should call addAllToReferences when Add All button clicked', async () => {
    const user = userEvent.setup();
    const onAllSystemsAdded = vi.fn();

    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    render(
      <AutoDiscoveryRecommendation
        {...defaultProps}
        onAllSystemsAdded={onAllSystemsAdded}
      />
    );

    const addAllButton = screen.getByRole('button', { name: /add all/i });
    await user.click(addAllButton);

    expect(mockAddAllToReferences).toHaveBeenCalled();
    expect(onAllSystemsAdded).toHaveBeenCalled();
  });

  // Test 7: Refresh button functionality
  it('should call refresh when refresh button clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalledWith('project-1', defaultProps.featureText);
  });

  // Test 8: Error state UI
  it('should show error message when error occurs', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      error: 'Failed to fetch recommendations',
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    expect(screen.getByText(/failed to fetch recommendations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  // Test 9: Empty state UI
  it('should show empty message when no recommendations', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: [],
      lastAnalyzedText: 'A'.repeat(150),
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    expect(screen.getByText(/no related systems found/i)).toBeInTheDocument();
  });

  // Test 10: Short text warning
  it('should show minimum text warning when text is too short', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      error: 'Feature text must be at least 100 characters for accurate analysis',
    });

    render(
      <AutoDiscoveryRecommendation
        {...defaultProps}
        featureText="Short text"
      />
    );

    expect(screen.getByText(/at least 100 characters/i)).toBeInTheDocument();
  });

  // Test 11: Match reason display
  it('should display match reason for each recommendation', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    expect(screen.getByText('Character tag matching')).toBeInTheDocument();
    expect(screen.getByText('Experience, level keyword matching')).toBeInTheDocument();
  });

  // Test 12: Keyboard navigation
  it('should support keyboard navigation for add buttons', async () => {
    const user = userEvent.setup();

    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    const addButtons = screen.getAllByRole('button', { name: /add/i });
    addButtons[0].focus();
    expect(addButtons[0]).toHaveFocus();

    await user.keyboard('{Tab}');
    // Focus should move to next interactive element
  });

  // Test 13: Fetch on mount
  it('should fetch recommendations on mount', async () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetchRecommendations).toHaveBeenCalledWith(
        'project-1',
        defaultProps.featureText
      );
    });
  });

  // Test 14: Header rendering
  it('should render header with title', () => {
    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      recommendations: mockRecommendations,
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    expect(screen.getByText(/related systems/i)).toBeInTheDocument();
  });

  // Test 15: Try again button on error
  it('should retry fetch when try again button clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(useDiscoveryStore).mockReturnValue({
      ...defaultDiscoveryState,
      error: 'Network error',
    });

    render(<AutoDiscoveryRecommendation {...defaultProps} />);

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    await user.click(tryAgainButton);

    expect(mockRefresh).toHaveBeenCalledWith('project-1', defaultProps.featureText);
  });
});
