/**
 * ProjectSelector Component Tests
 * TDD RED Phase: Define expected behavior through failing tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectSelector } from '../../../src/components/project/ProjectSelector';
import { useProjectStore } from '../../../src/store/projectStore';
import type { Project } from '../../../src/types';

// Mock the store
vi.mock('../../../src/store/projectStore', () => ({
  useProjectStore: vi.fn(),
}));

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project Alpha',
    description: 'First project',
    techStack: ['Unity'],
    categories: ['System'],
    defaultReferences: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Project Beta',
    description: 'Second project',
    techStack: ['Unreal'],
    categories: ['Content'],
    defaultReferences: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

describe('ProjectSelector', () => {
  const defaultProps = {
    onNewProject: vi.fn(),
    onSettings: vi.fn(),
  };

  const mockSelectProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      projects: mockProjects,
      currentProject: mockProjects[0],
      selectProject: mockSelectProject,
    });
  });

  describe('Rendering', () => {
    it('should render current project name in the button', () => {
      render(<ProjectSelector {...defaultProps} />);

      expect(screen.getByRole('button', { name: /project alpha/i })).toBeInTheDocument();
    });

    it('should render placeholder when no project is selected', () => {
      (useProjectStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        projects: mockProjects,
        currentProject: null,
        selectProject: mockSelectProject,
      });

      render(<ProjectSelector {...defaultProps} />);

      expect(screen.getByText(/프로젝트 선택/i)).toBeInTheDocument();
    });

    it('should render settings gear icon button', () => {
      render(<ProjectSelector {...defaultProps} />);

      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    it('should not show dropdown initially', () => {
      render(<ProjectSelector {...defaultProps} />);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Interactions', () => {
    it('should open dropdown when clicking the selector button', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /project alpha/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /project beta/i })).toBeInTheDocument();
    });

    it('should show checkmark next to current project', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));

      const currentOption = screen.getByRole('option', { name: /project alpha/i });
      expect(currentOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ProjectSelector {...defaultProps} />
        </div>
      );

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByTestId('outside'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when pressing ESC', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should select project when clicking on option', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      await user.click(screen.getByRole('option', { name: /project beta/i }));

      expect(mockSelectProject).toHaveBeenCalledWith('2');
    });

    it('should close dropdown after selecting a project', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      await user.click(screen.getByRole('option', { name: /project beta/i }));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('New Project Button', () => {
    it('should show new project button with separator in dropdown', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));

      expect(screen.getByRole('button', { name: /새 프로젝트/i })).toBeInTheDocument();
    });

    it('should call onNewProject when clicking new project button', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      await user.click(screen.getByRole('button', { name: /새 프로젝트/i }));

      expect(defaultProps.onNewProject).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after clicking new project button', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      await user.click(screen.getByRole('button', { name: /새 프로젝트/i }));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Settings Button', () => {
    it('should call onSettings when clicking settings button', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /settings/i }));

      expect(defaultProps.onSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate through options with arrow keys', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      await user.keyboard('{ArrowDown}');

      const option = screen.getByRole('option', { name: /project beta/i });
      expect(option).toHaveClass('bg-gray-700');
    });

    it('should select option with Enter key', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockSelectProject).toHaveBeenCalledWith('2');
    });

    it('should wrap around when navigating past last option', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));
      // Start at index 0 (Project Alpha), press down twice to wrap: 0->1->0
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      const option = screen.getByRole('option', { name: /project alpha/i });
      expect(option).toHaveClass('bg-gray-700');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on dropdown', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /project alpha/i }));

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Projects');
    });

    it('should mark selector button as expanded when dropdown is open', async () => {
      const user = userEvent.setup();
      render(<ProjectSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /project alpha/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
