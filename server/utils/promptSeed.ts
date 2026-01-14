/**
 * Prompt Seed Data
 * Extracts default prompt templates from promptBuilder and seeds them to storage
 *
 * This provides initial prompt templates for the prompt management system
 */
import type {
  PromptTemplate,
  PromptCategory,
  PromptVariable,
  CreatePromptTemplateDto,
} from '../../src/types/index.ts';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllPrompts,
  createPrompt,
  getPromptById,
} from './promptStorage.ts';

/**
 * Default prompt templates extracted from promptBuilder.ts
 */
export function getDefaultPromptTemplates(): CreatePromptTemplateDto[] {
  return [
    // Document Generation Prompts
    {
      name: 'Design Document Generator',
      category: 'document-generation',
      description: 'Generate Game Design Documents (GDD) from Q&A responses',
      content: `## Game Design Document (GDD) Generation Request

**IMPORTANT INSTRUCTIONS:**
- Generate the Game Design Document IMMEDIATELY without asking any clarifying questions.
- Do NOT use AskUserQuestion or any interactive tools.
- If any information is unclear or incomplete, make reasonable assumptions and proceed.
- Focus on generating a complete GDD based on the provided inputs.
- This is a GAME DESIGN document, NOT a software development document.

Generate a comprehensive Game Design Document based on the following Q&A responses.

## Q&A Responses
{{qaResponses}}

## Reference Systems
{{referenceSystems}}

## Output Format
Generate the Game Design Document in markdown format with the following sections:

### 1. Game Overview
- Game Concept (핵심 컨셉)
- Genre and Sub-genre (장르)
- Core Experience (핵심 경험 - 플레이어가 느낄 감정/재미)
- Unique Selling Points (차별화 요소)

### 2. Core Gameplay Mechanics
- Core Loop (핵심 게임 루프)
- Player Actions (플레이어 조작/행동)
- Win/Lose Conditions (승리/패배 조건)
- Feedback Systems (피드백 시스템)

### 3. Game Systems
- Economy System (재화, 보상, 소비 구조)
- Progression System (성장, 레벨업, 해금 구조)
- Combat/Action System (전투/액션 시스템, 해당시)
- Social System (소셜 기능, 해당시)

### 4. Balance & Tuning
- Numerical Balance (수치 밸런싱 기준)
- Difficulty Curve (난이도 곡선)
- Economy Balance (경제 밸런스)
- Pacing (게임 진행 속도)

### 5. Content Design
- Content Structure (콘텐츠 구성)
- Stage/Level Design (스테이지/레벨 설계)
- Character/Unit Design (캐릭터/유닛 설계, 해당시)
- Item/Equipment Design (아이템/장비 설계, 해당시)

### 6. User Interface
- HUD Design (HUD 구성)
- Menu Flow (메뉴 흐름)
- Key Screens (주요 화면 설계)
- UX Principles (UX 원칙)

### 7. Target Platform & Audience
- Target Platform (타겟 플랫폼)
- Target Audience (타겟 유저층)
- Monetization Strategy (수익화 전략, 해당시)

**Remember: Generate the Game Design Document directly. Do not ask questions.**`,
      variables: [
        {
          name: 'qaResponses',
          type: 'array',
          description: 'Array of Q&A response objects with question and answer properties',
          required: true,
          example: '[{"question": "What is the game about?", "answer": "A puzzle game"}]',
        },
        {
          name: 'referenceSystems',
          type: 'array',
          description: 'Optional array of reference system objects',
          required: false,
          example: '[{"id": "sys1", "name": "System Name", "description": "Description"}]',
        },
      ],
    },
    {
      name: 'PRD Generator',
      category: 'document-generation',
      description: 'Generate Product Requirements Documents (PRD) from Game Design Documents',
      content: `## PRD (Development Specification) Generation Request

**IMPORTANT INSTRUCTIONS:**
- Generate the PRD IMMEDIATELY without asking any clarifying questions.
- Do NOT use AskUserQuestion or any interactive tools.
- If any information is unclear or incomplete, make reasonable assumptions and proceed.
- This PRD is a DEVELOPMENT SPECIFICATION document for engineers to implement.
- Extract implementation requirements from the Game Design Document.
- Focus on technical implementation details, NOT game design concepts.

Generate a Development-focused PRD based on the following Game Design Document.

## Project Technical Context
{{projectContext}}

## Game Design Document (Source)
{{gddContent}}

## Output Format
Generate the PRD in markdown format with the following sections:

### 1. Executive Summary
- Development objectives (개발 목표)
- Scope and boundaries (범위 및 경계)
- Key deliverables (주요 산출물)

### 2. Technical Stack & Architecture
- Frontend technology (프론트엔드 기술)
- Backend technology (백엔드 기술)
- Database selection (데이터베이스)
- Infrastructure requirements (인프라 요구사항)

### 3. System Architecture
- High-level architecture diagram description (시스템 구조)
- Component breakdown (컴포넌트 분해)
- Data flow description (데이터 흐름)
- External service integrations (외부 서비스 연동)

### 4. API Design
- API endpoints list (API 엔드포인트 목록)
- Request/Response format (요청/응답 형식)
- Authentication requirements (인증 요구사항)
- Rate limiting and security (보안 요구사항)

### 5. Database Schema
- Entity definitions (엔티티 정의)
- Relationships (관계)
- Indexing strategy (인덱싱 전략)
- Data migration considerations (마이그레이션 고려사항)

### 6. Frontend Component Structure
- Page/View hierarchy (페이지 구조)
- Reusable component list (재사용 컴포넌트)
- State management approach (상태 관리)
- Routing structure (라우팅 구조)

### 7. Implementation Requirements
- Feature-by-feature requirements (기능별 구현 요구사항)
- Priority order (우선순위)
- Dependencies between features (기능간 의존성)
- Estimated complexity (복잡도 추정)

### 8. Acceptance Criteria
- Functional acceptance criteria (기능적 검증 기준)
- Performance criteria (성능 기준)
- Security criteria (보안 기준)
- User experience criteria (UX 기준)

**Remember: Generate the PRD as a development specification. Do not ask questions.**`,
      variables: [
        {
          name: 'gddContent',
          type: 'string',
          description: 'The Game Design Document content in markdown format',
          required: true,
          example: '# Game Design Document\\n\\n## Game Overview...',
        },
        {
          name: 'projectContext',
          type: 'object',
          description: 'Optional project context including tech stack and architecture',
          required: false,
          example: '{"techStack": ["React", "Node.js"], "architecture": "microservices"}',
        },
      ],
    },
    {
      name: 'Prototype Generator',
      category: 'document-generation',
      description: 'Generate interactive HTML prototypes from PRD content',
      content: `## Prototype Generation Request

**IMPORTANT INSTRUCTIONS:**
- Generate the prototype IMMEDIATELY without asking any clarifying questions.
- Do NOT use AskUserQuestion or any interactive tools.
- If any information is unclear or incomplete, make reasonable assumptions and proceed.
- Focus on generating a complete HTML prototype based on the provided PRD.

Generate an interactive HTML prototype based on the following PRD.

## PRD Content
{{prdContent}}

## Output Format
Generate a single HTML file that includes:
- Complete HTML structure
- Embedded CSS styles (preferably Tailwind CSS classes)
- Interactive JavaScript for clickable elements
- Functional navigation between views
- Responsive design for mobile and desktop

## Requirements
- The prototype should be interactive and demonstrate the main user flows
- Use modern CSS styling for a professional appearance
- Include placeholder content that represents real data
- Ensure all navigation elements are clickable and functional

**Remember: Generate the prototype directly. Do not ask questions.**`,
      variables: [
        {
          name: 'prdContent',
          type: 'string',
          description: 'The PRD content in markdown format',
          required: true,
          example: '# PRD\\n\\n## Executive Summary...',
        },
      ],
    },

    // Code Operation Prompts
    {
      name: 'Code Generator',
      category: 'code-operation',
      description: 'Generate clean, well-structured code based on specifications',
      content: `## Generation Request

Type: {{type}}
Language: {{language}}
{{framework?Framework: {{framework}}}}

## Description
{{description}}

{{additionalContext?## Additional Context
{{additionalContext}}}}

## Instructions
Generate clean, well-structured code that follows best practices for {{language}}.`,
      variables: [
        {
          name: 'type',
          type: 'string',
          description: 'Type of generation (code, component, test, api)',
          required: true,
          example: 'component',
        },
        {
          name: 'language',
          type: 'string',
          description: 'Target programming language',
          required: true,
          example: 'TypeScript',
        },
        {
          name: 'framework',
          type: 'string',
          description: 'Optional framework to use',
          required: false,
          example: 'React',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description of what to generate',
          required: true,
          example: 'A user authentication component with login form',
        },
        {
          name: 'additionalContext',
          type: 'string',
          description: 'Additional context for generation',
          required: false,
          example: 'Should support OAuth and email/password login',
        },
      ],
    },
    {
      name: 'Code Review',
      category: 'code-operation',
      description: 'Perform thorough code review with actionable feedback',
      content: `## Code Review Request

Language: {{language}}
{{focusAreas?## Focus Areas
{{focusAreas}}}}

## Code to Review
\`\`\`{{language}}
{{code}}
\`\`\`

## Instructions
Provide a thorough code review with actionable feedback and suggestions for improvement.`,
      variables: [
        {
          name: 'code',
          type: 'string',
          description: 'The code to review',
          required: true,
          example: 'function example() { return true; }',
        },
        {
          name: 'language',
          type: 'string',
          description: 'Programming language',
          required: true,
          example: 'TypeScript',
        },
        {
          name: 'focusAreas',
          type: 'array',
          description: 'Specific areas to focus on',
          required: false,
          example: '["performance", "security", "readability"]',
        },
      ],
    },
    {
      name: 'Code Optimization',
      category: 'code-operation',
      description: 'Optimize code for performance and maintainability',
      content: `## Code Optimization Request

Language: {{language}}
{{targets?## Optimization Targets
{{targets}}}}

## Code to Optimize
\`\`\`{{language}}
{{code}}
\`\`\`

## Instructions
Optimize the code while maintaining functionality. Explain each optimization made.`,
      variables: [
        {
          name: 'code',
          type: 'string',
          description: 'The code to optimize',
          required: true,
          example: 'function example() { /* code */ }',
        },
        {
          name: 'language',
          type: 'string',
          description: 'Programming language',
          required: true,
          example: 'JavaScript',
        },
        {
          name: 'targets',
          type: 'array',
          description: 'Optimization targets',
          required: false,
          example: '["performance", "memory", "readability"]',
        },
      ],
    },
    {
      name: 'Documentation Generator',
      category: 'code-operation',
      description: 'Generate comprehensive documentation for code',
      content: `## Documentation Request

Language: {{language}}
{{style?Style: {{style}}}}

## Code to Document
\`\`\`{{language}}
{{code}}
\`\`\`

## Instructions
Document the code with clear explanations of purpose, parameters, return values, and usage examples.`,
      variables: [
        {
          name: 'code',
          type: 'string',
          description: 'The code to document',
          required: true,
          example: 'function calculateSum(a, b) { return a + b; }',
        },
        {
          name: 'language',
          type: 'string',
          description: 'Programming language',
          required: true,
          example: 'Python',
        },
        {
          name: 'style',
          type: 'string',
          description: 'Documentation style (jsdoc, markdown, etc.)',
          required: false,
          example: 'jsdoc',
        },
      ],
    },

    // Analysis Prompts
    {
      name: 'Code Analysis',
      category: 'analysis',
      description: 'Analyze code structure, patterns, and quality',
      content: `## Code Analysis Request

Language: {{language}}
{{aspects?## Analysis Aspects
{{aspects}}}}

## Code to Analyze
\`\`\`{{language}}
{{code}}
\`\`\`

## Instructions
Analyze the code structure, patterns, and provide insights on code quality.`,
      variables: [
        {
          name: 'code',
          type: 'string',
          description: 'The code to analyze',
          required: true,
          example: 'class Example { constructor() {} }',
        },
        {
          name: 'language',
          type: 'string',
          description: 'Programming language',
          required: true,
          example: 'Java',
        },
        {
          name: 'aspects',
          type: 'array',
          description: 'Aspects to analyze',
          required: false,
          example: '["complexity", "patterns", "maintainability"]',
        },
      ],
    },
    {
      name: 'Feature Analysis',
      category: 'analysis',
      description: 'Analyze features and extract keywords, categories, and complexity',
      content: `## Feature Analysis Request

Analyze the following features and extract relevant keywords and categories.

## Feature List
{{featureList}}

## Output Format
Provide the analysis in JSON structured format with:
- keywords: Array of extracted keywords from all features
- categories: Object grouping features by category (core, enhancement, integration, etc.)
- complexity: Estimated complexity for each feature (low, medium, high)
- dependencies: Potential dependencies between features`,
      variables: [
        {
          name: 'featureList',
          type: 'array',
          description: 'List of feature descriptions',
          required: true,
          example: '["User authentication", "Data export", "API integration"]',
        },
      ],
    },

    // Utility Prompts
    {
      name: 'Document Modification',
      category: 'utility',
      description: 'Modify documents according to instructions while preserving structure',
      content: `## Document Modification Request

Modify the following document according to the provided instructions.

## Original Document
{{originalContent}}

## Modification Instructions
{{modificationInstructions}}

## Requirements
- Preserve the overall structure and format of the document
- Apply the requested modifications while maintaining consistency
- Revise and update related sections as needed
- Return the complete modified document`,
      variables: [
        {
          name: 'originalContent',
          type: 'string',
          description: 'The original document content',
          required: true,
          example: '# Original Document\\n\\nContent here...',
        },
        {
          name: 'modificationInstructions',
          type: 'string',
          description: 'Instructions for modifications',
          required: true,
          example: 'Update section 2 to include new requirements',
        },
      ],
    },
  ];
}

/**
 * Check if default prompts have been seeded
 */
export async function isPromptSeeded(): Promise<boolean> {
  const prompts = await getAllPrompts();
  return prompts.length > 0;
}

/**
 * Seed default prompts to storage
 * This function is idempotent - running it multiple times won't create duplicates
 */
export async function seedDefaultPrompts(): Promise<void> {
  // Check if already seeded
  if (await isPromptSeeded()) {
    return;
  }

  const templates = getDefaultPromptTemplates();

  for (const template of templates) {
    const promptId = uuidv4();
    try {
      await createPrompt(promptId, template);
    } catch (error) {
      console.error(`Failed to seed prompt "${template.name}":`, error);
    }
  }
}
