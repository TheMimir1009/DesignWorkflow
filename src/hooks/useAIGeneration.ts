/**
 * useAIGeneration Hook
 * Custom hook for AI generation state management
 *
 * Requirements:
 * - REQ-U-004: Frontend API client integration
 * - REQ-N-003: Loading state management
 */
import { useState, useCallback } from 'react';
import {
  generateCode as apiGenerateCode,
  generateComponent as apiGenerateComponent,
  reviewCode as apiReviewCode,
  optimizeCode as apiOptimizeCode,
  analyzeCode as apiAnalyzeCode,
  generateDesignDocument as apiGenerateDesignDocument,
  generatePRD as apiGeneratePRD,
  generatePrototype as apiGeneratePrototype,
  analyzeFeatures as apiAnalyzeFeatures,
  modifyDocument as apiModifyDocument,
  getGenerationStatus as apiGetGenerationStatus,
  getGenerationHistory as apiGetGenerationHistory,
  type GenerateCodeRequest,
  type GenerateComponentRequest,
  type ReviewCodeRequest,
  type OptimizeCodeRequest,
  type AnalyzeCodeRequest,
  type GenerateDesignDocumentRequest,
  type GeneratePRDRequest,
  type GeneratePrototypeRequest,
  type AnalyzeFeaturesRequest,
  type ModifyDocumentRequest,
  type AIGenerationResponse,
  type GenerationStatusResponse,
  type GenerationHistoryResponse,
  type PaginationOptions,
} from '../services/claudeCodeService.ts';

/**
 * State for AI generation hook
 */
export interface AIGenerationState {
  /** Whether a request is in progress */
  isLoading: boolean;
  /** Error from the last request */
  error: Error | null;
  /** Result from the last successful request */
  result: AIGenerationResponse | null;
}

/**
 * Return type for useAIGeneration hook
 */
export interface UseAIGenerationReturn extends AIGenerationState {
  /** Generate code based on description */
  generateCode: (request: GenerateCodeRequest) => Promise<void>;
  /** Generate UI component */
  generateComponent: (request: GenerateComponentRequest) => Promise<void>;
  /** Review code and get feedback */
  reviewCode: (request: ReviewCodeRequest) => Promise<void>;
  /** Optimize code */
  optimizeCode: (request: OptimizeCodeRequest) => Promise<void>;
  /** Analyze code structure */
  analyzeCode: (request: AnalyzeCodeRequest) => Promise<void>;
  /** Generate design document from Q&A responses */
  generateDesignDocument: (request: GenerateDesignDocumentRequest) => Promise<void>;
  /** Generate PRD from design document */
  generatePRD: (request: GeneratePRDRequest) => Promise<void>;
  /** Generate prototype HTML from PRD */
  generatePrototype: (request: GeneratePrototypeRequest) => Promise<void>;
  /** Analyze features and extract keywords */
  analyzeFeatures: (request: AnalyzeFeaturesRequest) => Promise<void>;
  /** Modify existing document */
  modifyDocument: (request: ModifyDocumentRequest) => Promise<void>;
  /** Get generation service status */
  getGenerationStatus: () => Promise<GenerationStatusResponse>;
  /** Get generation history for a project */
  getGenerationHistory: (projectId: string, options?: PaginationOptions) => Promise<GenerationHistoryResponse>;
  /** Reset state to initial values */
  reset: () => void;
  /** Clear error while keeping result */
  clearError: () => void;
}

/**
 * Custom hook for AI-powered code generation
 *
 * Provides state management for AI generation operations including
 * loading state, error handling, and result storage.
 *
 * @example
 * ```tsx
 * const { generateCode, isLoading, error, result } = useAIGeneration();
 *
 * const handleGenerate = async () => {
 *   await generateCode({ description: 'Create a button', language: 'tsx' });
 *   if (result) {
 *     console.log(result.data);
 *   }
 * };
 * ```
 */
export function useAIGeneration(): UseAIGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<AIGenerationResponse | null>(null);

  /**
   * Execute an API call with loading state management
   */
  const executeWithLoading = useCallback(
    async (apiCall: () => Promise<AIGenerationResponse>): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        setResult(response);
      } catch (err) {
        setError(err as Error);
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Generate code based on description
   */
  const generateCode = useCallback(
    async (request: GenerateCodeRequest): Promise<void> => {
      await executeWithLoading(() => apiGenerateCode(request));
    },
    [executeWithLoading]
  );

  /**
   * Generate UI component
   */
  const generateComponent = useCallback(
    async (request: GenerateComponentRequest): Promise<void> => {
      await executeWithLoading(() => apiGenerateComponent(request));
    },
    [executeWithLoading]
  );

  /**
   * Review code and get feedback
   */
  const reviewCode = useCallback(
    async (request: ReviewCodeRequest): Promise<void> => {
      await executeWithLoading(() => apiReviewCode(request));
    },
    [executeWithLoading]
  );

  /**
   * Optimize code
   */
  const optimizeCode = useCallback(
    async (request: OptimizeCodeRequest): Promise<void> => {
      await executeWithLoading(() => apiOptimizeCode(request));
    },
    [executeWithLoading]
  );

  /**
   * Analyze code structure
   */
  const analyzeCode = useCallback(
    async (request: AnalyzeCodeRequest): Promise<void> => {
      await executeWithLoading(() => apiAnalyzeCode(request));
    },
    [executeWithLoading]
  );

  /**
   * Reset state to initial values
   */
  const reset = useCallback((): void => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  /**
   * Clear error while keeping result
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Generate design document from Q&A responses
   */
  const generateDesignDocument = useCallback(
    async (request: GenerateDesignDocumentRequest): Promise<void> => {
      await executeWithLoading(() => apiGenerateDesignDocument(request));
    },
    [executeWithLoading]
  );

  /**
   * Generate PRD from design document
   */
  const generatePRD = useCallback(
    async (request: GeneratePRDRequest): Promise<void> => {
      await executeWithLoading(() => apiGeneratePRD(request));
    },
    [executeWithLoading]
  );

  /**
   * Generate prototype HTML from PRD
   */
  const generatePrototype = useCallback(
    async (request: GeneratePrototypeRequest): Promise<void> => {
      await executeWithLoading(() => apiGeneratePrototype(request));
    },
    [executeWithLoading]
  );

  /**
   * Analyze features and extract keywords
   */
  const analyzeFeatures = useCallback(
    async (request: AnalyzeFeaturesRequest): Promise<void> => {
      await executeWithLoading(() => apiAnalyzeFeatures(request));
    },
    [executeWithLoading]
  );

  /**
   * Modify existing document
   */
  const modifyDocument = useCallback(
    async (request: ModifyDocumentRequest): Promise<void> => {
      await executeWithLoading(() => apiModifyDocument(request));
    },
    [executeWithLoading]
  );

  /**
   * Get generation service status (without affecting loading state)
   */
  const getGenerationStatus = useCallback(
    async (): Promise<GenerationStatusResponse> => {
      return apiGetGenerationStatus();
    },
    []
  );

  /**
   * Get generation history for a project (without affecting loading state)
   */
  const getGenerationHistory = useCallback(
    async (projectId: string, options?: PaginationOptions): Promise<GenerationHistoryResponse> => {
      return apiGetGenerationHistory(projectId, options);
    },
    []
  );

  return {
    isLoading,
    error,
    result,
    generateCode,
    generateComponent,
    reviewCode,
    optimizeCode,
    analyzeCode,
    generateDesignDocument,
    generatePRD,
    generatePrototype,
    analyzeFeatures,
    modifyDocument,
    getGenerationStatus,
    getGenerationHistory,
    reset,
    clearError,
  };
}

export default useAIGeneration;
