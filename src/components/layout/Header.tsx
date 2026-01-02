/**
 * Header Component
 * Application header layout with project selector and modals
 */
import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { ProjectSelector } from '../project/ProjectSelector';
import { ProjectCreateModal } from '../project/ProjectCreateModal';
import { ProjectSettingsModal } from '../project/ProjectSettingsModal';

export function Header() {
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

            {/* Center - Project Selector */}
            <div className="flex items-center">
              <ProjectSelector
                onNewProject={handleNewProject}
                onSettings={handleSettings}
              />
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
