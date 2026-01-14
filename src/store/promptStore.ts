/**
 * Prompt Store - Zustand State Management
 * Centralized state management for prompt templates with devtools support
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  PromptTemplate,
  PromptTemplateState,
  PromptCategory,
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from '../types';
import * as promptService from '../services/promptService';

/**
 * Extended prompt store with computed properties and actions
 */
export interface PromptStore extends PromptTemplateState {
  // Additional state
  searchQuery: string;

  // Actions
  fetchPrompts: (category?: PromptCategory) => Promise<void>;
  createPrompt: (data: CreatePromptTemplateDto) => Promise<void>;
  updatePrompt: (promptId: string, data: UpdatePromptTemplateDto) => Promise<void>;
  resetPrompt: (promptId: string) => Promise<void>;
  deletePrompt: (promptId: string) => Promise<void>;
  setSelectedPromptId: (promptId: string | null) => void;
  setSelectedCategory: (category: PromptCategory | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  getSelectedPrompt: () => PromptTemplate | undefined;
  getFilteredPrompts: () => PromptTemplate[];
}

/**
 * Sort prompts by createdAt in descending order (newest first)
 */
function sortPromptsByDate(prompts: PromptTemplate[]): PromptTemplate[] {
  return [...prompts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Filter prompts based on category and search query
 */
function filterPrompts(
  prompts: PromptTemplate[],
  selectedCategory: PromptCategory | null,
  searchQuery: string
): PromptTemplate[] {
  return prompts.filter(prompt => {
    // Filter by category
    if (selectedCategory && prompt.category !== selectedCategory) {
      return false;
    }

    // Filter by search query (case-insensitive search in name and description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = prompt.name.toLowerCase().includes(query);
      const descriptionMatch = prompt.description.toLowerCase().includes(query);
      if (!nameMatch && !descriptionMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Prompt store with Zustand
 */
export const usePromptStore = create<PromptStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      prompts: [],
      selectedPromptId: null,
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',

      // Actions
      fetchPrompts: async (category?: PromptCategory) => {
        set({ isLoading: true, error: null }, false, 'fetchPrompts/start');
        try {
          const prompts = await promptService.getPrompts(category);
          const sortedPrompts = sortPromptsByDate(prompts);

          set({
            prompts: sortedPrompts,
            isLoading: false,
            error: null,
          }, false, 'fetchPrompts/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'fetchPrompts/error');
        }
      },

      createPrompt: async (data: CreatePromptTemplateDto) => {
        set({ isLoading: true, error: null }, false, 'createPrompt/start');
        try {
          const newPrompt = await promptService.createPrompt(data);

          set(state => {
            const newPrompts = sortPromptsByDate([newPrompt, ...state.prompts]);

            return {
              prompts: newPrompts,
              isLoading: false,
              error: null,
            };
          }, false, 'createPrompt/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'createPrompt/error');
        }
      },

      updatePrompt: async (promptId: string, data: UpdatePromptTemplateDto) => {
        set({ isLoading: true, error: null }, false, 'updatePrompt/start');
        try {
          const updatedPrompt = await promptService.updatePrompt(promptId, data);

          set(state => {
            const newPrompts = state.prompts.map(prompt =>
              prompt.id === promptId ? updatedPrompt : prompt
            );
            return {
              prompts: newPrompts,
              isLoading: false,
              error: null,
            };
          }, false, 'updatePrompt/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'updatePrompt/error');
        }
      },

      resetPrompt: async (promptId: string) => {
        set({ isLoading: true, error: null }, false, 'resetPrompt/start');
        try {
          const resetPromptData = await promptService.resetPrompt(promptId);

          set(state => {
            const newPrompts = state.prompts.map(prompt =>
              prompt.id === promptId ? resetPromptData : prompt
            );
            return {
              prompts: newPrompts,
              isLoading: false,
              error: null,
            };
          }, false, 'resetPrompt/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'resetPrompt/error');
        }
      },

      deletePrompt: async (promptId: string) => {
        set({ isLoading: true, error: null }, false, 'deletePrompt/start');
        try {
          await promptService.deletePrompt(promptId);

          set(state => {
            const remainingPrompts = state.prompts.filter(p => p.id !== promptId);
            // Clear selected if it was the deleted prompt
            const newSelectedId = state.selectedPromptId === promptId
              ? null
              : state.selectedPromptId;

            return {
              prompts: remainingPrompts,
              selectedPromptId: newSelectedId,
              isLoading: false,
              error: null,
            };
          }, false, 'deletePrompt/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'deletePrompt/error');
        }
      },

      setSelectedPromptId: (promptId: string | null) => {
        set({ selectedPromptId: promptId }, false, 'setSelectedPromptId');
      },

      setSelectedCategory: (category: PromptCategory | null) => {
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

      getSelectedPrompt: () => {
        const state = get();
        return state.prompts.find(p => p.id === state.selectedPromptId);
      },

      getFilteredPrompts: () => {
        const state = get();
        return filterPrompts(
          state.prompts,
          state.selectedCategory,
          state.searchQuery
        );
      },
    }),
    { name: 'PromptStore' }
  )
);
