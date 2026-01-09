#!/usr/bin/env python3
"""
SPEC Accelerator - Parallel SPEC Generation using Claude Agent SDK

Accelerates /moai:1-plan execution by parallelizing independent operations:
1. Project document loading (product.md, structure.md, tech.md)
2. Codebase exploration (SPEC scan, pattern analysis, dependency check)
3. Constraint extraction (performance, security, compatibility, scalability)
4. Validation operations (EARS, completeness, structure, tags)

Expected Performance Improvement: ~50% reduction in SPEC generation time

Usage:
    # Load project documents in parallel
    python spec_accelerator.py --phase document-loading --project-root /path/to/project

    # Explore codebase for related patterns
    python spec_accelerator.py --phase codebase-exploration --query "user authentication"

    # Extract constraints from context
    python spec_accelerator.py --phase constraint-extraction --context '{"feature": "auth"}'

    # Run full accelerated pipeline
    python spec_accelerator.py --phase full --spec-title "Payment System"

    # Output as text instead of JSON
    python spec_accelerator.py --phase document-loading --output text

Environment Variables:
    SPEC_ACCELERATOR_TIMEOUT - Timeout in seconds (default: 60)
    SPEC_ACCELERATOR_MAX_CONCURRENT - Max concurrent tasks (default: 4)
    SPEC_ACCELERATOR_FALLBACK - Enable fallback to sequential (default: true)

Exit Codes:
    0 - Success (all operations completed)
    1 - Partial success (some operations failed but results usable)
    2 - Failure (critical operations failed)

Author: MoAI-ADK
Version: 1.0.0
"""

import argparse
import asyncio
import json
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional

# Add lib to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from lib.config import SDKConfig
from lib.operations import (
    AcceleratorResult,
    ParallelDocumentLoader,
    ParallelCodebaseExplorer,
    ParallelConstraintExtractor,
    ParallelValidator,
    FallbackManager
)
from lib.result_aggregator import ResultAggregator


class SPECAccelerator:
    """
    Main orchestrator for parallel SPEC generation.

    Coordinates parallel execution of independent operations to accelerate
    the SPEC creation process in /moai:1-plan command.
    """

    def __init__(self, project_root: Path, config: Optional[SDKConfig] = None):
        """
        Initialize the SPEC Accelerator.

        Args:
            project_root: Root directory of the project
            config: Optional SDK configuration (loads from project if not provided)
        """
        self.project_root = project_root.resolve()
        self.config = config or SDKConfig.load_from_project(project_root)
        self.aggregator = ResultAggregator()
        self.fallback = FallbackManager(
            max_retries=self.config.max_retries,
            timeout_seconds=self.config.timeout_seconds
        )

    async def run_phase(self, phase: str, **kwargs) -> AcceleratorResult:
        """
        Run a specific acceleration phase.

        Args:
            phase: Phase name ('document-loading', 'codebase-exploration',
                   'constraint-extraction', 'validation', 'full')
            **kwargs: Phase-specific arguments

        Returns:
            AcceleratorResult with phase execution results
        """
        phase_handlers = {
            "document-loading": self._run_document_loading,
            "codebase-exploration": self._run_codebase_exploration,
            "constraint-extraction": self._run_constraint_extraction,
            "validation": self._run_validation,
            "full": self._run_full_pipeline
        }

        handler = phase_handlers.get(phase)
        if not handler:
            return AcceleratorResult(
                success=False,
                phase=phase,
                data={},
                execution_time_seconds=0,
                parallel_tasks_count=0,
                errors=[f"Unknown phase: {phase}. Valid phases: {', '.join(phase_handlers.keys())}"]
            )

        return await handler(**kwargs)

    async def _run_document_loading(self, **kwargs) -> AcceleratorResult:
        """
        Parallel loading of project documents.

        Loads product.md, structure.md, tech.md simultaneously.
        Expected improvement: ~67% time reduction (3 sequential reads -> 1 parallel batch)
        """
        loader = ParallelDocumentLoader(self.project_root)
        return await loader.execute()

    async def _run_codebase_exploration(self, query: str = "", **kwargs) -> AcceleratorResult:
        """
        Parallel codebase analysis operations.

        Runs 4 exploration tasks simultaneously:
        - Existing SPEC scan
        - Pattern analysis
        - Dependency check
        - Related file search

        Expected improvement: ~60% time reduction
        """
        explorer = ParallelCodebaseExplorer(self.project_root, query)
        return await explorer.execute()

    async def _run_constraint_extraction(
        self,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> AcceleratorResult:
        """
        Parallel constraint extraction from multiple sources.

        Extracts 4 constraint types simultaneously:
        - Performance constraints
        - Security constraints
        - Compatibility constraints
        - Scalability constraints

        Expected improvement: ~62% time reduction
        """
        spec_context = context or {}
        extractor = ParallelConstraintExtractor(self.project_root, spec_context)
        return await extractor.execute()

    async def _run_validation(
        self,
        content: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> AcceleratorResult:
        """
        Parallel validation operations.

        Runs 4 validation checks simultaneously:
        - EARS syntax validation
        - Completeness check
        - Structure validation
        - Consistency check

        Expected improvement: ~67% time reduction
        """
        spec_content = content or {}
        validator = ParallelValidator(spec_content)
        return await validator.execute()

    async def _run_full_pipeline(
        self,
        spec_title: str = "",
        **kwargs
    ) -> AcceleratorResult:
        """
        Run complete accelerated SPEC generation pipeline.

        Executes all phases in optimal order with parallel operations
        within each phase.

        Pipeline:
        1. Document Loading (parallel)
        2. Codebase Exploration (parallel)
        3. Constraint Extraction (parallel, uses previous results)

        Expected total improvement: ~50% time reduction
        """
        start_time = time.time()
        all_results = []
        combined_data = {}
        all_errors = []

        # Phase 1: Document Loading (parallel)
        doc_result = await self._run_document_loading()
        all_results.append(doc_result)
        combined_data["documents"] = doc_result.data
        all_errors.extend(doc_result.errors)

        if not doc_result.success and self.config.enable_fallback:
            # Critical phase - abort if failed and no fallback data
            if not doc_result.data.get("documents"):
                return AcceleratorResult(
                    success=False,
                    phase="full",
                    data=combined_data,
                    execution_time_seconds=time.time() - start_time,
                    parallel_tasks_count=doc_result.parallel_tasks_count,
                    errors=["Document loading failed completely"] + all_errors
                )

        # Phase 2: Codebase Exploration (parallel)
        explore_result = await self._run_codebase_exploration(query=spec_title)
        all_results.append(explore_result)
        combined_data["exploration"] = explore_result.data
        all_errors.extend(explore_result.errors)

        # Phase 3: Constraint Extraction (parallel, uses document context)
        context = {
            "title": spec_title,
            "documents": doc_result.data,
            "exploration": explore_result.data
        }
        constraint_result = await self._run_constraint_extraction(context=context)
        all_results.append(constraint_result)
        combined_data["constraints"] = constraint_result.data
        all_errors.extend(constraint_result.errors)

        # Calculate totals
        total_tasks = sum(r.parallel_tasks_count for r in all_results)
        overall_success = all(r.success for r in all_results) or (
            doc_result.success and  # Documents are critical
            len([r for r in all_results if r.success]) >= 2  # At least 2 phases succeeded
        )

        return AcceleratorResult(
            success=overall_success,
            phase="full",
            data=combined_data,
            execution_time_seconds=time.time() - start_time,
            parallel_tasks_count=total_tasks,
            errors=all_errors
        )

    def get_summary(self, result: AcceleratorResult) -> str:
        """Generate human-readable summary of results."""
        return self.aggregator.generate_summary(result)


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="SPEC Accelerator - Parallel SPEC Generation using Claude Agent SDK",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Load project documents in parallel
  python spec_accelerator.py --phase document-loading

  # Explore codebase for patterns related to authentication
  python spec_accelerator.py --phase codebase-exploration --query "authentication"

  # Run full pipeline for a new SPEC
  python spec_accelerator.py --phase full --spec-title "User Authentication System"

  # Get text output instead of JSON
  python spec_accelerator.py --phase document-loading --output text
        """
    )

    parser.add_argument(
        "--phase",
        required=True,
        choices=["document-loading", "codebase-exploration",
                 "constraint-extraction", "validation", "full"],
        help="Phase to execute"
    )

    parser.add_argument(
        "--project-root",
        default=".",
        help="Project root directory (default: current directory)"
    )

    parser.add_argument(
        "--query",
        default="",
        help="Search query for codebase exploration phase"
    )

    parser.add_argument(
        "--spec-title",
        default="",
        help="SPEC title for full pipeline execution"
    )

    parser.add_argument(
        "--context",
        default="{}",
        help="JSON context for constraint extraction (default: {})"
    )

    parser.add_argument(
        "--content",
        default="{}",
        help="JSON content for validation phase (default: {})"
    )

    parser.add_argument(
        "--output",
        default="json",
        choices=["json", "text", "summary"],
        help="Output format (default: json)"
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output"
    )

    return parser.parse_args()


def format_output(result: AcceleratorResult, output_format: str, accelerator: SPECAccelerator) -> str:
    """Format result based on requested output format."""
    if output_format == "json":
        return result.to_json()

    elif output_format == "summary":
        return accelerator.get_summary(result)

    else:  # text
        lines = [
            f"Phase: {result.phase}",
            f"Success: {'Yes' if result.success else 'No'}",
            f"Parallel Tasks: {result.parallel_tasks_count}",
            f"Execution Time: {result.execution_time_seconds:.3f}s",
        ]

        if result.errors:
            lines.append(f"Errors: {len(result.errors)}")
            for error in result.errors[:5]:  # Show first 5 errors
                lines.append(f"  - {error}")

        return "\n".join(lines)


async def main() -> int:
    """Main entry point."""
    args = parse_args()

    # Initialize accelerator
    project_root = Path(args.project_root).resolve()
    accelerator = SPECAccelerator(project_root)

    if args.verbose:
        print(f"Project root: {project_root}", file=sys.stderr)
        print(f"Phase: {args.phase}", file=sys.stderr)

    # Parse JSON arguments
    try:
        context = json.loads(args.context)
    except json.JSONDecodeError:
        context = {}

    try:
        content = json.loads(args.content)
    except json.JSONDecodeError:
        content = {}

    # Execute phase
    result = await accelerator.run_phase(
        args.phase,
        query=args.query,
        spec_title=args.spec_title,
        context=context,
        content=content
    )

    # Output results
    output = format_output(result, args.output, accelerator)
    print(output)

    # Return appropriate exit code
    if result.success:
        return 0
    elif result.parallel_tasks_count > 0 and len(result.errors) < result.parallel_tasks_count:
        return 1  # Partial success
    else:
        return 2  # Failure


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
