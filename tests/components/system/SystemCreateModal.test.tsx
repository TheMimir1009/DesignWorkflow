/**
 * SystemCreateModal Component Tests
 * Tests for the system document creation modal
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemCreateModal } from '../../../src/components/system/SystemCreateModal';
import { useSystemStore } from '../../../src/store/systemStore';
import { useProjectStore } from '../../../src/store/projectStore';

// Mock the stores
vi.mock('../../../src/store/systemStore');
vi.mock('../../../src/store/projectStore');

const mockUseSystemStore = vi.mocked(useSystemStore);
const mockUseProjectStore = vi.mocked(useProjectStore);

describe('SystemCreateModal', () => {
  const mockCreateDocument = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSystemStore.mockReturnValue({
      createDocument: mockCreateDocument,
    } as any);

    mockUseProjectStore.mockReturnValue({
      currentProjectId: 'project-123',
    } as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <SystemCreateModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add System Document')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText(/Document Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/)).toBeInTheDocument();
  });

  it('should render suggested categories', () => {
    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('UI')).toBeInTheDocument();
    expect(screen.getByText('Economy')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Narrative')).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable Create button when form is invalid', () => {
    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeDisabled();
  });

  it('should enable Create button when name and category are provided', async () => {
    const user = userEvent.setup();

    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Document Name/);
    const categoryInput = screen.getByLabelText(/Category/);

    await user.type(nameInput, 'Test Document');
    await user.type(categoryInput, 'System');

    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).not.toBeDisabled();
  });

  it('should show error when name exceeds 100 characters', async () => {
    const user = userEvent.setup();

    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Document Name/);
    await user.type(nameInput, 'a'.repeat(101));

    expect(screen.getByText('Must be 100 characters or less')).toBeInTheDocument();
  });

  it('should select category when suggested category is clicked', async () => {
    const user = userEvent.setup();

    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const systemButton = screen.getByRole('button', { name: 'System' });
    await user.click(systemButton);

    const categoryInput = screen.getByLabelText(/Category/) as HTMLInputElement;
    expect(categoryInput.value).toBe('System');
  });

  it('should add tag when Enter is pressed in tag input', async () => {
    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const tagInput = screen.getByLabelText(/Tags/) as HTMLInputElement;

    // Type into the input
    fireEvent.change(tagInput, { target: { value: 'core' } });
    expect(tagInput.value).toBe('core');

    // Press Enter
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    // Tag should now appear as a span element
    await waitFor(() => {
      expect(screen.getByText('core')).toBeInTheDocument();
    });

    // Input should be cleared
    expect(tagInput.value).toBe('');
  });

  it('should remove tag when remove button is clicked', async () => {
    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const tagInput = screen.getByLabelText(/Tags/) as HTMLInputElement;

    // Add a tag first
    fireEvent.change(tagInput, { target: { value: 'core' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('core')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText('Remove core');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('core')).not.toBeInTheDocument();
    });
  });

  it('should call createDocument when form is submitted', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce(undefined);

    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Document Name/);
    const categoryInput = screen.getByLabelText(/Category/);

    await user.type(nameInput, 'Test Document');
    await user.type(categoryInput, 'System');

    const createButton = screen.getByRole('button', { name: 'Create' });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateDocument).toHaveBeenCalledWith('project-123', {
        name: 'Test Document',
        category: 'System',
        tags: [],
        content: '',
        dependencies: [],
      });
    });
  });

  it('should call onSuccess and onClose after successful creation', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockResolvedValueOnce(undefined);

    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Document Name/);
    const categoryInput = screen.getByLabelText(/Category/);

    await user.type(nameInput, 'Test Document');
    await user.type(categoryInput, 'System');

    const createButton = screen.getByRole('button', { name: 'Create' });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show error message when creation fails', async () => {
    const user = userEvent.setup();
    mockCreateDocument.mockRejectedValueOnce(new Error('Creation failed'));

    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/Document Name/);
    const categoryInput = screen.getByLabelText(/Category/);

    await user.type(nameInput, 'Test Document');
    await user.type(categoryInput, 'System');

    const createButton = screen.getByRole('button', { name: 'Create' });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument();
    });
  });

  it('should close when backdrop is clicked', async () => {
    render(
      <SystemCreateModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const backdrop = screen.getByRole('dialog').parentElement;
    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
