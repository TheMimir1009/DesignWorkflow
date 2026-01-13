# SPEC-AGENT-001: Implementation Plan

## Overview

This document outlines the implementation plan for refactoring MoAI-ADK custom agent integration to use Claude Code's built-in Task() subagent types.

---

## Task Decomposition

### Phase 1: Analysis and Verification

**Priority: HIGH**

1. Verify Claude Code Task() subagent types
   - Confirm available built-in types
   - Document general-purpose capabilities
   - Verify skill loading compatibility

2. Audit current agent usage
   - Scan all command files for manager-project references
   - Scan all command files for manager-spec references
   - Document current delegation patterns

3. Backup existing configuration
   - Create backup of .claude/commands/moai/
   - Create backup of .claude/agents/moai/
   - Verify backup integrity

### Phase 2: Command File Updates

**Priority: HIGH**

1. Update 0-project.md command file
   - Replace "manager-project" with "general-purpose"
   - Add explicit "Project Manager" role instructions
   - Update delegation pattern descriptions
   - Verify all references updated

2. Update 1-plan.md command file
   - Replace "manager-spec" with "general-purpose"
   - Add explicit "SPEC Expert" role instructions
   - Update delegation pattern descriptions
   - Verify all references updated

3. Update other command files (if applicable)
   - Scan for any other custom agent references
   - Apply same pattern if found
   - Document all changes made

### Phase 3: Agent Definition Preservation

**Priority: MEDIUM**

1. Add deprecation notices to agent files
   - manager-project.md: Add deprecation header
   - manager-spec.md: Add deprecation header
   - Document migration to general-purpose

2. Create mapping documentation
   - Document agent type mapping
   - Add inline comments explaining changes
   - Create reference for future maintenance

### Phase 4: Testing and Validation

**Priority: HIGH**

1. Functional testing
   - Test /moai:0-project command execution
   - Test /moai:1-plan command execution
   - Verify skill loading works correctly
   - Confirm role-based behavior

2. Regression testing
   - Verify existing workflows unchanged
   - Check no runtime errors occur
   - Validate user-facing behavior

3. Documentation verification
   - Verify CLAUDE.md still accurate
   - Check skill documentation compatibility
   - Confirm user guides still valid

---

## Technical Approach

### Agent Delegation Pattern

**Before Refactoring:**
```
Command -> Task(subagent_type="manager-project")
```

**After Refactoring:**
```
Command -> Task(subagent_type="general-purpose") with role="Project Manager"
```

### Role-Based Instruction Format

```markdown
Use the general-purpose subagent with [Role Name] role to [task description].

Role: [Role Name]
- Specialization: [Area of expertise]
- Responsibilities: [Key responsibilities]
- Expected Behavior: [Behavioral guidance]
```

### Command File Update Template

```markdown
## Associated Agents and Skills

**Associated Agent:**
- general-purpose (acting as [Role Name]) orchestrates [workflow description]

**Associated Skills:**
- Skill1: [Description]
- Skill2: [Description]
```

---

## Resource Requirements

### Files to Modify

- `.claude/commands/moai/0-project.md` - Command file updates
- `.claude/commands/moai/1-plan.md` - Command file updates

### Files to Preserve

- `.claude/agents/moai/manager-project.md` - Add deprecation notice
- `.claude/agents/moai/manager-spec.md` - Add deprecation notice

### Skills (No Changes Required)

- moai-foundation-core
- moai-workflow-project
- moai-workflow-spec
- moai-foundation-claude

---

## Risk Analysis and Mitigation

### Risk 1: Role-Based Behavior Inconsistency

**Probability:** Medium
**Impact:** Medium

**Mitigation:**
- Thoroughly test each command after updates
- Verify role instructions are clear and comprehensive
- Compare behavior before/after refactoring

**Recovery Plan:**
- Revert from backups if behavior differs significantly
- Refine role instructions until behavior matches

### Risk 2: Skill Loading Issues

**Probability:** Low
**Impact:** Medium

**Mitigation:**
- Verify skills are specified in command files
- Test skill loading with general-purpose agent
- Confirm all required skills are accessible

**Recovery Plan:**
- Adjust skill specification format if needed
- Consult Claude Code documentation for correct syntax

### Risk 3: Workflow Regression

**Probability:** Low
**Impact:** High

**Mitigation:**
- Create comprehensive backups before changes
- Test all command workflows end-to-end
- Maintain list of test scenarios

**Recovery Plan:**
- Use git revert if needed
- Restore from backup files
- Document any issues for future reference

---

## Success Criteria

### Functional Requirements

- All command files use built-in subagent types
- Role-based instructions preserve agent specialization
- No runtime errors during Task() invocations
- Existing workflows function identically

### Quality Requirements

- Code changes follow CLAUDE.md guidelines
- Documentation accurately reflects changes
- Git history clearly shows refactoring intent
- No merge conflicts or file corruption

### Verification Requirements

- /moai:0-project executes successfully
- /moai:1-plan executes successfully
- All skills load correctly with general-purpose
- Role-based behavior matches original intent

---

## Milestones

### Milestone 1: Planning Complete
- Analysis finished
- Approach documented
- Backups created

### Milestone 2: Commands Updated
- 0-project.md refactored
- 1-plan.md refactored
- All references updated

### Milestone 3: Documentation Complete
- Agent files deprecated
- Mapping documented
- Comments added

### Milestone 4: Testing Complete
- Functional tests pass
- Regression tests pass
- Documentation verified

---

## Dependencies

### External Dependencies

- Claude Code version compatibility
- Task() tool behavior documentation
- Built-in subagent type specifications

### Internal Dependencies

- CLAUDE.md delegation guidelines
- Skill loading mechanisms
- Command file structure requirements

---

## Notes

### Implementation Priority

1. HIGH: Update command files to use general-purpose
2. HIGH: Test command execution
3. MEDIUM: Add deprecation notices to agent files
4. MEDIUM: Create documentation

### Rollback Strategy

If issues occur:
1. Git revert command file changes
2. Restore agent files from backup
3. Document issue for investigation
4. Consider alternative approaches

### Future Considerations

- Monitor Claude Code updates for custom agent support
- Evaluate if built-in types expand to match custom needs
- Consider agent abstraction layer if patterns emerge
