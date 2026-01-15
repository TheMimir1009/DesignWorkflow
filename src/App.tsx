import { type JSX } from 'react';

// React 19 App 컴포넌트
// 라우팅 루트 및 메인 레이아웃

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Design Workflow</h1>
            <p className="text-sm text-gray-600">AI-powered game design document management</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Design Workflow</h2>
          <p className="text-gray-600">
            This is the initial setup. The application is ready for development.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              ✓ Frontend: React 19 + TypeScript 5.9 + Vite 7.0 + Tailwind CSS 4.0
            </p>
            <p className="text-sm text-blue-800">
              ✓ Backend: Express 5.0 + TypeScript 5.9
            </p>
            <p className="text-sm text-blue-800">
              ✓ State Management: Zustand 5.0
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
