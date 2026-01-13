---
id: SPEC-AGENT-001
version: "1.0.0"
status: "draft"
created: "2026-01-11"
updated: "2026-01-11"
author: "mimir"
priority: "MEDIUM"
---

# SPEC-AGENT-001: Claude Code Agent Integration Refactoring

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-11 | mimir | Initial SPEC creation |

---

## TAG BLOCK

```yaml
spec_id: SPEC-AGENT-001
title: Claude Code Agent Integration Refactoring
status: draft
priority: MEDIUM
created: 2026-01-11
updated: 2026-01-11
lifecycle: spec-anchored
dependencies: []
blocks:
  - Custom agent type recognition in Task() tool
  - Agent definition file structure
related_specs: []
```

---

## Environment

### Project Context

- **Project**: DesignWorkflow (AI Workflow Kanban)
- **Domain**: MoAI-ADK Framework Customization
- **Current Progress**: Custom agents defined but not recognized by Claude Code
- **Target Users**: MoAI-ADK framework developers and users

### Technical Environment

- **Frontend**: React 19.2, TypeScript 5.9, Tailwind CSS 4, Zustand
- **Backend**: Node.js 20.x LTS, Express 5.x
- **Agent Definition**: `.claude/agents/moai/*.md`
- **Command Files**: `.claude/commands/moai/*.md`
- **Existing Custom Agents**: manager-project, manager-spec (not recognized by Task())

### Integration Points

- **Task() Tool**: Claude Code's agent invocation mechanism
- **0-project Command**: Project initialization workflow
- **1-plan Command**: SPEC creation workflow
- **Agent Definitions**: Custom agent metadata and behavior specifications

---

## Assumptions

### Technical Assumptions

| Assumption | Confidence | Risk if Wrong | Validation Method |
|------------|------------|---------------|-------------------|
| Task() only supports built-in subagent types | High | Refactoring requires different approach | Test Task() with custom agent names |
| general-purpose can replace custom agents | Medium | Reduced specialization | Verify role-based behavior |
| Agent definitions in .claude/agents/ are valid | High | Structure validation needed | Review agent file format |
| Commands reference custom agents correctly | High | Command updates needed | Audit command files |

### Business Assumptions

| Assumption | Confidence | Risk if Wrong | Validation Method |
|------------|------------|---------------|-------------------|
| Users need manager-project and manager-spec functionality | High | Feature regression | Review workflow requirements |
| Role-based instructions maintain agent specialization | Medium | Behavior inconsistency | Test role-based delegation |
| Custom agents provide value over built-in types | High | Unnecessary complexity | Compare capabilities |

---

## Requirements

### Functional Requirements

#### FR-1: Agent Type Recognition (Ubiquitous)

- **FR-1.1**: The system shall only use Claude Code Task() built-in subagent types for agent invocation
- **FR-1.2**: The system shall map custom agent names (manager-project, manager-spec) to built-in types (general-purpose)
- **FR-1.3**: The system shall preserve role-based instructions through explicit role definitions in command files

#### FR-2: Command File Updates (Event-Driven)

- **FR-2.1**: WHEN commands reference manager-project THEN the system shall use general-purpose with Project Manager role
- **FR-2.2**: WHEN commands reference manager-spec THEN the system shall use general-purpose with SPEC Expert role
- **FR-2.3**: WHEN agent delegation occurs THEN the system shall pass role-based instructions explicitly

#### FR-3: Agent Definition Handling (State-Driven)

- **FR-3.1**: IF custom agent files exist in .claude/agents/moai/ THEN the system shall preserve them for documentation purposes
- **FR-3.2**: IF custom agents are deprecated THEN the system shall add deprecation notice to agent files
- **FR-3.3**: IF new agent patterns emerge THEN the system shall use role-based general-purpose delegation

#### FR-4: Role-Based Specialization (Event-Driven)

- **FR-4.1**: WHEN using general-purpose for project management THEN the system shall include Project Manager role instructions
- **FR-4.2**: WHEN using general-purpose for SPEC creation THEN the system shall include SPEC Expert role instructions
- **FR-4.3**: WHEN role is specified THEN the system shall ensure agent behavior matches original custom agent intent

### Non-Functional Requirements

#### NFR-1: Compatibility

- **NFR-1.1**: Command files shall work with Claude Code current version without breaking changes
- **NFR-1.2**: Existing workflows shall remain functional after refactoring
- **NFR-1.3**: No runtime errors shall occur during Task() invocations

#### NFR-2: Maintainability

- **NFR-2.1**: Role-based instructions shall be clearly documented in command files
- **NFR-2.2**: Agent definitions shall be updated with deprecation notices
- **NFR-2.3**: Changes shall be traceable through git history

#### NFR-3: Clarity

- **NFR-3.1**: Command file intent shall be explicit through role descriptions
- **NFR-3.2**: Delegation patterns shall follow CLAUDE.md guidelines
- **NFR-3.3**: Agent type mapping shall be transparent to users

### Unwanted Requirements

- **UW-1**: The system shall not break existing MoAI-ADK workflows
- **UW-2**: The system shall not remove custom agent definition files (preserve for reference)
- **UW-3**: The system shall not introduce new custom agent types that Task() cannot recognize
- **UW-4**: The system shall not change the user-facing behavior of commands

### Optional Requirements

- **OPT-1**: Where possible, document the mapping between custom agents and built-in types
- **OPT-2**: Where possible, provide migration guide for future custom agent patterns
- **OPT-3**: Where possible, add inline comments explaining role-based delegation

---

## Specifications

### Agent Type Mapping

```typescript
// Custom agent to built-in type mapping
interface AgentMapping {
  customAgent: string;
  builtInType: string;
  role: string;
  description: string;
}

const AGENT_MAPPINGS: AgentMapping[] = [
  {
    customAgent: "manager-project",
    builtInType: "general-purpose",
    role: "Project Manager",
    description: "Project initialization and setup specialist"
  },
  {
    customAgent: "manager-spec",
    builtInType: "general-purpose",
    role: "SPEC Expert",
    description: "EARS format SPEC document creation specialist"
  }
];
```

### Command File Updates

**Before (Custom Agent Reference):**
```markdown
Use the manager-project subagent to handle project setup.
```

**After (Built-in with Role):**
```markdown
Use the general-purpose subagent with Project Manager role to handle project setup.
```

### Component Architecture

```
.claude/
├── agents/moai/
│   ├── manager-project.md    # Preserved with deprecation notice
│   └── manager-spec.md       # Preserved with deprecation notice
├── commands/moai/
│   ├── 0-project.md          # Updated to use general-purpose
│   └── 1-plan.md             # Updated to use general-purpose
└── skills/moai-workflow-*/   # No changes required
```

### Task() Built-in Subagent Types

Based on Claude Code documentation, available subagent types are:

| Subagent Type | Purpose | Use Case |
|--------------|---------|----------|
| general-purpose | All-purpose agent with full tool access | Default for most tasks |
| expert-backend | Backend development specialist | API, database, server-side logic |
| expert-frontend | Frontend development specialist | UI components, client-side features |
| Explore | Codebase exploration and file discovery | Project analysis and file finding |

### Delegation Pattern

```typescript
// Role-based delegation pattern
interface RoleBasedDelegation {
  agentType: "general-purpose";  // Always use built-in type
  role: string;                  // Specify specialization role
  instructions: string;          // Role-specific behavior guidance
}

// Example for project initialization
const projectSetup: RoleBasedDelegation = {
  agentType: "general-purpose",
  role: "Project Manager",
  instructions: "Act as Project Manager for project initialization..."
};

// Example for SPEC creation
const specCreation: RoleBasedDelegation = {
  agentType: "general-purpose",
  role: "SPEC Expert",
  instructions: "Act as SPEC Expert for EARS format document creation..."
};
```

---

## Traceability

| Requirement | Test Case | Component | Command File |
|-------------|-----------|-----------|--------------|
| FR-1.1 | TC-BUILTIN-001 | 0-project.md | /moai:0-project |
| FR-1.2 | TC-MAPPING-001 | 0-project.md, 1-plan.md | /moai:0-project, /moai:1-plan |
| FR-2.1 | TC-PROJECT-ROLE-001 | 0-project.md | /moai:0-project |
| FR-2.2 | TC-SPEC-ROLE-001 | 1-plan.md | /moai:1-plan |
| FR-3.1 | TC-PRESERVE-001 | manager-project.md, manager-spec.md | N/A |
| FR-4.1 | TC-ROLE-BEHAVIOR-001 | 0-project.md | /moai:0-project |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Role-based behavior differs from custom agent | Medium | Medium | Thorough testing of command workflows |
| Users confused by agent name changes | Low | Low | Documentation and clear commit messages |
| Future Claude Code updates add custom agent support | Low | Low | Preserved agent files enable easy reversion |
| Skill loading affected by agent type change | Low | Medium | Verify skill loading with general-purpose |

---

## Expert Consultation Recommendations

### Foundation Expert (moai-foundation-core)

- Agent delegation pattern verification
- CLAUDE.md compliance review
- Task() tool usage validation

### Workflow Expert (moai-workflow-project)

- Command file update patterns
- Role-based instruction format
- Workflow preservation guarantees

---

## Constitution Alignment

### Technology Stack Verification

- Frontend: React 19, TypeScript 5.9 (Aligned - no changes)
- Backend: Node.js 20.x, Express 5.x (Aligned - no changes)
- Agent System: Claude Code built-in types (Aligned - refactoring only)

### Naming Conventions

- Agent types: kebab-case (general-purpose, expert-backend, expert-frontend)
- Role names: Title Case (Project Manager, SPEC Expert)
- Command files: kebab-case with numbered prefix (0-project.md, 1-plan.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-11 | mimir | Initial SPEC creation for agent refactoring |
