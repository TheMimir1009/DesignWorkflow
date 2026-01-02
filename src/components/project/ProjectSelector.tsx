/**
 * ProjectSelector Component
 * Header dropdown for project selection with keyboard navigation
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';

export interface ProjectSelectorProps {
  onNewProject: () => void;
  onSettings: () => void;
}

export function ProjectSelector({ onNewProject, onSettings }: ProjectSelectorProps) {
  const { projects, currentProject, selectProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % projects.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + projects.length) % projects.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (projects[highlightedIndex]) {
            selectProject(projects[highlightedIndex].id);
            setIsOpen(false);
          }
          break;
      }
    },
    [isOpen, projects, highlightedIndex, selectProject]
  );

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      // Reset highlighted index to current project when opening
      const currentIndex = projects.findIndex((p) => p.id === currentProject?.id);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  };

  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    setIsOpen(false);
  };

  const handleNewProject = () => {
    onNewProject();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>{currentProject?.name ?? '프로젝트 선택'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onSettings}
          aria-label="Settings"
          className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
          <ul
            ref={listboxRef}
            role="listbox"
            aria-label="Projects"
            className="py-1 max-h-60 overflow-y-auto"
          >
            {projects.map((project, index) => {
              const isSelected = project.id === currentProject?.id;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={project.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectProject(project.id)}
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer ${
                    isHighlighted ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="text-white">{project.name}</span>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="border-t border-gray-600">
            <button
              type="button"
              onClick={handleNewProject}
              className="flex items-center gap-2 w-full px-4 py-2 text-blue-400 hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>새 프로젝트</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
