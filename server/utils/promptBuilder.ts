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
