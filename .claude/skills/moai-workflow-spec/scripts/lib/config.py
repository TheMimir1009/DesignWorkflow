"""
SDK Configuration Management for SPEC Accelerator

Handles configuration loading, validation, and defaults for the
Claude Agent SDK integration with /moai:1-plan command.
"""

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Dict, Any, List

# Optional yaml support
try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False


@dataclass
class SDKConfig:
    """Configuration for Claude Agent SDK integration."""

    # Project paths
    project_root: Path = field(default_factory=lambda: Path.cwd())
    moai_config_path: str = ".moai/config/config.yaml"
    project_docs_path: str = ".moai/project"
    specs_path: str = ".moai/specs"

    # SDK settings
    default_model: str = "sonnet"
    timeout_seconds: float = 60.0
    max_retries: int = 3

    # Parallel execution settings
    max_concurrent_tasks: int = 4
    enable_fallback: bool = True

    # Document loading settings
    document_files: List[str] = field(default_factory=lambda: [
        "product.md",
        "structure.md",
        "tech.md"
    ])

    # Codebase exploration settings
    exploration_patterns: Dict[str, str] = field(default_factory=lambda: {
        "specs": ".moai/specs/**/*.md",
        "source": "src/**/*.{ts,tsx,py,js,jsx}",
        "config": "*.{json,yaml,yml,toml}"
    })

    @classmethod
    def load_from_project(cls, project_root: Optional[Path] = None) -> "SDKConfig":
        """Load configuration from project root."""
        root = project_root or Path.cwd()
        config = cls(project_root=root)

        # Try to load MoAI config
        config_file = root / config.moai_config_path
        if config_file.exists() and YAML_AVAILABLE:
            try:
                with open(config_file, "r", encoding="utf-8") as f:
                    moai_config = yaml.safe_load(f)
                    config._apply_moai_config(moai_config)
            except Exception:
                pass  # Use defaults if config loading fails

        # Also try JSON config if YAML not available
        json_config_file = root / ".moai/config/config.json"
        if json_config_file.exists():
            try:
                with open(json_config_file, "r", encoding="utf-8") as f:
                    moai_config = json.load(f)
                    config._apply_moai_config(moai_config)
            except Exception:
                pass

        # Apply environment overrides
        config._apply_env_overrides()

        return config

    def _apply_moai_config(self, moai_config: Dict[str, Any]) -> None:
        """Apply settings from MoAI config file."""
        if not moai_config:
            return

        # SDK specific settings
        sdk_config = moai_config.get("spec_accelerator", {})
        if sdk_config:
            self.timeout_seconds = sdk_config.get("timeout", self.timeout_seconds)
            self.max_retries = sdk_config.get("max_retries", self.max_retries)
            self.max_concurrent_tasks = sdk_config.get("max_concurrent", self.max_concurrent_tasks)
            self.enable_fallback = sdk_config.get("enable_fallback", self.enable_fallback)

    def _apply_env_overrides(self) -> None:
        """Apply environment variable overrides."""
        env_mappings = {
            "SPEC_ACCELERATOR_TIMEOUT": ("timeout_seconds", float),
            "SPEC_ACCELERATOR_MAX_RETRIES": ("max_retries", int),
            "SPEC_ACCELERATOR_MAX_CONCURRENT": ("max_concurrent_tasks", int),
            "SPEC_ACCELERATOR_FALLBACK": ("enable_fallback", lambda x: x.lower() == "true"),
        }

        for env_key, (attr, converter) in env_mappings.items():
            env_value = os.environ.get(env_key)
            if env_value:
                try:
                    setattr(self, attr, converter(env_value))
                except (ValueError, TypeError):
                    pass  # Keep default if conversion fails

    def get_document_path(self, doc_name: str) -> Path:
        """Get full path for a project document."""
        return self.project_root / self.project_docs_path / doc_name

    def get_specs_dir(self) -> Path:
        """Get the SPEC documents directory."""
        return self.project_root / self.specs_path

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary for serialization."""
        return {
            "project_root": str(self.project_root),
            "moai_config_path": self.moai_config_path,
            "project_docs_path": self.project_docs_path,
            "specs_path": self.specs_path,
            "default_model": self.default_model,
            "timeout_seconds": self.timeout_seconds,
            "max_retries": self.max_retries,
            "max_concurrent_tasks": self.max_concurrent_tasks,
            "enable_fallback": self.enable_fallback,
            "document_files": self.document_files,
            "exploration_patterns": self.exploration_patterns
        }


def get_default_config() -> SDKConfig:
    """Get default configuration instance."""
    return SDKConfig.load_from_project()
