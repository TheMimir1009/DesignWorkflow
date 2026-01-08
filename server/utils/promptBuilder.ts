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
 * Build a design document generation prompt from Q&A responses
 */
export function buildDesignDocumentPrompt(
  qaResponses: QAResponse[],
  referenceSystemIds?: ReferenceSystem[]
): string {
  const sections: string[] = [];

  sections.push(`## Design Document Generation Request`);
  sections.push(`\nGenerate a comprehensive design document based on the following Q&A responses.`);

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
  sections.push(`Generate the design document in markdown format with the following sections:`);
  sections.push(`- Project Overview`);
  sections.push(`- Goals and Objectives`);
  sections.push(`- Features and Requirements`);
  sections.push(`- Technical Architecture`);
  sections.push(`- User Interface Design`);
  sections.push(`- Data Model`);
  sections.push(`- Integration Points`);
  sections.push(`- Timeline and Milestones`);

  return sections.join('\n');
}

/**
 * Build a PRD (Product Requirements Document) generation prompt
 */
export function buildPRDPrompt(designDocContent: string): string {
  const sections: string[] = [];

  sections.push(`## PRD Generation Request`);
  sections.push(`\nGenerate a Product Requirements Document (PRD) based on the following design document.`);

  sections.push(`\n## Design Document Content`);
  sections.push(designDocContent);

  sections.push(`\n## Output Format`);
  sections.push(`Generate the PRD in markdown format with the following sections:`);
  sections.push(`- Executive Summary`);
  sections.push(`- Product Overview`);
  sections.push(`- User Stories`);
  sections.push(`- Functional Requirements`);
  sections.push(`- Non-Functional Requirements`);
  sections.push(`- Technical Requirements`);
  sections.push(`- Acceptance Criteria`);
  sections.push(`- Dependencies and Constraints`);
  sections.push(`- Success Metrics`);

  return sections.join('\n');
}

/**
 * Build a prototype HTML generation prompt from PRD content
 */
export function buildPrototypePrompt(prdContent: string): string {
  const sections: string[] = [];

  sections.push(`## Prototype Generation Request`);
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
