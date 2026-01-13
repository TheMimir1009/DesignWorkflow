import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { KanbanBoard } from './components/kanban';
import { SystemSidebar, SystemCreateModal, SystemEditModal } from './components/system';
import { DebugConsole } from './components/debug';
import { useProjectStore } from './store/projectStore';
import { useSystemStore } from './store/systemStore';
import { useDebugStore } from './store/debugStore';
import { useDebugShortcut } from './hooks/useDebugShortcut';

function App() {
  const { fetchProjects, currentProject, isLoading, error } = useProjectStore();

  // System modal state
  const isCreateModalOpen = useSystemStore((state) => state.isCreateModalOpen);
  const isEditModalOpen = useSystemStore((state) => state.isEditModalOpen);
  const selectedSystem = useSystemStore((state) => state.selectedSystem);
  const closeCreateModal = useSystemStore((state) => state.closeCreateModal);
  const closeEditModal = useSystemStore((state) => state.closeEditModal);

  // SPEC-DEBUG-002: Debug Console state and keyboard shortcut
  const isOpen = useDebugStore((state) => state.isOpen);
  const toggle = useDebugStore((state) => state.toggle);

  // Register keyboard shortcut for Debug Console toggle
  // REQ-E-001: Toggle Debug Console with Cmd+Shift+D (macOS) or Ctrl+Shift+D (Windows/Linux)
  useDebugShortcut(toggle);

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

        {/* SPEC-DEBUG-002: Debug Console (shown when isOpen is true) */}
        {isOpen && (
          <div className="w-96 border-l border-gray-700 bg-gray-900">
            <DebugConsole />
          </div>
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
