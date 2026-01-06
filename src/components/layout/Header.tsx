/**
 * Header Component
 * Application header layout with project selector, navigation, and modals
 */
import { useState } from 'react';
import type { AppView } from '../../App';
import { useProjectStore } from '../../store/projectStore';
import { ProjectSelector } from '../project/ProjectSelector';
import { ProjectCreateModal } from '../project/ProjectCreateModal';
import { ProjectSettingsModal } from '../project/ProjectSettingsModal';

export interface HeaderProps {
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
}

export function Header({ currentView = 'kanban', onNavigate }: HeaderProps) {
  const { currentProject } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleNewProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleSettings = () => {
    if (currentProject) {
      setIsSettingsModalOpen(true);
    }
  };

  const handleCreateSuccess = () => {
    // Project was created successfully
  };

  const handleNavigation = (view: AppView) => {
    // Update URL hash
    window.location.hash = view === 'kanban' ? '' : view;
    onNavigate?.(view);
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                AI Workflow Kanban
              </h1>
            </div>

            {/* Center - Navigation */}
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigation('kanban')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'kanban'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigation('templates')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'templates'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Templates
                </button>
              </nav>

              {/* Project Selector - only show in kanban view */}
              {currentView === 'kanban' && (
                <ProjectSelector
                  onNewProject={handleNewProject}
                  onSettings={handleSettings}
                />
              )}
            </div>

            {/* Right - Future user menu placeholder */}
            <div className="w-32">
              {/* Reserved for future user menu */}
            </div>
          </div>
        </div>
      </header>

      {/* Create Project Modal */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Settings Modal */}
      {currentProject && (
        <ProjectSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          projectId={currentProject.id}
        />
      )}
    </>
  );
}
