import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { useProjectStore } from './store/projectStore';

function App() {
  const { fetchProjects, isLoading, error } = useProjectStore();

  // Initialize: fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {!isLoading && !error && (
          <div className="text-center text-gray-400 py-16">
            <h2 className="text-2xl font-semibold mb-4">Welcome to AI Workflow Kanban</h2>
            <p>Select a project from the header to get started, or create a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
