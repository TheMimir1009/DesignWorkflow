/**
 * Template Store - Zustand State Management
 * Centralized state management for templates with devtools support
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Template,
  TemplateState,
  TemplateCategory,
  CreateTemplateDto,
  UpdateTemplateDto,
} from '../types';
import * as templateService from '../services/templateService';

/**
 * Extended template store with computed properties and actions
 */
export interface TemplateStore extends TemplateState {
  // Additional state
  searchQuery: string;

  // Computed property getter
  readonly filteredTemplates: Template[];

  // Actions
  fetchTemplates: (category?: TemplateCategory, projectId?: string) => Promise<void>;
  createTemplate: (data: CreateTemplateDto) => Promise<void>;
  updateTemplate: (templateId: string, data: UpdateTemplateDto) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  setSelectedTemplateId: (templateId: string | null) => void;
  setSelectedCategory: (category: TemplateCategory | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  getSelectedTemplate: () => Template | undefined;
}

/**
 * Selector for filtered templates - use this for accessing filteredTemplates
 */
export function selectFilteredTemplates(state: TemplateStore): Template[] {
  return filterTemplates(
    state.templates,
    state.selectedCategory,
    state.searchQuery
  );
}

/**
 * Sort templates by createdAt in descending order (newest first)
 */
function sortTemplatesByDate(templates: Template[]): Template[] {
  return [...templates].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Filter templates based on category and search query
 */
function filterTemplates(
  templates: Template[],
  selectedCategory: TemplateCategory | null,
  searchQuery: string
): Template[] {
  return templates.filter(template => {
    // Filter by category
    if (selectedCategory && template.category !== selectedCategory) {
      return false;
    }

    // Filter by search query (case-insensitive search in name and description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = template.name.toLowerCase().includes(query);
      const descriptionMatch = template.description.toLowerCase().includes(query);
      if (!nameMatch && !descriptionMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Template store with Zustand
 */
export const useTemplateStore = create<TemplateStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      templates: [],
      selectedTemplateId: null,
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',

      // Computed property using getter
      get filteredTemplates() {
        const state = get();
        return filterTemplates(
          state.templates,
          state.selectedCategory,
          state.searchQuery
        );
      },

      // Actions
      fetchTemplates: async (category?: TemplateCategory, projectId?: string) => {
        set({ isLoading: true, error: null }, false, 'fetchTemplates/start');
        try {
          const templates = await templateService.getTemplates(category, projectId);
          const sortedTemplates = sortTemplatesByDate(templates);

          set({
            templates: sortedTemplates,
            isLoading: false,
            error: null,
          }, false, 'fetchTemplates/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'fetchTemplates/error');
        }
      },

      createTemplate: async (data: CreateTemplateDto) => {
        set({ isLoading: true, error: null }, false, 'createTemplate/start');
        try {
          const newTemplate = await templateService.createTemplate(data);

          set(state => {
            const newTemplates = sortTemplatesByDate([newTemplate, ...state.templates]);

            return {
              templates: newTemplates,
              isLoading: false,
              error: null,
            };
          }, false, 'createTemplate/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'createTemplate/error');
        }
      },

      updateTemplate: async (templateId: string, data: UpdateTemplateDto) => {
        set({ isLoading: true, error: null }, false, 'updateTemplate/start');
        try {
          const updatedTemplate = await templateService.updateTemplate(templateId, data);

          set(state => {
            const newTemplates = state.templates.map(template =>
              template.id === templateId ? updatedTemplate : template
            );
            return {
              templates: newTemplates,
              isLoading: false,
              error: null,
            };
          }, false, 'updateTemplate/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'updateTemplate/error');
        }
      },

      deleteTemplate: async (templateId: string) => {
        set({ isLoading: true, error: null }, false, 'deleteTemplate/start');
        try {
          await templateService.deleteTemplate(templateId);

          set(state => {
            const remainingTemplates = state.templates.filter(t => t.id !== templateId);
            // Clear selected if it was the deleted template
            const newSelectedId = state.selectedTemplateId === templateId
              ? null
              : state.selectedTemplateId;

            return {
              templates: remainingTemplates,
              selectedTemplateId: newSelectedId,
              isLoading: false,
              error: null,
            };
          }, false, 'deleteTemplate/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'deleteTemplate/error');
        }
      },

      setSelectedTemplateId: (templateId: string | null) => {
        set({ selectedTemplateId: templateId }, false, 'setSelectedTemplateId');
      },

      setSelectedCategory: (category: TemplateCategory | null) => {
        set({ selectedCategory: category }, false, 'setSelectedCategory');
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      clearFilters: () => {
        set({
          selectedCategory: null,
          searchQuery: '',
        }, false, 'clearFilters');
      },

      getSelectedTemplate: () => {
        const state = get();
        return state.templates.find(t => t.id === state.selectedTemplateId);
      },
    }),
    { name: 'TemplateStore' }
  )
);
