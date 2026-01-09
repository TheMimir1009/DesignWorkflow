"""
Parallel Operations for SPEC Accelerator

Implements atomic operations that can be executed in parallel:
- Document loading (3 files simultaneously)
- Codebase exploration (4 concurrent searches)
- Constraint extraction (4 parallel analyses)
- Validation (4 concurrent checks)

Each operation is designed to be independent and return structured results.
"""

import asyncio
import time
import json
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable, Awaitable
from concurrent.futures import ThreadPoolExecutor

# Thread pool for async file operations
_executor = ThreadPoolExecutor(max_workers=4)


@dataclass
class OperationResult:
    """Result from a single parallel operation."""

    operation_id: str
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time_ms: float = 0

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class AcceleratorResult:
    """Result from an accelerated SPEC generation phase."""

    success: bool
    phase: str
    data: Dict[str, Any]
    execution_time_seconds: float
    parallel_tasks_count: int
    errors: List[str] = field(default_factory=list)

    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(asdict(self), indent=2, ensure_ascii=False)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


class ParallelDocumentLoader:
    """Parallel loader for project documents."""

    DOCUMENT_PATHS = [
        ".moai/project/product.md",
        ".moai/project/structure.md",
        ".moai/project/tech.md"
    ]

    def __init__(self, project_root: Path):
        self.project_root = project_root

    async def execute(self) -> AcceleratorResult:
        """Load all documents in parallel."""
        start_time = time.time()

        # Create tasks for parallel execution
        tasks = [
            self._load_document(doc_path)
            for doc_path in self.DOCUMENT_PATHS
        ]

        # Execute all in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        documents = {}
        errors = []

        for idx, result in enumerate(results):
            doc_path = self.DOCUMENT_PATHS[idx]
            if isinstance(result, Exception):
                errors.append(f"Failed to load {doc_path}: {str(result)}")
            elif result.success:
                documents[result.operation_id] = result.data
            else:
                errors.append(result.error or f"Unknown error loading {result.operation_id}")

        return AcceleratorResult(
            success=len(errors) == 0,
            phase="document-loading",
            data={"documents": documents},
            execution_time_seconds=time.time() - start_time,
            parallel_tasks_count=len(self.DOCUMENT_PATHS),
            errors=errors
        )

    async def _load_document(self, doc_path: str) -> OperationResult:
        """Load a single document asynchronously."""
        start = time.time()
        full_path = self.project_root / doc_path

        try:
            if not full_path.exists():
                return OperationResult(
                    operation_id=doc_path,
                    success=False,
                    data=None,
                    error=f"File not found: {doc_path}",
                    execution_time_ms=(time.time() - start) * 1000
                )

            # Use thread pool executor for async file reading
            loop = asyncio.get_event_loop()
            content = await loop.run_in_executor(
                _executor,
                lambda: full_path.read_text(encoding="utf-8")
            )

            # Parse basic structure
            lines = content.splitlines()
            sections = self._extract_sections(lines)

            return OperationResult(
                operation_id=doc_path,
                success=True,
                data={
                    "path": doc_path,
                    "content": content,
                    "size_bytes": len(content.encode("utf-8")),
                    "lines": len(lines),
                    "sections": sections
                },
                execution_time_ms=(time.time() - start) * 1000
            )
        except Exception as e:
            return OperationResult(
                operation_id=doc_path,
                success=False,
                data=None,
                error=str(e),
                execution_time_ms=(time.time() - start) * 1000
            )

    def _extract_sections(self, lines: List[str]) -> List[Dict[str, Any]]:
        """Extract markdown sections from document."""
        sections = []
        current_section = None
        current_content = []

        for line in lines:
            if line.startswith("# "):
                if current_section:
                    sections.append({
                        "name": current_section,
                        "line_count": len(current_content)
                    })
                current_section = line[2:].strip()
                current_content = []
            elif line.startswith("## "):
                if current_section:
                    sections.append({
                        "name": current_section,
                        "line_count": len(current_content)
                    })
                current_section = line[3:].strip()
                current_content = []
            else:
                current_content.append(line)

        # Add last section
        if current_section:
            sections.append({
                "name": current_section,
                "line_count": len(current_content)
            })

        return sections


class ParallelCodebaseExplorer:
    """Parallel codebase exploration for SPEC context."""

    def __init__(self, project_root: Path, query: str):
        self.project_root = project_root
        self.query = query

    async def execute(self) -> AcceleratorResult:
        """Run parallel codebase exploration tasks."""
        start_time = time.time()

        # Define parallel exploration tasks
        tasks = [
            self._scan_existing_specs(),
            self._analyze_source_patterns(),
            self._check_dependencies(),
            self._search_related_files()
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Aggregate results
        exploration_data = {}
        errors = []

        task_names = ["spec_scan", "pattern_analysis", "dependency_check", "file_search"]
        for idx, result in enumerate(results):
            task_name = task_names[idx]
            if isinstance(result, Exception):
                errors.append(f"{task_name} failed: {str(result)}")
            elif result.success:
                exploration_data[task_name] = result.data
            else:
                errors.append(result.error or f"Unknown error in {task_name}")

        return AcceleratorResult(
            success=len(errors) < len(tasks),  # Partial success acceptable
            phase="codebase-exploration",
            data=exploration_data,
            execution_time_seconds=time.time() - start_time,
            parallel_tasks_count=len(tasks),
            errors=errors
        )

    async def _scan_existing_specs(self) -> OperationResult:
        """Scan for existing SPEC documents."""
        start = time.time()
        specs_dir = self.project_root / ".moai" / "specs"

        try:
            specs = []
            if specs_dir.exists():
                for spec_dir in specs_dir.iterdir():
                    if spec_dir.is_dir() and spec_dir.name.startswith("SPEC-"):
                        spec_file = spec_dir / "spec.md"
                        if spec_file.exists():
                            specs.append({
                                "id": spec_dir.name,
                                "path": str(spec_file.relative_to(self.project_root)),
                                "has_plan": (spec_dir / "plan.md").exists(),
                                "has_acceptance": (spec_dir / "acceptance.md").exists()
                            })

            return OperationResult(
                operation_id="spec_scan",
                success=True,
                data={"existing_specs": specs, "count": len(specs)},
                execution_time_ms=(time.time() - start) * 1000
            )
        except Exception as e:
            return OperationResult(
                operation_id="spec_scan",
                success=False,
                error=str(e),
                execution_time_ms=(time.time() - start) * 1000
            )

    async def _analyze_source_patterns(self) -> OperationResult:
        """Analyze source code patterns."""
        start = time.time()

        try:
            patterns = []
            src_dir = self.project_root / "src"

            if src_dir.exists():
                # Count file types
                file_counts = {}
                for ext in [".ts", ".tsx", ".py", ".js", ".jsx"]:
                    count = len(list(src_dir.rglob(f"*{ext}")))
                    if count > 0:
                        file_counts[ext] = count

                patterns.append({
                    "type": "file_distribution",
                    "data": file_counts
                })

                # Check for common patterns
                if (src_dir / "components").exists():
                    patterns.append({"type": "component_architecture", "detected": True})
                if (src_dir / "services").exists():
                    patterns.append({"type": "service_layer", "detected": True})
                if (src_dir / "store").exists() or (src_dir / "stores").exists():
                    patterns.append({"type": "state_management", "detected": True})

            return OperationResult(
                operation_id="pattern_analysis",
                success=True,
                data={"patterns": patterns},
                execution_time_ms=(time.time() - start) * 1000
            )
        except Exception as e:
            return OperationResult(
                operation_id="pattern_analysis",
                success=False,
                error=str(e),
                execution_time_ms=(time.time() - start) * 1000
            )

    async def _check_dependencies(self) -> OperationResult:
        """Check project dependencies."""
        start = time.time()

        try:
            dependencies = {}

            # Check package.json
            package_json = self.project_root / "package.json"
            if package_json.exists():
                loop = asyncio.get_event_loop()
                content = await loop.run_in_executor(
                    _executor,
                    lambda: package_json.read_text(encoding="utf-8")
                )
                pkg = json.loads(content)
                dependencies["node"] = {
                    "name": pkg.get("name", "unknown"),
                    "dependencies": len(pkg.get("dependencies", {})),
                    "devDependencies": len(pkg.get("devDependencies", {}))
                }

            # Check pyproject.toml or requirements.txt
            requirements = self.project_root / "requirements.txt"
            if requirements.exists():
                loop = asyncio.get_event_loop()
                content = await loop.run_in_executor(
                    _executor,
                    lambda: requirements.read_text(encoding="utf-8")
                )
                dependencies["python"] = {
                    "packages": len([l for l in content.splitlines() if l.strip() and not l.startswith("#")])
                }

            return OperationResult(
                operation_id="dependency_check",
                success=True,
                data={"dependencies": dependencies},
                execution_time_ms=(time.time() - start) * 1000
            )
        except Exception as e:
            return OperationResult(
                operation_id="dependency_check",
                success=False,
                error=str(e),
                execution_time_ms=(time.time() - start) * 1000
            )

    async def _search_related_files(self) -> OperationResult:
        """Search for files related to the query."""
        start = time.time()

        try:
            related = []
            keywords = self.query.lower().split()

            # Search in common locations
            search_dirs = ["src", "server", "tests"]
            for dir_name in search_dirs:
                dir_path = self.project_root / dir_name
                if dir_path.exists():
                    for file_path in dir_path.rglob("*"):
                        if file_path.is_file():
                            file_name_lower = file_path.name.lower()
                            for keyword in keywords:
                                if keyword in file_name_lower:
                                    related.append({
                                        "path": str(file_path.relative_to(self.project_root)),
                                        "keyword": keyword,
                                        "relevance": "medium"
                                    })
                                    break

            return OperationResult(
                operation_id="file_search",
                success=True,
                data={"related_files": related[:20]},  # Limit results
                execution_time_ms=(time.time() - start) * 1000
            )
        except Exception as e:
            return OperationResult(
                operation_id="file_search",
                success=False,
                error=str(e),
                execution_time_ms=(time.time() - start) * 1000
            )


class ParallelConstraintExtractor:
    """Parallel extraction of constraints from multiple sources."""

    CONSTRAINT_TYPES = ["performance", "security", "compatibility", "scalability"]

    def __init__(self, project_root: Path, spec_context: Dict[str, Any]):
        self.project_root = project_root
        self.spec_context = spec_context

    async def execute(self) -> AcceleratorResult:
        """Extract all constraint types in parallel."""
        start_time = time.time()

        tasks = [
            self._extract_constraint(ctype)
            for ctype in self.CONSTRAINT_TYPES
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        constraints = {}
        errors = []

        for idx, result in enumerate(results):
            ctype = self.CONSTRAINT_TYPES[idx]
            if isinstance(result, Exception):
                errors.append(f"{ctype} extraction failed: {str(result)}")
            elif result.success:
                constraints[ctype] = result.data

        return AcceleratorResult(
            success=len(errors) == 0,
            phase="constraint-extraction",
            data={"constraints": constraints},
            execution_time_seconds=time.time() - start_time,
            parallel_tasks_count=len(self.CONSTRAINT_TYPES),
            errors=errors
        )

    async def _extract_constraint(self, constraint_type: str) -> OperationResult:
        """Extract a specific constraint type."""
        start = time.time()

        try:
            # Extract from context based on type
            constraints = []

            # Simulated constraint extraction logic
            # In real implementation, this would parse documents and code
            context_str = json.dumps(self.spec_context, ensure_ascii=False).lower()

            keywords = {
                "performance": ["latency", "throughput", "response time", "fast", "slow", "optimize"],
                "security": ["auth", "encrypt", "secure", "password", "token", "permission"],
                "compatibility": ["browser", "mobile", "api version", "backward", "support"],
                "scalability": ["scale", "concurrent", "load", "capacity", "growth"]
            }

            for keyword in keywords.get(constraint_type, []):
                if keyword in context_str:
                    constraints.append({
                        "requirement": f"Consider {keyword} requirements",
                        "source": "context_analysis",
                        "confidence": "medium",
                        "priority": "preferred"
                    })

            return OperationResult(
                operation_id=f"constraint_{constraint_type}",
                success=True,
                data={
                    "constraint_type": constraint_type,
                    "constraints": constraints
                },
                execution_time_ms=(time.time() - start) * 1000
            )
        except Exception as e:
            return OperationResult(
                operation_id=f"constraint_{constraint_type}",
                success=False,
                error=str(e),
                execution_time_ms=(time.time() - start) * 1000
            )


class ParallelValidator:
    """Parallel validation of SPEC content."""

    VALIDATION_CHECKS = ["ears_syntax", "completeness", "structure", "consistency"]

    def __init__(self, spec_content: Dict[str, Any]):
        self.spec_content = spec_content

    async def execute(self) -> AcceleratorResult:
        """Run all validation checks in parallel."""
        start_time = time.time()

        tasks = [
            self._run_validation(check)
            for check in self.VALIDATION_CHECKS
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        validations = {}
        errors = []
        all_passed = True

        for idx, result in enumerate(results):
            check = self.VALIDATION_CHECKS[idx]
            if isinstance(result, Exception):
                errors.append(f"{check} validation failed: {str(result)}")
                all_passed = False
            elif result.success:
                validations[check] = result.data
                if not result.data.get("passed", False):
                    all_passed = False

        return AcceleratorResult(
            success=all_passed,
            phase="validation",
            data={"validations": validations, "all_passed": all_passed},
            execution_time_seconds=time.time() - start_time,
            parallel_tasks_count=len(self.VALIDATION_CHECKS),
            errors=errors
        )

    async def _run_validation(self, check_type: str) -> OperationResult:
        """Run a specific validation check."""
        start = time.time()

        try:
            issues = []
            passed = True

            content_str = json.dumps(self.spec_content, ensure_ascii=False)

            if check_type == "ears_syntax":
                # Check for EARS patterns
                ears_patterns = ["shall", "when", "while", "where", "if"]
                found_patterns = [p for p in ears_patterns if p in content_str.lower()]
                if not found_patterns:
                    issues.append({
                        "severity": "warning",
                        "message": "No EARS syntax patterns detected"
                    })
                    passed = False

            elif check_type == "completeness":
                # Check for required sections
                required = ["requirements", "acceptance", "description"]
                missing = [r for r in required if r not in content_str.lower()]
                if missing:
                    issues.append({
                        "severity": "warning",
                        "message": f"Missing sections: {', '.join(missing)}"
                    })

            elif check_type == "structure":
                # Basic structure validation
                if "id" not in self.spec_content:
                    issues.append({
                        "severity": "error",
                        "message": "Missing SPEC ID"
                    })
                    passed = False

            elif check_type == "consistency":
                # Consistency check placeholder
                pass

            return OperationResult(
                operation_id=f"validation_{check_type}",
                success=True,
                data={
                    "validation_type": check_type,
                    "passed": passed,
                    "issues": issues,
                    "score": 100 if passed and not issues else 70
                },
                execution_time_ms=(time.time() - start) * 1000
            )
        except Exception as e:
            return OperationResult(
                operation_id=f"validation_{check_type}",
                success=False,
                error=str(e),
                execution_time_ms=(time.time() - start) * 1000
            )


class FallbackManager:
    """Manages fallback to sequential execution when parallel fails."""

    def __init__(self, max_retries: int = 3, timeout_seconds: float = 60):
        self.max_retries = max_retries
        self.timeout_seconds = timeout_seconds

    async def execute_with_fallback(
        self,
        parallel_func: Callable[[], Awaitable[AcceleratorResult]],
        sequential_func: Callable[[], Awaitable[AcceleratorResult]],
    ) -> AcceleratorResult:
        """Try parallel execution, fall back to sequential on failure."""
        try:
            # Attempt parallel execution with timeout
            result = await asyncio.wait_for(
                parallel_func(),
                timeout=self.timeout_seconds
            )

            if result.success:
                return result

            # Partial success - check if usable
            if result.parallel_tasks_count > 0 and len(result.errors) < result.parallel_tasks_count:
                return result

        except asyncio.TimeoutError:
            pass
        except Exception:
            pass

        # Fall back to sequential execution
        return await sequential_func()
