---
description: "Multi-LLM routing for cost-effective development workflows"
version: 1.0.0
last_updated: 2026-01-13
tags: [mashup, llm, routing, glm, claude]
domain: workflow
category: llm-configuration
---

# MoAI Mashup Mode Routing

Multi-LLM 라우팅을 위한 비용 최적화 워크플로우.

## LLM Mode Overview

| 모드 | Plan Phase | Run Phase | Sync Phase | 비용 |
|------|------------|-----------|------------|------|
| `claude-only` | Claude | Claude | Claude | 높음 |
| `mashup` | Claude (main) | GLM (worktree) | GLM (worktree) | 중간 |
| `glm-only` | GLM | GLM | GLM | 낮음 |

## Mashup Mode Workflow

```
PHASE 1: Plan (/moai:1-plan)
  Location: main branch
  Model: Claude (Opus/Sonnet)
  Why: 복잡한 SPEC 계획에는 Claude의 추론 능력 필요

PHASE 2: Run (/moai:2-run)
  Location: worktree (feature/SPEC-XXX)
  Model: GLM-4.7
  Why: 구현은 상대적으로 단순한 작업, GLM로 비용 절감

PHASE 3: Sync (/moai:3-sync)
  Location: worktree (feature/SPEC-XXX)
  Model: GLM-4.7
  Why: 문서 동기화도 단순 작업, GLM로 비용 절감
```

## Configuration Files

### llm.yaml Settings

```yaml
llm:
  mode: mashup  # claude-only, mashup, glm-only
  glm_env_var: GLM_API_TOKEN
  auto_worktree:
    enabled: true   # mashup 모드에서 권장
    copy_glm_config: true
```

### GLM Config Template

`.moai/llm-configs/glm.json`:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "${GLM_API_KEY}",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
  }
}
```

## Usage Patterns

### Command Routing Decision Tree

```
/moai:1-plan "task description"
  ├─ llm.mode == claude-only → Execute in main (Claude)
  ├─ llm.mode == mashup     → Execute in main (Claude)
  └─ llm.mode == glm-only   → Execute in main (GLM worktree)

/moai:2-run SPEC-XXX
  ├─ llm.mode == claude-only → Execute in current branch (Claude)
  ├─ llm.mode == mashup     → Create/enter worktree with GLM
  └─ llm.mode == glm-only   → Execute in current branch (GLM)

/moai:3-sync SPEC-XXX
  ├─ llm.mode == claude-only → Execute in current branch (Claude)
  ├─ llm.mode == mashup     → Use worktree with GLM
  └─ llm.mode == glm-only   → Execute in current branch (GLM)
```

## API Key Management

### GLM API Key Priority

1. `~/.moai/.env.glm` (최우선 - 사용자 명시적 설정)
2. `~/.moai/credentials.yaml` (레거시)
3. `GLM_API_KEY` 환경변수 (폴백)

### Setup Commands

```bash
# moai CLI로 설정 (권장)
moai glm <your-api-key>

# 또는 수동으로 파일 생성
mkdir -p ~/.moai
cat > ~/.moai/.env.glm << 'EOF'
GLM_API_KEY="your-api-key-here"
EOF
```

## Worktree Integration

### Automatic Worktree Creation

When `llm.auto_worktree.enabled == true`:

```bash
# /moai:2-run 실행 시 자동 생성
moai worktree create SPEC-XXX --glm

# worktree 구조
~/worktrees/DesignWorkflow/SPEC-XXX/
├── .claude/settings.local.json  # GLM env 포함
├── .moai/
│   └── llm-configs/glm.json
└── (project files)
```

### Manual Worktree Commands

```bash
# worktree 생성
moai worktree create SPEC-XXX --glm

# worktree 목록
moai worktree list

# worktree 전환
cd ~/worktrees/DesignWorkflow/SPEC-XXX

# worktree 삭제
moai worktree remove SPEC-XXX
```

## Backend Switching

### Manual Backend Switch

```bash
# GLM로 전환
moai glm

# Claude로 전환
moai claude

# 현재 백엔드 확인
moai status
```

### Settings Modification

`.claude/settings.local.json`:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "glm-api-key",
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
  }
}
```

## Cost Comparison

### Claude Pricing (2025)

| Model | Input | Output |
|-------|-------|--------|
| Opus | $15/MTok | $75/MTok |
| Sonnet | $3/MTok | $15/MTok |
| Haiku | $0.80/MTok | $4/MTok |

### GLM Pricing (Z.ai)

| Model | Input | Output |
|-------|-------|--------|
| GLM-4.7 | ~$0.50/MTok | ~$0.50/MTok |

### Estimated Savings

Mashup mode (Claude Plan + GLM Run/Sync):
- Plan 단계: Claude Sonnet (~5% of tokens)
- Run 단계: GLM-4.7 (~70% of tokens)
- Sync 단계: GLM-4.7 (~25% of tokens)

**Estimated cost reduction: ~85%**

## Troubleshooting

### GLM Connection Failed

```bash
# API 키 확인
cat ~/.moai/.env.glm

# 테스트
curl -X POST https://api.z.ai/api/anthropic/v1/messages \
  -H "x-api-key: $GLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '...'
```

### Worktree Not Using GLM

```bash
# settings.local.json 확인
cat .claude/settings.local.json | grep BASE_URL

# 수동으로 GLM 설정 복사
moai glm
```

### Mode Not Applied

```bash
# llm.yaml 확인
cat .moai/config/sections/llm.yaml | grep mode

# 캐시 삭제
rm -rf .claude/__pycache__
```

## References

- moai-adk CLI: `~/.local/share/uv/tools/moai-adk/`
- Model Allocator: `moai_adk/core/model_allocator.py`
- Credentials: `moai_adk/core/credentials.py`
- Switch Command: `moai_adk/cli/commands/switch.py`
