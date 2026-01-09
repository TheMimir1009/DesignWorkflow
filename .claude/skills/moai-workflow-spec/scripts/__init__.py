"""
SPEC Accelerator - Parallel SPEC Generation using Claude Agent SDK

This module provides parallel execution capabilities for the /moai:1-plan command,
reducing SPEC generation time by ~50% through concurrent document loading,
codebase exploration, and validation operations.
"""

__version__ = "1.0.0"
__author__ = "MoAI-ADK"

from .spec_accelerator import SPECAccelerator, AcceleratorResult

__all__ = ["SPECAccelerator", "AcceleratorResult"]
