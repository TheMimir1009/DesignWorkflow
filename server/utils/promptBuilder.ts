/**
 * Prompt Builder Utility
 * Constructs dynamic prompts for Claude Code integration
 *
 * Requirements:
 * - REQ-S-002: Dynamic prompt composition
 * - Reference system context injection
 * - Template-based prompt generation
 */

/**
 * Reference document for context injection
 */
export interface Reference {
  type: 'system' | 'design' | 'code' | 'document';
  name: string;
  content: string;
}

/**
 * Context for building prompts
 */
export interface PromptContext {
  /** Main task description */
  task: string;
  /** System-level context information */
  systemContext?: string;
  /** Reference documents to include */
  references?: Reference[];
  /** Constraints or requirements */
  constraints?: string[];
  /** Expected output format */
  outputFormat?: string;
}

/**
 * Options for code generation prompts
 */
export interface GeneratePromptOptions {
  /** Type of generation (code, component, test, etc.) */
  type: 'code' | 'component' | 'test' | 'api';
  /** Description of what to generate */
  description: string;
  /** Target programming language */
  language: string;
  /** Framework to use (optional) */
  framework?: string;
  /** Additional context for generation */
  additionalContext?: string;
}

/**
 * Options for code review prompts
 */
export interface ReviewPromptOptions {
  /** Programming language */
  language: string;
  /** Specific areas to focus on */
  focusAreas?: string[];
}

/**
 * Options for code optimization prompts
 */
export interface OptimizePromptOptions {
  /** Programming language */
  language: string;
  /** Optimization targets */
  targets?: string[];
}

/**
 * Options for documentation prompts
 */
export interface DocumentPromptOptions {
  /** Programming language */
  language: string;
  /** Documentation style (jsdoc, markdown, etc.) */
  style?: string;
}

/**
 * Options for code analysis prompts
 */
export interface AnalyzePromptOptions {
  /** Programming language */
  language: string;
  /** Aspects to analyze */
  aspects?: string[];
}

/**
 * Q&A Response for document generation
 */
export interface QAResponse {
  /** Question text */
  question: string;
  /** Answer text */
  answer: string;
}

/**
 * Reference system for context injection
 */
export interface ReferenceSystem {
  /** System ID */
  id: string;
  /** System name */
  name: string;
  /** System description */
  description: string;
}

/**
 * Build a general-purpose prompt from context
 */
export function buildPrompt(context: PromptContext): string {
  const sections: string[] = [];

  // Add system context if provided
  if (context.systemContext) {
    sections.push(`## System Context\n${context.systemContext}`);
  }

  // Add reference documents if provided
  if (context.references && context.references.length > 0) {
    const refsSection = context.references
      .map((ref) => `### ${ref.name} (${ref.type})\n${ref.content}`)
      .join('\n\n');
    sections.push(`## Reference Documents\n${refsSection}`);
  }

  // Add constraints if provided
  if (context.constraints && context.constraints.length > 0) {
    const constraintsSection = context.constraints.map((c) => `- ${c}`).join('\n');
    sections.push(`## Constraints\n${constraintsSection}`);
  }

  // Add output format if provided
  if (context.outputFormat) {
    sections.push(`## Output Format\nProvide output in ${context.outputFormat} format.`);
  }

  // Add main task
  sections.push(`## Task\n${context.task}`);

  return sections.join('\n\n');
}

/**
 * Build a code/component generation prompt
 */
export function buildGeneratePrompt(options: GeneratePromptOptions): string {
  const sections: string[] = [];

  sections.push(`## Generation Request`);
  sections.push(`Type: ${options.type}`);
  sections.push(`Language: ${options.language}`);

  if (options.framework) {
    sections.push(`Framework: ${options.framework}`);
  }

  sections.push(`\n## Description\n${options.description}`);

  if (options.additionalContext) {
    sections.push(`\n## Additional Context\n${options.additionalContext}`);
  }

  sections.push(
    `\n## Instructions\nGenerate clean, well-structured code that follows best practices for ${options.language}.`
  );

  return sections.join('\n');
}

/**
 * Build a code review prompt
 */
export function buildReviewPrompt(code: string, options: ReviewPromptOptions): string {
  const sections: string[] = [];

  sections.push(`## Code Review Request`);
  sections.push(`Language: ${options.language}`);

  if (options.focusAreas && options.focusAreas.length > 0) {
    sections.push(`\n## Focus Areas\n${options.focusAreas.map((a) => `- ${a}`).join('\n')}`);
  }

  sections.push(`\n## Code to Review\n\`\`\`${options.language}\n${code}\n\`\`\``);

  sections.push(
    `\n## Instructions\nProvide a thorough code review with actionable feedback and suggestions for improvement.`
  );

  return sections.join('\n');
}

/**
 * Build a code optimization prompt
 */
export function buildOptimizePrompt(code: string, options: OptimizePromptOptions): string {
  const sections: string[] = [];

  sections.push(`## Code Optimization Request`);
  sections.push(`Language: ${options.language}`);

  if (options.targets && options.targets.length > 0) {
    sections.push(`\n## Optimization Targets\n${options.targets.map((t) => `- ${t}`).join('\n')}`);
  }

  sections.push(`\n## Code to Optimize\n\`\`\`${options.language}\n${code}\n\`\`\``);

  sections.push(
    `\n## Instructions\noptimize the code while maintaining functionality. Explain each optimization made.`
  );

  return sections.join('\n');
}

/**
 * Build a documentation generation prompt
 */
export function buildDocumentPrompt(code: string, options: DocumentPromptOptions): string {
  const sections: string[] = [];

  sections.push(`## Documentation Request`);
  sections.push(`Language: ${options.language}`);

  if (options.style) {
    sections.push(`Style: ${options.style}`);
  }

  sections.push(`\n## Code to Document\n\`\`\`${options.language}\n${code}\n\`\`\``);

  sections.push(
    `\n## Instructions\ndocument the code with clear explanations of purpose, parameters, return values, and usage examples.`
  );

  return sections.join('\n');
}

/**
 * Build a code analysis prompt
 */
export function buildAnalyzePrompt(code: string, options: AnalyzePromptOptions): string {
  const sections: string[] = [];

  sections.push(`## Code Analysis Request`);
  sections.push(`Language: ${options.language}`);

  if (options.aspects && options.aspects.length > 0) {
    sections.push(`\n## Analysis Aspects\n${options.aspects.map((a) => `- ${a}`).join('\n')}`);
  }

  sections.push(`\n## Code to Analyze\n\`\`\`${options.language}\n${code}\n\`\`\``);

  sections.push(
    `\n## Instructions\nanalyze the code structure, patterns, and provide insights on code quality.`
  );

  return sections.join('\n');
}

/**
 * Build a Game Design Document (GDD) generation prompt from Q&A responses
 */
export function buildDesignDocumentPrompt(
  qaResponses: QAResponse[],
  referenceSystemIds?: ReferenceSystem[]
): string {
  const sections: string[] = [];

  sections.push(`## Game Design Document (GDD) Generation Request`);
  sections.push(`\n**IMPORTANT INSTRUCTIONS:**`);
  sections.push(`- Generate the Game Design Document IMMEDIATELY without asking any clarifying questions.`);
  sections.push(`- Do NOT use AskUserQuestion or any interactive tools.`);
  sections.push(`- If any information is unclear or incomplete, make reasonable assumptions and proceed.`);
  sections.push(`- Focus on generating a complete GDD based on the provided inputs.`);
  sections.push(`- This is a GAME DESIGN document, NOT a software development document.`);
  sections.push(`\nGenerate a comprehensive Game Design Document based on the following Q&A responses.`);

  // Add Q&A responses
  if (qaResponses.length > 0) {
    sections.push(`\n## Q&A Responses`);
    qaResponses.forEach((qa, index) => {
      sections.push(`\n### Q${index + 1}: ${qa.question}`);
      sections.push(`**Answer:** ${qa.answer}`);
    });
  }

  // Add reference systems if provided
  if (referenceSystemIds && referenceSystemIds.length > 0) {
    sections.push(`\n## Reference Systems`);
    referenceSystemIds.forEach((system) => {
      sections.push(`\n### ${system.name}`);
      sections.push(`ID: ${system.id}`);
      sections.push(`Description: ${system.description}`);
    });
  }

  sections.push(`\n## Output Format`);
  sections.push(`Generate the Game Design Document in markdown format with the following sections:`);
  sections.push(`\n### 1. Game Overview`);
  sections.push(`- Game Concept (핵심 컨셉)`);
  sections.push(`- Genre and Sub-genre (장르)`);
  sections.push(`- Core Experience (핵심 경험 - 플레이어가 느낄 감정/재미)`);
  sections.push(`- Unique Selling Points (차별화 요소)`);
  sections.push(`\n### 2. Core Gameplay Mechanics`);
  sections.push(`- Core Loop (핵심 게임 루프)`);
  sections.push(`- Player Actions (플레이어 조작/행동)`);
  sections.push(`- Win/Lose Conditions (승리/패배 조건)`);
  sections.push(`- Feedback Systems (피드백 시스템)`);
  sections.push(`\n### 3. Game Systems`);
  sections.push(`- Economy System (재화, 보상, 소비 구조)`);
  sections.push(`- Progression System (성장, 레벨업, 해금 구조)`);
  sections.push(`- Combat/Action System (전투/액션 시스템, 해당시)`);
  sections.push(`- Social System (소셜 기능, 해당시)`);
  sections.push(`\n### 4. Balance & Tuning`);
  sections.push(`- Numerical Balance (수치 밸런싱 기준)`);
  sections.push(`- Difficulty Curve (난이도 곡선)`);
  sections.push(`- Economy Balance (경제 밸런스)`);
  sections.push(`- Pacing (게임 진행 속도)`);
  sections.push(`\n### 5. Content Design`);
  sections.push(`- Content Structure (콘텐츠 구성)`);
  sections.push(`- Stage/Level Design (스테이지/레벨 설계)`);
  sections.push(`- Character/Unit Design (캐릭터/유닛 설계, 해당시)`);
  sections.push(`- Item/Equipment Design (아이템/장비 설계, 해당시)`);
  sections.push(`\n### 6. User Interface`);
  sections.push(`- HUD Design (HUD 구성)`);
  sections.push(`- Menu Flow (메뉴 흐름)`);
  sections.push(`- Key Screens (주요 화면 설계)`);
  sections.push(`- UX Principles (UX 원칙)`);
  sections.push(`\n### 7. Target Platform & Audience`);
  sections.push(`- Target Platform (타겟 플랫폼)`);
  sections.push(`- Target Audience (타겟 유저층)`);
  sections.push(`- Monetization Strategy (수익화 전략, 해당시)`);
  sections.push(`\n**Remember: Generate the Game Design Document directly. Do not ask questions.**`);

  return sections.join('\n');
}

/**
 * Project context for PRD generation
 */
export interface ProjectContext {
  /** Technology stack (e.g., React, Node.js, PostgreSQL) */
  techStack?: string[];
  /** Target architecture pattern (e.g., microservices, monolithic) */
  architecture?: string;
  /** Development constraints or requirements */
  constraints?: string[];
  /** Existing system integrations */
  integrations?: string[];
}

/**
 * Build a PRD (Product Requirements Document) generation prompt
 * PRD is a DEVELOPMENT SPECIFICATION document based on the Game Design Document
 */
export function buildPRDPrompt(gddContent: string, projectContext?: ProjectContext): string {
  const sections: string[] = [];

  sections.push(`## PRD (Development Specification) Generation Request`);
  sections.push(`\n**IMPORTANT INSTRUCTIONS:**`);
  sections.push(`- Generate the PRD IMMEDIATELY without asking any clarifying questions.`);
  sections.push(`- Do NOT use AskUserQuestion or any interactive tools.`);
  sections.push(`- If any information is unclear or incomplete, make reasonable assumptions and proceed.`);
  sections.push(`- This PRD is a DEVELOPMENT SPECIFICATION document for engineers to implement.`);
  sections.push(`- Extract implementation requirements from the Game Design Document.`);
  sections.push(`- Focus on technical implementation details, NOT game design concepts.`);
  sections.push(`\nGenerate a Development-focused PRD based on the following Game Design Document.`);

  // Add project context if provided
  if (projectContext) {
    sections.push(`\n## Project Technical Context`);
    if (projectContext.techStack && projectContext.techStack.length > 0) {
      sections.push(`\n### Technology Stack`);
      projectContext.techStack.forEach((tech) => {
        sections.push(`- ${tech}`);
      });
    }
    if (projectContext.architecture) {
      sections.push(`\n### Architecture Pattern`);
      sections.push(projectContext.architecture);
    }
    if (projectContext.constraints && projectContext.constraints.length > 0) {
      sections.push(`\n### Development Constraints`);
      projectContext.constraints.forEach((constraint) => {
        sections.push(`- ${constraint}`);
      });
    }
    if (projectContext.integrations && projectContext.integrations.length > 0) {
      sections.push(`\n### System Integrations`);
      projectContext.integrations.forEach((integration) => {
        sections.push(`- ${integration}`);
      });
    }
  }

  sections.push(`\n## Game Design Document (Source)`);
  sections.push(gddContent);

  sections.push(`\n## Output Format`);
  sections.push(`Generate the PRD in markdown format with the following sections:`);
  sections.push(`\n### 1. Executive Summary`);
  sections.push(`- Development objectives (개발 목표)`);
  sections.push(`- Scope and boundaries (범위 및 경계)`);
  sections.push(`- Key deliverables (주요 산출물)`);
  sections.push(`\n### 2. Technical Stack & Architecture`);
  sections.push(`- Frontend technology (프론트엔드 기술)`);
  sections.push(`- Backend technology (백엔드 기술)`);
  sections.push(`- Database selection (데이터베이스)`);
  sections.push(`- Infrastructure requirements (인프라 요구사항)`);
  sections.push(`\n### 3. System Architecture`);
  sections.push(`- High-level architecture diagram description (시스템 구조)`);
  sections.push(`- Component breakdown (컴포넌트 분해)`);
  sections.push(`- Data flow description (데이터 흐름)`);
  sections.push(`- External service integrations (외부 서비스 연동)`);
  sections.push(`\n### 4. API Design`);
  sections.push(`- API endpoints list (API 엔드포인트 목록)`);
  sections.push(`- Request/Response format (요청/응답 형식)`);
  sections.push(`- Authentication requirements (인증 요구사항)`);
  sections.push(`- Rate limiting and security (보안 요구사항)`);
  sections.push(`\n### 5. Database Schema`);
  sections.push(`- Entity definitions (엔티티 정의)`);
  sections.push(`- Relationships (관계)`);
  sections.push(`- Indexing strategy (인덱싱 전략)`);
  sections.push(`- Data migration considerations (마이그레이션 고려사항)`);
  sections.push(`\n### 6. Frontend Component Structure`);
  sections.push(`- Page/View hierarchy (페이지 구조)`);
  sections.push(`- Reusable component list (재사용 컴포넌트)`);
  sections.push(`- State management approach (상태 관리)`);
  sections.push(`- Routing structure (라우팅 구조)`);
  sections.push(`\n### 7. Implementation Requirements`);
  sections.push(`- Feature-by-feature requirements (기능별 구현 요구사항)`);
  sections.push(`- Priority order (우선순위)`);
  sections.push(`- Dependencies between features (기능간 의존성)`);
  sections.push(`- Estimated complexity (복잡도 추정)`);
  sections.push(`\n### 8. Acceptance Criteria`);
  sections.push(`- Functional acceptance criteria (기능적 검증 기준)`);
  sections.push(`- Performance criteria (성능 기준)`);
  sections.push(`- Security criteria (보안 기준)`);
  sections.push(`- User experience criteria (UX 기준)`);
  sections.push(`\n**Remember: Generate the PRD as a development specification. Do not ask questions.**`);

  return sections.join('\n');
}

/**
 * Build a prototype HTML generation prompt from PRD content
 */
export function buildPrototypePrompt(prdContent: string): string {
  const sections: string[] = [];

  sections.push(`## Prototype Generation Request`);
  sections.push(`\n**IMPORTANT INSTRUCTIONS:**`);
  sections.push(`- Generate the prototype IMMEDIATELY without asking any clarifying questions.`);
  sections.push(`- Do NOT use AskUserQuestion or any interactive tools.`);
  sections.push(`- If any information is unclear or incomplete, make reasonable assumptions and proceed.`);
  sections.push(`- Focus on generating a complete HTML prototype based on the provided PRD.`);
  sections.push(`\nGenerate an interactive HTML prototype based on the following PRD.`);

  sections.push(`\n## PRD Content`);
  sections.push(prdContent);

  sections.push(`\n## Output Format`);
  sections.push(`Generate a single HTML file that includes:`);
  sections.push(`- Complete HTML structure`);
  sections.push(`- Embedded CSS styles (preferably Tailwind CSS classes)`);
  sections.push(`- Interactive JavaScript for clickable elements`);
  sections.push(`- Functional navigation between views`);
  sections.push(`- Responsive design for mobile and desktop`);

  sections.push(`\n## Requirements`);
  sections.push(`- The prototype should be interactive and demonstrate the main user flows`);
  sections.push(`- Use modern CSS styling for a professional appearance`);
  sections.push(`- Include placeholder content that represents real data`);
  sections.push(`- Ensure all navigation elements are clickable and functional`);
  sections.push(`\n**Remember: Generate the prototype directly. Do not ask questions.**`);

  return sections.join('\n');
}

/**
 * Build a feature analysis prompt for keyword extraction
 */
export function buildFeatureAnalysisPrompt(featureList: string[]): string {
  const sections: string[] = [];

  sections.push(`## Feature Analysis Request`);
  sections.push(`\nAnalyze the following features and extract relevant keywords and categories.`);

  sections.push(`\n## Feature List`);
  if (featureList.length > 0) {
    featureList.forEach((feature, index) => {
      sections.push(`${index + 1}. ${feature}`);
    });
  } else {
    sections.push(`No features provided.`);
  }

  sections.push(`\n## Output Format`);
  sections.push(`Provide the analysis in JSON structured format with:`);
  sections.push(`- keywords: Array of extracted keywords from all features`);
  sections.push(`- categories: Object grouping features by category (core, enhancement, integration, etc.)`);
  sections.push(`- complexity: Estimated complexity for each feature (low, medium, high)`);
  sections.push(`- dependencies: Potential dependencies between features`);

  return sections.join('\n');
}

/**
 * Build a document modification prompt
 */
export function buildDocumentModifyPrompt(
  originalContent: string,
  modificationInstructions: string
): string {
  const sections: string[] = [];

  sections.push(`## Document Modification Request`);
  sections.push(`\nModify the following document according to the provided instructions.`);

  sections.push(`\n## Original Document`);
  sections.push(originalContent);

  sections.push(`\n## Modification Instructions`);
  sections.push(modificationInstructions || 'No specific instructions provided.');

  sections.push(`\n## Requirements`);
  sections.push(`- Preserve the overall structure and format of the document`);
  sections.push(`- Apply the requested modifications while maintaining consistency`);
  sections.push(`- Revise and update related sections as needed`);
  sections.push(`- Return the complete modified document`);

  return sections.join('\n');
}
