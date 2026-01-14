/**
 * PromptManagerPage Component Tests
 * Tests for main prompt management page integration
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptManagerPage } from '../PromptManagerPage';
import type { PromptTemplate, PromptCategory } from '../../../types';

// Mock the store
vi.mock('../../../store/promptStore', () => ({
  usePromptStore: vi.fn(),
}));

// Mock child components
vi.mock('../PromptList', () => ({
  PromptList: ({ prompts, selectedPromptId, onSelect, selectedCategory, groupByCategory }: any) => (
    <div data-testid="prompt-list">
      {prompts.map((p: PromptTemplate) => (
        <div key={p.id} data-prompt-id={p.id}>
          <button onClick={() => onSelect(p.id)}>{p.name}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../PromptEditor', () => ({
  PromptEditor: ({ content, onChange, onReset }: any) => (
    <div data-testid="prompt-editor">
      <textarea value={content} onChange={(e) => onChange(e.target.value)} />
      {onReset && <button onClick={() => onReset()}>Reset</button>}
    </div>
  ),
}));

vi.mock('../PromptVariablePanel', () => ({
  PromptVariablePanel: ({ variables, onInsert }: any) => (
    <div data-testid="variable-panel">
      {variables.map((v: any) => (
        <button key={v.name} onClick={() => onInsert(v.name)}>
          {v.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../PromptVersionHistory', () => ({
  PromptVersionHistory: ({ versions, currentVersion, onRestore }: any) => (
    <div data-testid="version-history">
      {versions.map((v: any) => (
        <button key={v.id} onClick={() => onRestore(v.id, v.content)}>
          Version {v.version}
        </button>
      ))}
    </div>
  ),
}));

import { usePromptStore } from '../../../store/promptStore';

describe('PromptManagerPage', () => {
  const mockPrompts: PromptTemplate[] = [
    {
      id: 'prompt-1',
      name: 'Test Prompt 1',
      category: 'document-generation',
      description: 'Test description',
      content: 'Test content with {{variable}}',
      variables: [{ name: 'variable', type: 'string', description: 'Test', required: true, example: 'test' }],
      isModified: false,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      defaultContent: 'Test content with {{variable}}',
    },
    {
      id: 'prompt-2',
      name: 'Test Prompt 2',
      category: 'code-operation',
      description: 'Another test',
      content: 'Another content',
      variables: [],
      isModified: true,
      version: 2,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      defaultContent: 'Another content',
    },
  ];

  beforeEach(() => {
    // Reset mock implementation
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: mockPrompts,
      selectedPromptId: null,
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      fetchPrompts: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => undefined,
      getFilteredPrompts: () => mockPrompts,
    });
  });

  it('should render the page with prompt list', () => {
    render(<PromptManagerPage />);

    expect(screen.getByTestId('prompt-list')).toBeInTheDocument();
  });

  it('should fetch prompts on mount', () => {
    const mockFetchPrompts = vi.fn();
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: [],
      selectedPromptId: null,
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      fetchPrompts: mockFetchPrompts,
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => undefined,
      getFilteredPrompts: () => [],
    });

    render(<PromptManagerPage />);

    expect(mockFetchPrompts).toHaveBeenCalled();
  });

  it('should show loading state while fetching', () => {
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: [],
      selectedPromptId: null,
      selectedCategory: null,
      isLoading: true,
      error: null,
      searchQuery: '',
      fetchPrompts: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => undefined,
      getFilteredPrompts: () => [],
    });

    render(<PromptManagerPage />);

    expect(screen.getByTestId('prompt-list')).toBeInTheDocument();
  });

  it('should show error state when fetch fails', () => {
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: [],
      selectedPromptId: null,
      selectedCategory: null,
      isLoading: false,
      error: 'Failed to load prompts',
      searchQuery: '',
      fetchPrompts: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => undefined,
      getFilteredPrompts: () => [],
    });

    render(<PromptManagerPage />);

    expect(screen.getByText(/failed to load prompts/i)).toBeInTheDocument();
  });

  it('should select prompt when clicked', () => {
    const mockSetSelectedPromptId = vi.fn();
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: mockPrompts,
      selectedPromptId: null,
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      fetchPrompts: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: mockSetSelectedPromptId,
      setSelectedCategory: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => undefined,
      getFilteredPrompts: () => mockPrompts,
    });

    render(<PromptManagerPage />);

    fireEvent.click(screen.getByText('Test Prompt 1'));

    expect(mockSetSelectedPromptId).toHaveBeenCalledWith('prompt-1');
  });

  it('should show editor when prompt is selected', () => {
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: mockPrompts,
      selectedPromptId: 'prompt-1',
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      fetchPrompts: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => mockPrompts[0],
      getFilteredPrompts: () => mockPrompts,
    });

    render(<PromptManagerPage />);

    expect(screen.getByTestId('prompt-editor')).toBeInTheDocument();
  });

  it('should show variable panel when prompt has variables', () => {
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: mockPrompts,
      selectedPromptId: 'prompt-1',
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      fetchPrompts: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => mockPrompts[0],
      getFilteredPrompts: () => mockPrompts,
    });

    render(<PromptManagerPage />);

    expect(screen.getByTestId('variable-panel')).toBeInTheDocument();
    expect(screen.getByText('variable')).toBeInTheDocument();
  });

  it('should filter prompts by category', () => {
    const mockSetSelectedCategory = vi.fn();
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: mockPrompts,
      selectedPromptId: null,
      selectedCategory: 'document-generation',
      isLoading: false,
      error: null,
      searchQuery: '',
      fetchPrompts: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: vi.fn(),
      setSelectedCategory: mockSetSelectedCategory,
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => undefined,
      getFilteredPrompts: () => mockPrompts.filter(p => p.category === 'document-generation'),
    });

    render(<PromptManagerPage />);

    expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
  });

  it('should update prompt content when editor changes', async () => {
    const mockUpdatePrompt = vi.fn().mockResolvedValue(undefined);
    vi.mocked(usePromptStore).mockReturnValue({
      prompts: mockPrompts,
      selectedPromptId: 'prompt-1',
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      fetchPrompts: vi.fn(),
      createPrompt: vi.fn(),
      updatePrompt: mockUpdatePrompt,
      resetPrompt: vi.fn(),
      deletePrompt: vi.fn(),
      setSelectedPromptId: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      getSelectedPrompt: () => mockPrompts[0],
      getFilteredPrompts: () => mockPrompts,
    });

    render(<PromptManagerPage />);

    // Use the textarea inside the editor, not the search input
    const editor = screen.getByTestId('prompt-editor').querySelector('textarea');
    if (editor) {
      fireEvent.change(editor, { target: { value: 'New content' } });

      // Wait for debounced update
      await waitFor(() => {
        expect(mockUpdatePrompt).toHaveBeenCalled();
      }, { timeout: 600 });
    }
  });
});
