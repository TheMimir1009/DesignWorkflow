/**
 * useApplyDefaultReferences Hook Tests
 * SPEC-REFERENCE-001: Auto-apply default references on project switch
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApplyDefaultReferences } from '../../src/hooks/useApplyDefaultReferences';
import { useReferenceStore } from '../../src/store/referenceStore';
import type { Project } from '../../src/types';

// Mock the reference store
vi.mock('../../src/store/referenceStore', () => ({
  useReferenceStore: vi.fn(),
}));

describe('useApplyDefaultReferences', () => {
  const mockApplyDefaultReferences = vi.fn();
  const mockClearReferences = vi.fn();

  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test description',
    techStack: [],
    categories: [],
    defaultReferences: ['system-1', 'system-2'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useReferenceStore).mockReturnValue({
      selectedReferences: [],
      setSelectedReferences: vi.fn(),
      addReference: vi.fn(),
      removeReference: vi.fn(),
      toggleReference: vi.fn(),
      clearReferences: mockClearReferences,
      applyDefaultReferences: mockApplyDefaultReferences,
      isReferenceSelected: vi.fn().mockReturnValue(false),
    });
  });

  it('should apply default references when project changes', () => {
    const { rerender } = renderHook(
      ({ project }) => useApplyDefaultReferences(project),
      { initialProps: { project: mockProject } }
    );

    expect(mockApplyDefaultReferences).toHaveBeenCalledWith(['system-1', 'system-2']);
  });

  it('should apply default references when project changes to a different project', () => {
    const { rerender } = renderHook(
      ({ project }) => useApplyDefaultReferences(project),
      { initialProps: { project: mockProject } }
    );

    expect(mockApplyDefaultReferences).toHaveBeenCalledWith(['system-1', 'system-2']);

    const newProject: Project = {
      ...mockProject,
      id: 'project-2',
      defaultReferences: ['system-3'],
    };

    rerender({ project: newProject });

    expect(mockApplyDefaultReferences).toHaveBeenCalledWith(['system-3']);
    expect(mockApplyDefaultReferences).toHaveBeenCalledTimes(2);
  });

  it('should clear references when project becomes null', () => {
    const { rerender } = renderHook(
      ({ project }) => useApplyDefaultReferences(project),
      { initialProps: { project: mockProject as Project | null } }
    );

    rerender({ project: null });

    expect(mockClearReferences).toHaveBeenCalledTimes(1);
  });

  it('should apply empty array when project has no defaultReferences', () => {
    const projectWithoutDefaults: Project = {
      ...mockProject,
      defaultReferences: [],
    };

    renderHook(
      ({ project }) => useApplyDefaultReferences(project),
      { initialProps: { project: projectWithoutDefaults } }
    );

    expect(mockApplyDefaultReferences).toHaveBeenCalledWith([]);
  });

  it('should not apply references when project id has not changed', () => {
    const { rerender } = renderHook(
      ({ project }) => useApplyDefaultReferences(project),
      { initialProps: { project: mockProject } }
    );

    expect(mockApplyDefaultReferences).toHaveBeenCalledTimes(1);

    // Rerender with same project id but different object reference
    const sameProject = { ...mockProject };
    rerender({ project: sameProject });

    // Should still only be called once since project id hasn't changed
    expect(mockApplyDefaultReferences).toHaveBeenCalledTimes(1);
  });
});
