import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { KanbanBoard } from './components/kanban';
import { SystemSidebar } from './components/system/SystemSidebar';
import { TemplateManager } from './components/template/TemplateManager';
import { useProjectStore } from './store/projectStore';

// Simple client-side routing
export type AppView = 'kanban' | 'templates';

function App() {
  const { fetchProjects, currentProject, isLoading, error } = useProjectStore();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('kanban');

  // Initialize: fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'templates') {
        setCurrentView('templates');
      } else {
        setCurrentView('kanban');
      }
    };

    // Set initial view based on hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    if (currentView === 'templates') {
      return (
        <div className="bg-white min-h-full">
          <TemplateManager />
        </div>
      );
    }

    // Kanban view
    return (
      <>
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
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <div className="flex-1 flex">
        {/* System Document Sidebar - only show in kanban view */}
        {currentView === 'kanban' && (
          <SystemSidebar
            projectId={currentProject?.id || null}
            isExpanded={isSidebarExpanded}
            onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 ${currentView === 'kanban' ? 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
