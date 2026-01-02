/**
 * ProjectCreateModal Component
 * Modal for creating new projects with tag inputs
 */
import { useState, useEffect, useRef, useId } from 'react';
import { useProjectStore } from '../../store/projectStore';

export interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SUGGESTED_TECH_STACKS = ['Unity', 'Unreal', 'Node.js', 'AWS', 'React', 'TypeScript'];
const SUGGESTED_CATEGORIES = ['시스템', '콘텐츠', 'UI', '경제', '성장', '네러티브'];

export function ProjectCreateModal({ isOpen, onClose, onSuccess }: ProjectCreateModalProps) {
  const { createProject } = useProjectStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [techStackInput, setTechStackInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const isValid = name.trim().length > 0 && name.length <= 100 && !nameError;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setTechStack([]);
      setCategories([]);
      setTechStackInput('');
      setCategoryInput('');
      setNameError(null);
      setIsSubmitting(false);

      // Focus name input
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Name validation
  useEffect(() => {
    if (name.length > 100) {
      setNameError('100자 이하로 입력해주세요');
    } else {
      setNameError(null);
    }
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
        techStack,
        categories,
      });
      onSuccess();
      onClose();
    } catch {
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTechStackKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = techStackInput.trim();
      if (value && !techStack.includes(value)) {
        setTechStack([...techStack, value]);
      }
      setTechStackInput('');
    } else if (e.key === 'Backspace' && techStackInput === '' && techStack.length > 0) {
      setTechStack(techStack.slice(0, -1));
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = categoryInput.trim();
      if (value && !categories.includes(value)) {
        setCategories([...categories, value]);
      }
      setCategoryInput('');
    } else if (e.key === 'Backspace' && categoryInput === '' && categories.length > 0) {
      setCategories(categories.slice(0, -1));
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 id={titleId} className="text-xl font-semibold text-white mb-6">
          새 프로젝트 만들기
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-300 mb-2">
              프로젝트 이름 *
            </label>
            <input
              ref={nameInputRef}
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="프로젝트 이름을 입력하세요"
            />
            {nameError && <p className="mt-1 text-sm text-red-400">{nameError}</p>}
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-300 mb-2">
              설명
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="프로젝트에 대한 설명을 입력하세요"
            />
          </div>

          {/* Tech Stack Field */}
          <div className="mb-4">
            <label htmlFor="project-techstack" className="block text-sm font-medium text-gray-300 mb-2">
              기술 스택
            </label>
            <div className="mb-2" data-testid="techstack-tags">
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
              </div>
            </div>
            <input
              id="project-techstack"
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              onKeyDown={handleTechStackKeyDown}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter를 눌러 추가"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED_TECH_STACKS.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => addTechStack(tech)}
                  aria-label={`add ${tech}`}
                  className={`px-2 py-1 text-sm rounded border ${
                    techStack.includes(tech)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Field */}
          <div className="mb-6">
            <label htmlFor="project-categories" className="block text-sm font-medium text-gray-300 mb-2">
              카테고리
            </label>
            <div className="mb-2" data-testid="category-tags">
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
              </div>
            </div>
            <input
              id="project-categories"
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={handleCategoryKeyDown}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter를 눌러 추가"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => addCategory(cat)}
                  aria-label={`add ${cat}`}
                  className={`px-2 py-1 text-sm rounded border ${
                    categories.includes(cat)
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
