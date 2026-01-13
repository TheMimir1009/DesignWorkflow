# SPEC-AGENT-001: Acceptance Criteria

## Overview

This document defines the acceptance criteria for the Agent Refactoring work. All scenarios must pass for the SPEC to be considered complete.

---

## Test Scenarios

### Scenario 1: 0-Project Command Execution

**Given**: The 0-project.md command file has been updated to use general-purpose with Project Manager role
**When**: User executes `/moai:0-project` command
**Then**:
- Command invokes general-purpose subagent successfully
- Project Manager role instructions are passed to agent
- Agent behavior matches original manager-project functionality
- No runtime errors occur
- All required skills load correctly

**Success Criteria:**
- Task() invocation uses "general-purpose" as subagent_type
- Agent receives Project Manager role instructions
- Project initialization workflow completes without errors
- User-facing behavior unchanged from original

### Scenario 2: 1-Plan Command Execution

**Given**: The 1-plan.md command file has been updated to use general-purpose with SPEC Expert role
**When**: User executes `/moai:1-plan "Feature description"` command
**Then**:
- Command invokes general-purpose subagent successfully
- SPEC Expert role instructions are passed to agent
- Agent behavior matches original manager-spec functionality
- No runtime errors occur
- SPEC documents are created correctly

**Success Criteria:**
- Task() invocation uses "general-purpose" as subagent_type
- Agent receives SPEC Expert role instructions
- SPEC creation workflow completes without errors
- EARS format documents generated correctly

### Scenario 3: Skill Loading Verification

**Given**: Command files use general-purpose subagent type
**When**: Commands execute with skill dependencies
**Then**:
- All specified skills load successfully
- Skills are accessible to general-purpose agent
- No skill loading errors occur
- Skill functionality works as expected

**Success Criteria:**
- moai-foundation-core loads correctly
- moai-workflow-project loads correctly
- moai-workflow-spec loads correctly
- All skill operations function properly

### Scenario 4: Agent File Preservation

**Given**: Custom agent definition files exist in .claude/agents/moai/
**When**: Refactoring is complete
**Then**:
- manager-project.md file still exists
- manager-spec.md file still exists
- Both files have deprecation notices
- Files contain mapping information to general-purpose

**Success Criteria:**
- No agent definition files are deleted
- Deprecation notices clearly state migration path
- Mapping to built-in types documented
- Historical reference preserved

### Scenario 5: Command File Reference Updates

**Given**: Command files previously referenced custom agent names
**When**: All references are updated
**Then**:
- No "manager-project" references remain in command files
- No "manager-spec" references remain in command files
- All references use "general-purpose" with role specification
- Update is consistent across all command files

**Success Criteria:**
- Grep search for "manager-project" in commands returns only deprecation notices
- Grep search for "manager-spec" in commands returns only deprecation notices
- All Task() invocations use "general-purpose"
- Role instructions are explicit and clear

---

## Edge Cases

### Edge Case 1: Concurrent Command Execution

**Given**: Multiple commands may execute simultaneously
**When**: /moai:0-project and /moai:1-plan run concurrently
**Then**:
- Each command correctly invokes general-purpose with its role
- No cross-contamination of role instructions
- Both commands complete successfully

**Success Criteria:**
- Role isolation maintained between concurrent executions
- No race conditions in agent delegation
- Independent command execution verified

### Edge Case 2: Error Handling

**Given**: Command execution may encounter errors
**When**: An error occurs during Task() invocation
**Then**:
- Error message clearly indicates the issue
- Error handling matches original behavior
- User receives actionable error information

**Success Criteria:**
- Error messages are clear and helpful
- Error conditions properly documented
- Recovery options available to users

### Edge Case 3: Skill Unavailability

**Given**: Some skills may not be available
**When**: A specified skill is missing
**Then**:
- Clear error message indicates which skill is missing
- Command fails gracefully
- User guidance provided for resolution

**Success Criteria:**
- Missing skill detection works correctly
- Error handling prevents silent failures
- User can diagnose and fix skill availability

---

## Quality Gate Criteria

### Code Quality

- [ ] All command file changes follow CLAUDE.md guidelines
- [ ] Role-based instructions are clear and comprehensive
- [ ] No hardcoded custom agent types remain
- [ ] Git commit messages clearly describe changes

### Documentation Quality

- [ ] Agent files have deprecation notices
- [ ] Mapping between custom and built-in types documented
- [ ] Comments explain role-based delegation pattern
- [ ] No misleading documentation remains

### Functional Quality

- [ ] /moai:0-project executes without errors
- [ ] /moai:1-plan executes without errors
- [ ] Skill loading works correctly
- [ ] Role-based behavior matches original intent

### User Experience

- [ ] No user-facing behavior changes
- [ ] Command interfaces remain consistent
- [ ] Error messages are clear and helpful
- [ ] Performance not degraded

---

## Definition of Done

The SPEC-AGENT-001 is considered complete when:

1. **Code Changes**
   - All command files use general-purpose subagent type
   - Role-based instructions explicitly specified
   - No custom agent references remain in active code

2. **Testing**
   - All test scenarios pass
   - Edge cases handled correctly
   - No regressions detected

3. **Documentation**
   - Agent files marked as deprecated
   - Mapping documented and clear
   - Comments explain changes

4. **Verification**
   - /moai:0-project workflow tested and working
   - /moai:1-plan workflow tested and working
   - Skills load correctly with general-purpose

5. **Quality Gates**
   - All quality gate criteria met
   - Code review completed
   - No outstanding issues

---

## Verification Methods

### Manual Testing

1. Execute `/moai:0-project` and verify project initialization
2. Execute `/moai:1-plan "Test feature"` and verify SPEC creation
3. Check agent files for deprecation notices
4. Search for any remaining custom agent references

### Automated Verification

1. Grep command files for "manager-project"
2. Grep command files for "manager-spec"
3. Verify all Task() invocations use "general-purpose"
4. Check for syntax errors in command files

### Code Review Checklist

- [ ] Command file changes are minimal and focused
- [ ] Role instructions are clear and consistent
- [ ] No unnecessary changes included
- [ ] Git history shows clear refactoring intent
- [ ] Backups created before changes

---

## Success Metrics

### Functional Metrics

- 100% of command files use built-in agent types
- 100% of Task() invocations succeed without errors
- 100% of role instructions are explicit

### Quality Metrics

- 0 runtime errors during command execution
- 0 regressions in user-facing behavior
- 100% documentation accuracy

### Performance Metrics

- Command execution time unchanged (±5%)
- No increased memory usage
- No degraded startup time
