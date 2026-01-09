"""
SPEC Accelerator Library Modules

Contains reusable components for parallel SPEC generation:
- config: SDK configuration management
- operations: Parallelizable atomic operations
- subagent_definitions: Specialized subagent configurations
- result_aggregator: Result merging and consolidation
"""

from .config import SDKConfig
from .operations import (
    ParallelDocumentLoader,
    ParallelCodebaseExplorer,
    ParallelConstraintExtractor,
    ParallelValidator,
    OperationResult
)
from .subagent_definitions import AGENT_REGISTRY
from .result_aggregator import ResultAggregator

__all__ = [
    "SDKConfig",
    "ParallelDocumentLoader",
    "ParallelCodebaseExplorer",
    "ParallelConstraintExtractor",
    "ParallelValidator",
    "OperationResult",
    "AGENT_REGISTRY",
    "ResultAggregator"
]
