import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { KanbanBoard } from './components/kanban';
import { SystemSidebar, SystemCreateModal, SystemEditModal } from './components/system';
import { useProjectStore } from './store/projectStore';
import { useSystemStore } from './store/systemStore';

function App() {
  const { fetchProjects, currentProject, isLoading, error } = useProjectStore();

  // System modal state
  const isCreateModalOpen = useSystemStore((state) => state.isCreateModalOpen);
  const isEditModalOpen = useSystemStore((state) => state.isEditModalOpen);
  const selectedSystem = useSystemStore((state) => state.selectedSystem);
  const closeCreateModal = useSystemStore((state) => state.closeCreateModal);
  const closeEditModal = useSystemStore((state) => state.closeEditModal);

  // Initialize: fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!isLoading && !error && currentProject && (
            <KanbanBoard projectId={currentProject.id} />
          )}

          {!isLoading && !error && !currentProject && (
            <div className="text-center text-gray-400 py-16">
              <h2 className="text-2xl font-semibold mb-4">Welcome to AI Workflow Kanban</h2>
              <p>Select a project from the header to get started, or create a new one.</p>
            </div>
          )}
        </main>

        {/* System Sidebar (Right Side) */}
        {currentProject && (
          <SystemSidebar projectId={currentProject.id} />
        )}
      </div>

      {/* System Modals */}
      {currentProject && (
        <>
          <SystemCreateModal
            isOpen={isCreateModalOpen}
            onClose={closeCreateModal}
            projectId={currentProject.id}
          />
          <SystemEditModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            system={selectedSystem}
          />
        </>
      )}
    </div>
  );
}

export default App;
