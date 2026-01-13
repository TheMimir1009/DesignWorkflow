/**
 * ProjectSettingsModal Component
 * Modal for editing project settings with tabs
 */
import { useState, useEffect, useId } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { LLMSettingsTab } from '../llm/LLMSettingsTab';

export interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

type TabId = 'basic' | 'techstack' | 'categories' | 'llm' | 'danger';

const SUGGESTED_TECH_STACKS = ['Unity', 'Unreal', 'Node.js', 'AWS', 'React', 'TypeScript'];
const SUGGESTED_CATEGORIES = ['System', 'Content', 'UI', 'Economy', 'Growth', 'Narrative'];

export function ProjectSettingsModal({ isOpen, onClose, projectId }: ProjectSettingsModalProps) {
  const { projects, updateProject, deleteProject } = useProjectStore();
  const project = projects.find((p) => p.id === projectId);

  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleId = useId();

  // Initialize form when modal opens or project changes
  useEffect(() => {
    if (isOpen && project) {
      setName(project.name);
      setDescription(project.description);
      setTechStack([...project.techStack]);
      setCategories([...project.categories]);
      setActiveTab('basic');
      setShowDeleteConfirm(false);
    }
  }, [isOpen, project]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteConfirm) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showDeleteConfirm]);

  const hasChanges = project
    ? name !== project.name ||
      description !== project.description ||
      JSON.stringify(techStack) !== JSON.stringify(project.techStack) ||
      JSON.stringify(categories) !== JSON.stringify(project.categories)
    : false;

  const handleSave = async () => {
    if (!hasChanges || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateProject(projectId, {
        name: name.trim(),
        description: description.trim(),
        techStack,
        categories,
      });
      onClose();
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      // Error handled by store
    }
  };

  const addTechStack = (tech: string) => {
    if (!techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
    }
  };

  const removeTechStack = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const addCategory = (cat: string) => {
    if (!categories.includes(cat)) {
      setCategories([...categories, cat]);
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  if (!isOpen || !project) {
    return null;
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'basic', label: '기본 정보' },
    { id: 'techstack', label: '기술 스택' },
    { id: 'categories', label: '카테고리' },
    { id: 'llm', label: 'LLM 설정' },
    { id: 'danger', label: '위험 영역' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
          role="dialog"
          aria-labelledby={titleId}
          aria-modal="true"
          className="bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-700">
            <h2 id={titleId} className="text-xl font-semibold text-white">
              프로젝트 설정
            </h2>
          </div>

          {/* Tabs */}
          <div role="tablist" className="flex border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                } ${tab.id === 'danger' ? 'text-red-400' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'basic' && (
              <div id="tabpanel-basic" role="tabpanel">
                <div className="mb-4">
                  <label htmlFor="settings-name" className="block text-sm font-medium text-gray-300 mb-2">
                    프로젝트 이름
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="settings-description" className="block text-sm font-medium text-gray-300 mb-2">
                    설명
                  </label>
                  <textarea
                    id="settings-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'techstack' && (
              <div id="tabpanel-techstack" role="tabpanel">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">현재 기술 스택</label>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechStack(tech)}
                          aria-label={`remove ${tech}`}
                          className="hover:text-gray-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    {techStack.length === 0 && <span className="text-gray-500">기술 스택이 없습니다</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">추가</label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TECH_STACKS.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => addTechStack(tech)}
                        aria-label={`add ${tech}`}
                        disabled={techStack.includes(tech)}
                        className={`px-2 py-1 text-sm rounded border ${
                          techStack.includes(tech)
                            ? 'bg-blue-600 border-blue-600 text-white opacity-50 cursor-not-allowed'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div id="tabpanel-categories" role="tabpanel">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">현재 카테고리</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm rounded"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => removeCategory(cat)}
                          aria-label={`remove ${cat}`}
                          className="hover:text-gray-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    {categories.length === 0 && <span className="text-gray-500">카테고리가 없습니다</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">추가</label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => addCategory(cat)}
                        aria-label={`add ${cat}`}
                        disabled={categories.includes(cat)}
                        className={`px-2 py-1 text-sm rounded border ${
                          categories.includes(cat)
                            ? 'bg-green-600 border-green-600 text-white opacity-50 cursor-not-allowed'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'llm' && (
              <LLMSettingsTab projectId={projectId} />
            )}

            {activeTab === 'danger' && (
              <div id="tabpanel-danger" role="tabpanel">
                <div className="p-4 border border-red-500 rounded-lg">
                  <h3 className="text-lg font-medium text-red-400 mb-2">프로젝트 삭제</h3>
                  <p className="text-gray-400 mb-4">
                    이 작업은 되돌릴 수 없습니다. 프로젝트와 관련된 모든 데이터가 영구적으로 삭제됩니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    프로젝트 삭제
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="프로젝트 삭제"
        message={`정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제 확인"
        cancelText="취소"
        requireInput={project.name}
      />
    </>
  );
}
