"""
Subagent Definitions for SPEC Accelerator

Defines specialized subagents for parallel execution of SPEC generation tasks.
Each subagent has a focused responsibility and limited tool access.

Subagent Types:
- document-loader: Fast document loading with minimal processing
- codebase-explorer: Pattern and dependency analysis
- constraint-extractor: Technical constraint identification
- validator: SPEC quality validation
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


@dataclass
class SubagentDefinition:
    """Definition for a specialized subagent."""

    name: str
    description: str
    prompt_template: str
    tools: List[str]
    model: str = "sonnet"
    timeout_seconds: float = 30.0

    def get_prompt(self, **kwargs) -> str:
        """Generate prompt with context."""
        return self.prompt_template.format(**kwargs)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for SDK usage."""
        return {
            "name": self.name,
            "description": self.description,
            "tools": self.tools,
            "model": self.model
        }


# Document Loader Subagent
DOCUMENT_LOADER = SubagentDefinition(
    name="document-loader",
    description="Loads and parses project documents (product.md, structure.md, tech.md). "
                "Optimized for fast parallel document retrieval.",
    prompt_template="""You are a document loading specialist.

Task: Load and extract key information from: {document_path}

Instructions:
1. Read the file content completely
2. Extract key sections and their content
3. Identify metadata (title, version, dates)
4. Note any dependencies or references to other documents
5. Return structured JSON output

Output Format:
{{
    "filename": "string",
    "title": "string",
    "sections": [
        {{"name": "string", "content": "string", "line_count": number}}
    ],
    "metadata": {{}},
    "references": ["string"],
    "word_count": number
}}

Be concise and accurate. Return valid JSON only.""",
    tools=["Read"],
    model="haiku",  # Fast model for simple loading
    timeout_seconds=15.0
)


# Codebase Explorer Subagent
CODEBASE_EXPLORER = SubagentDefinition(
    name="codebase-explorer",
    description="Explores codebase for patterns, existing SPECs, and dependencies. "
                "Supports parallel pattern analysis for comprehensive discovery.",
    prompt_template="""You are a codebase exploration specialist.

Task: Analyze the codebase for: {query}
Project Root: {project_root}

Instructions:
1. Search for existing SPEC documents in .moai/specs/
2. Find implementation patterns related to the query
3. Identify file dependencies and relationships
4. Detect technology stack indicators
5. Note naming conventions and architectural patterns

Focus Areas:
- Existing SPECs with similar scope
- Related source files
- Configuration patterns
- Test file locations

Output Format:
{{
    "existing_specs": [
        {{"id": "string", "title": "string", "status": "string"}}
    ],
    "related_files": [
        {{"path": "string", "relevance": "high|medium|low", "reason": "string"}}
    ],
    "patterns": [
        {{"type": "string", "description": "string", "files": ["string"]}}
    ],
    "dependencies": [
        {{"name": "string", "version": "string", "usage": "string"}}
    ]
}}

Return valid JSON only. Be thorough but concise.""",
    tools=["Read", "Glob", "Grep"],
    model="sonnet",
    timeout_seconds=30.0
)


# Constraint Extractor Subagent
CONSTRAINT_EXTRACTOR = SubagentDefinition(
    name="constraint-extractor",
    description="Extracts technical constraints from documentation and code. "
                "Specializes in identifying performance, security, and compatibility requirements.",
    prompt_template="""You are a technical constraint extraction specialist.

Task: Extract {constraint_type} constraints from project context.
Context: {context}

Categories to analyze:
- Performance: Response time, throughput, latency requirements
- Security: Authentication, authorization, encryption needs
- Compatibility: Browser, device, API version requirements
- Scalability: Concurrent users, data volume, growth expectations

Instructions:
1. Scan provided context for explicit constraints
2. Identify implicit requirements from patterns
3. Rate confidence level for each constraint
4. Note any conflicts or ambiguities

Output Format:
{{
    "constraint_type": "{constraint_type}",
    "constraints": [
        {{
            "requirement": "string",
            "source": "string",
            "confidence": "high|medium|low",
            "priority": "required|preferred|optional"
        }}
    ],
    "conflicts": ["string"],
    "notes": "string"
}}

Return valid JSON only.""",
    tools=["Read", "Grep"],
    model="sonnet",
    timeout_seconds=20.0
)


# Validator Subagent
VALIDATOR = SubagentDefinition(
    name="validator",
    description="Validates SPEC content against quality criteria. "
                "Performs EARS syntax, completeness, and consistency checks.",
    prompt_template="""You are a SPEC validation specialist.

Task: Validate {validation_type} for SPEC content.
Content: {content}

Validation Criteria:

EARS Syntax (if applicable):
- Ubiquitous: "The [system] shall [response]"
- Event-driven: "When [event], the [system] shall [response]"
- State-driven: "While [condition], the [system] shall [response]"
- Optional: "Where [feature], the [system] shall [response]"
- Unwanted: "If [undesired], then the [system] shall [response]"

Completeness:
- Required sections present
- Acceptance criteria defined
- Dependencies identified

Consistency:
- No contradicting requirements
- Aligned with project standards
- Proper terminology usage

Output Format:
{{
    "validation_type": "{validation_type}",
    "passed": boolean,
    "score": number,
    "issues": [
        {{
            "severity": "error|warning|info",
            "location": "string",
            "message": "string",
            "suggestion": "string"
        }}
    ],
    "summary": "string"
}}

Return valid JSON only.""",
    tools=["Read"],
    model="sonnet",
    timeout_seconds=20.0
)


# Agent Registry for dynamic lookup
AGENT_REGISTRY: Dict[str, SubagentDefinition] = {
    "document-loader": DOCUMENT_LOADER,
    "codebase-explorer": CODEBASE_EXPLORER,
    "constraint-extractor": CONSTRAINT_EXTRACTOR,
    "validator": VALIDATOR
}


def get_agent(agent_type: str) -> Optional[SubagentDefinition]:
    """Get subagent definition by type."""
    return AGENT_REGISTRY.get(agent_type)


def list_agents() -> List[str]:
    """List all available agent types."""
    return list(AGENT_REGISTRY.keys())
