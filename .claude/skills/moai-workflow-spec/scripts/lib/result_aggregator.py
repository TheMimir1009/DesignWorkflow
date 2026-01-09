"""
Result Aggregator for SPEC Accelerator

Merges and consolidates results from parallel operations into
unified output for downstream processing.
"""

import time
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

from .operations import AcceleratorResult


@dataclass
class AggregatedResult:
    """Aggregated result from multiple phases."""

    success: bool
    phases_completed: List[str]
    phases_failed: List[str]
    combined_data: Dict[str, Any]
    total_execution_time_seconds: float
    total_tasks_count: int
    all_errors: List[str]

    def get_phase_data(self, phase: str) -> Optional[Dict[str, Any]]:
        """Get data for a specific phase."""
        return self.combined_data.get(phase)


class ResultAggregator:
    """Aggregates results from multiple parallel phases."""

    def merge(self, results: List[AcceleratorResult]) -> AcceleratorResult:
        """Merge multiple AcceleratorResults into one."""
        if not results:
            return AcceleratorResult(
                success=False,
                phase="aggregated",
                data={},
                execution_time_seconds=0,
                parallel_tasks_count=0,
                errors=["No results to aggregate"]
            )

        combined_data = {}
        all_errors = []
        total_tasks = 0
        all_successful = True

        for result in results:
            # Merge data by phase
            combined_data[result.phase] = result.data
            all_errors.extend(result.errors)
            total_tasks += result.parallel_tasks_count
            if not result.success:
                all_successful = False

        # Calculate total time (max of all, since parallel)
        max_time = max(r.execution_time_seconds for r in results)

        return AcceleratorResult(
            success=all_successful,
            phase="aggregated",
            data=combined_data,
            execution_time_seconds=max_time,
            parallel_tasks_count=total_tasks,
            errors=all_errors
        )

    def aggregate_detailed(self, results: List[AcceleratorResult]) -> AggregatedResult:
        """Create detailed aggregated result."""
        phases_completed = []
        phases_failed = []
        combined_data = {}
        all_errors = []
        total_tasks = 0
        total_time = 0

        for result in results:
            if result.success:
                phases_completed.append(result.phase)
            else:
                phases_failed.append(result.phase)

            combined_data[result.phase] = result.data
            all_errors.extend([f"[{result.phase}] {e}" for e in result.errors])
            total_tasks += result.parallel_tasks_count
            total_time = max(total_time, result.execution_time_seconds)

        return AggregatedResult(
            success=len(phases_failed) == 0,
            phases_completed=phases_completed,
            phases_failed=phases_failed,
            combined_data=combined_data,
            total_execution_time_seconds=total_time,
            total_tasks_count=total_tasks,
            all_errors=all_errors
        )

    def extract_documents(self, aggregated: AcceleratorResult) -> Dict[str, str]:
        """Extract loaded documents from aggregated result."""
        documents = {}

        if "document-loading" in aggregated.data:
            doc_data = aggregated.data["document-loading"]
            if "documents" in doc_data:
                for path, doc_info in doc_data["documents"].items():
                    if isinstance(doc_info, dict) and "content" in doc_info:
                        documents[path] = doc_info["content"]

        return documents

    def extract_specs(self, aggregated: AcceleratorResult) -> List[Dict[str, Any]]:
        """Extract existing SPECs from aggregated result."""
        specs = []

        if "codebase-exploration" in aggregated.data:
            explore_data = aggregated.data["codebase-exploration"]
            if "spec_scan" in explore_data:
                specs = explore_data["spec_scan"].get("existing_specs", [])

        return specs

    def extract_constraints(self, aggregated: AcceleratorResult) -> Dict[str, List[Dict]]:
        """Extract constraints from aggregated result."""
        constraints = {}

        if "constraint-extraction" in aggregated.data:
            constraint_data = aggregated.data["constraint-extraction"]
            if "constraints" in constraint_data:
                for ctype, cdata in constraint_data["constraints"].items():
                    if isinstance(cdata, dict) and "constraints" in cdata:
                        constraints[ctype] = cdata["constraints"]

        return constraints

    def generate_summary(self, aggregated: AcceleratorResult) -> str:
        """Generate human-readable summary of results."""
        lines = [
            "# SPEC Accelerator Results Summary",
            "",
            f"**Success:** {'Yes' if aggregated.success else 'No'}",
            f"**Phase:** {aggregated.phase}",
            f"**Tasks:** {aggregated.parallel_tasks_count}",
            f"**Time:** {aggregated.execution_time_seconds:.2f}s",
            ""
        ]

        if aggregated.errors:
            lines.append("## Errors")
            for error in aggregated.errors:
                lines.append(f"- {error}")
            lines.append("")

        if aggregated.data:
            lines.append("## Data Summary")
            for phase, data in aggregated.data.items():
                if isinstance(data, dict):
                    lines.append(f"- **{phase}:** {len(data)} items")
                else:
                    lines.append(f"- **{phase}:** {type(data).__name__}")

        return "\n".join(lines)
