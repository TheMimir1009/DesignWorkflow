/**
 * Project Store - Zustand State Management
 * Centralized state management for projects with devtools support
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project, ProjectState, CreateProjectDto, UpdateProjectDto } from '../types';
import * as projectService from '../services/projectService';

/**
 * Extended project store with computed properties and actions
 */
export interface ProjectStore extends ProjectState {
  // Computed property (updated with each state change)
  currentProject: Project | null;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<void>;
  updateProject: (id: string, data: UpdateProjectDto) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string | null) => void;
}

/**
 * Sort projects by createdAt in descending order (newest first)
 */
function sortProjectsByDate(projects: Project[]): Project[] {
  return [...projects].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Helper to compute current project from state
 */
function computeCurrentProject(projects: Project[], currentProjectId: string | null): Project | null {
  if (!currentProjectId) return null;
  return projects.find(p => p.id === currentProjectId) || null;
}

/**
 * Project store with Zustand
 */
export const useProjectStore = create<ProjectStore>()(
  devtools(
    (set) => ({
      // Initial state
      projects: [],
      currentProjectId: null,
      currentProject: null,
      isLoading: false,
      error: null,

      // Actions
      fetchProjects: async () => {
        set({ isLoading: true, error: null }, false, 'fetchProjects/start');
        try {
          const projects = await projectService.getProjects();
          const sortedProjects = sortProjectsByDate(projects);

          set(state => {
            // Auto-select first project if none selected
            const shouldAutoSelect = !state.currentProjectId && sortedProjects.length > 0;
            const newCurrentId = shouldAutoSelect ? sortedProjects[0].id : state.currentProjectId;
            return {
              projects: sortedProjects,
              currentProjectId: newCurrentId,
              currentProject: computeCurrentProject(sortedProjects, newCurrentId),
              isLoading: false,
              error: null,
            };
          }, false, 'fetchProjects/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'fetchProjects/error');
        }
      },

      createProject: async (data: CreateProjectDto) => {
        set({ isLoading: true, error: null }, false, 'createProject/start');
        try {
          const newProject = await projectService.createProject(data);

          set(state => {
            const newProjects = sortProjectsByDate([newProject, ...state.projects]);
            return {
              projects: newProjects,
              currentProjectId: newProject.id, // Auto-select new project
              currentProject: newProject,
              isLoading: false,
              error: null,
            };
          }, false, 'createProject/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'createProject/error');
        }
      },

      updateProject: async (id: string, data: UpdateProjectDto) => {
        set({ isLoading: true, error: null }, false, 'updateProject/start');
        try {
          const updatedProject = await projectService.updateProject(id, data);

          set(state => {
            const newProjects = state.projects.map(p => p.id === id ? updatedProject : p);
            return {
              projects: newProjects,
              currentProject: computeCurrentProject(newProjects, state.currentProjectId),
              isLoading: false,
              error: null,
            };
          }, false, 'updateProject/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'updateProject/error');
        }
      },

      deleteProject: async (id: string) => {
        set({ isLoading: true, error: null }, false, 'deleteProject/start');
        try {
          await projectService.deleteProject(id);

          set(state => {
            const remainingProjects = state.projects.filter(p => p.id !== id);

            // Auto-select another project if current was deleted
            let newCurrentId = state.currentProjectId;
            if (state.currentProjectId === id) {
              newCurrentId = remainingProjects.length > 0 ? remainingProjects[0].id : null;
            }

            return {
              projects: remainingProjects,
              currentProjectId: newCurrentId,
              currentProject: computeCurrentProject(remainingProjects, newCurrentId),
              isLoading: false,
              error: null,
            };
          }, false, 'deleteProject/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'deleteProject/error');
        }
      },

      selectProject: (id: string | null) => {
        set(state => ({
          currentProjectId: id,
          currentProject: computeCurrentProject(state.projects, id),
          error: null,
        }), false, 'selectProject');
      },
    }),
    { name: 'ProjectStore' }
  )
);
