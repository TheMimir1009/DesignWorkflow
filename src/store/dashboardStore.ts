/**
 * Dashboard Store - Zustand State Management
 * Centralized state management for dashboard and analytics
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PeriodFilter, DashboardState } from '../types';
import * as dashboardService from '../services/dashboardService';

/**
 * Dashboard store actions interface
 */
export interface DashboardStoreActions {
  fetchSummary: (projectId: string) => Promise<void>;
  fetchTimeline: (projectId: string, period: PeriodFilter) => Promise<void>;
  setPeriodFilter: (filter: PeriodFilter) => void;
  clearError: () => void;
}

/**
 * Combined dashboard store type
 */
export type DashboardStore = DashboardState & DashboardStoreActions;

/**
 * Dashboard store with Zustand
 */
export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set) => ({
      // Initial state
      summary: null,
      timeline: [],
      periodFilter: 'weekly',
      isLoading: false,
      error: null,

      // Actions
      fetchSummary: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchSummary/start');
        try {
          const summary = await dashboardService.getSummary(projectId);
          set(
            {
              summary,
              isLoading: false,
              error: null,
            },
            false,
            'fetchSummary/success'
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'fetchSummary/error'
          );
        }
      },

      fetchTimeline: async (projectId: string, period: PeriodFilter) => {
        set({ isLoading: true, error: null }, false, 'fetchTimeline/start');
        try {
          const timeline = await dashboardService.getTimeline(projectId, period);
          set(
            {
              timeline,
              isLoading: false,
              error: null,
            },
            false,
            'fetchTimeline/success'
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'fetchTimeline/error'
          );
        }
      },

      setPeriodFilter: (filter: PeriodFilter) => {
        set({ periodFilter: filter }, false, 'setPeriodFilter');
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },
    }),
    { name: 'DashboardStore' }
  )
);
