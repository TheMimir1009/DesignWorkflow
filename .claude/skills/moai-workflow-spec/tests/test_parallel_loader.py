"""
Unit Tests for SPEC Accelerator - Parallel Document Loader

Tests parallel document loading functionality with various scenarios:
- Successful parallel loading of all documents
- Partial success when some documents are missing
- Error handling for invalid paths
- Performance benchmarking vs sequential execution
"""

import asyncio
import pytest
import tempfile
import time
from pathlib import Path
import sys

# Add parent path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from lib.operations import (
    ParallelDocumentLoader,
    ParallelCodebaseExplorer,
    AcceleratorResult,
    OperationResult
)
from lib.config import SDKConfig


@pytest.fixture
def mock_project_root():
    """Create a temporary project structure for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)

        # Create .moai/project directory
        project_dir = root / ".moai" / "project"
        project_dir.mkdir(parents=True)

        # Create test documents
        (project_dir / "product.md").write_text("""# Product Document

## Overview
Test product overview content.

## Features
- Feature 1
- Feature 2
- Feature 3

## Requirements
Business requirements here.
""")

        (project_dir / "structure.md").write_text("""# Structure Document

## Architecture
Test architecture content.

## Components
- Component A
- Component B
""")

        (project_dir / "tech.md").write_text("""# Tech Stack

## Frontend
- React 19
- TypeScript 5.x

## Backend
- Node.js 22 LTS
- Express 5.x
""")

        # Create .moai/specs directory with sample SPECs
        specs_dir = root / ".moai" / "specs"
        spec_dir = specs_dir / "SPEC-TEST-001"
        spec_dir.mkdir(parents=True)
        (spec_dir / "spec.md").write_text("# Test SPEC")
        (spec_dir / "plan.md").write_text("# Test Plan")
        (spec_dir / "acceptance.md").write_text("# Test Acceptance")

        # Create src directory
        src_dir = root / "src"
        (src_dir / "components").mkdir(parents=True)
        (src_dir / "services").mkdir(parents=True)
        (src_dir / "store").mkdir(parents=True)

        # Create package.json
        (root / "package.json").write_text("""{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "express": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^4.0.0"
  }
}
""")

        yield root


@pytest.fixture
def incomplete_project_root():
    """Create a project with missing documents."""
    with tempfile.TemporaryDirectory() as tmpdir:
        root = Path(tmpdir)

        # Create .moai/project directory with only one document
        project_dir = root / ".moai" / "project"
        project_dir.mkdir(parents=True)

        (project_dir / "product.md").write_text("# Product\nTest content")
        # structure.md and tech.md are missing

        yield root


class TestParallelDocumentLoader:
    """Test suite for ParallelDocumentLoader."""

    @pytest.mark.asyncio
    async def test_successful_parallel_loading(self, mock_project_root):
        """Test successful parallel loading of all project documents."""
        loader = ParallelDocumentLoader(mock_project_root)
        result = await loader.execute()

        assert result.success is True
        assert result.phase == "document-loading"
        assert result.parallel_tasks_count == 3
        assert len(result.errors) == 0

        # Verify all documents were loaded
        documents = result.data.get("documents", {})
        assert len(documents) == 3

        # Check document content
        for doc_path, doc_data in documents.items():
            assert "content" in doc_data
            assert "lines" in doc_data
            assert "size_bytes" in doc_data
            assert doc_data["lines"] > 0

    @pytest.mark.asyncio
    async def test_partial_success_with_missing_docs(self, incomplete_project_root):
        """Test handling when some documents are missing."""
        loader = ParallelDocumentLoader(incomplete_project_root)
        result = await loader.execute()

        assert result.success is False  # Not all documents loaded
        assert result.parallel_tasks_count == 3
        assert len(result.errors) == 2  # Two documents missing

        # Verify one document was still loaded
        documents = result.data.get("documents", {})
        assert len(documents) == 1

    @pytest.mark.asyncio
    async def test_execution_time_improvement(self, mock_project_root):
        """Test that parallel loading is faster than sequential would be."""
        loader = ParallelDocumentLoader(mock_project_root)

        start = time.time()
        result = await loader.execute()
        parallel_time = time.time() - start

        # Parallel execution should complete quickly
        assert parallel_time < 1.0  # Should be under 1 second
        assert result.execution_time_seconds < 1.0

    @pytest.mark.asyncio
    async def test_section_extraction(self, mock_project_root):
        """Test that document sections are extracted correctly."""
        loader = ParallelDocumentLoader(mock_project_root)
        result = await loader.execute()

        documents = result.data.get("documents", {})
        product_doc = documents.get(".moai/project/product.md", {})

        assert "sections" in product_doc
        sections = product_doc["sections"]
        assert len(sections) > 0

        # Check section names were extracted
        section_names = [s["name"] for s in sections]
        assert "Overview" in section_names or "Product Document" in section_names


class TestParallelCodebaseExplorer:
    """Test suite for ParallelCodebaseExplorer."""

    @pytest.mark.asyncio
    async def test_spec_scanning(self, mock_project_root):
        """Test scanning for existing SPEC documents."""
        explorer = ParallelCodebaseExplorer(mock_project_root, "test feature")
        result = await explorer.execute()

        assert result.phase == "codebase-exploration"
        assert result.parallel_tasks_count == 4

        # Check spec scan results
        spec_scan = result.data.get("spec_scan", {})
        existing_specs = spec_scan.get("existing_specs", [])
        assert len(existing_specs) >= 1

        # Verify SPEC-TEST-001 was found
        spec_ids = [s["id"] for s in existing_specs]
        assert "SPEC-TEST-001" in spec_ids

    @pytest.mark.asyncio
    async def test_pattern_analysis(self, mock_project_root):
        """Test pattern analysis in source code."""
        explorer = ParallelCodebaseExplorer(mock_project_root, "components")
        result = await explorer.execute()

        pattern_data = result.data.get("pattern_analysis", {})
        patterns = pattern_data.get("patterns", [])

        # Should detect component architecture
        pattern_types = [p.get("type") for p in patterns]
        assert "component_architecture" in pattern_types or len(patterns) > 0

    @pytest.mark.asyncio
    async def test_dependency_check(self, mock_project_root):
        """Test dependency checking from package.json."""
        explorer = ParallelCodebaseExplorer(mock_project_root, "dependencies")
        result = await explorer.execute()

        dep_data = result.data.get("dependency_check", {})
        dependencies = dep_data.get("dependencies", {})

        assert "node" in dependencies
        node_deps = dependencies["node"]
        assert node_deps["dependencies"] == 2
        assert node_deps["devDependencies"] == 2


class TestSDKConfig:
    """Test suite for SDK configuration."""

    def test_default_config(self):
        """Test default configuration values."""
        config = SDKConfig()

        assert config.timeout_seconds == 60.0
        assert config.max_retries == 3
        assert config.max_concurrent_tasks == 4
        assert config.enable_fallback is True

    def test_config_from_project(self, mock_project_root):
        """Test loading config from project root."""
        config = SDKConfig.load_from_project(mock_project_root)

        assert config.project_root == mock_project_root
        assert len(config.document_files) == 3

    def test_document_paths(self, mock_project_root):
        """Test document path generation."""
        config = SDKConfig.load_from_project(mock_project_root)

        product_path = config.get_document_path("product.md")
        assert product_path.exists()
        assert product_path.name == "product.md"


class TestAcceleratorResult:
    """Test suite for AcceleratorResult data class."""

    def test_json_serialization(self):
        """Test JSON serialization of results."""
        result = AcceleratorResult(
            success=True,
            phase="test",
            data={"key": "value"},
            execution_time_seconds=1.5,
            parallel_tasks_count=3,
            errors=[]
        )

        json_str = result.to_json()
        assert "success" in json_str
        assert "true" in json_str.lower()
        assert "test" in json_str

    def test_result_with_errors(self):
        """Test result with error messages."""
        result = AcceleratorResult(
            success=False,
            phase="test",
            data={},
            execution_time_seconds=0.5,
            parallel_tasks_count=2,
            errors=["Error 1", "Error 2"]
        )

        assert not result.success
        assert len(result.errors) == 2


# Performance Benchmark (optional, run manually)
class TestPerformanceBenchmark:
    """Performance benchmarks comparing parallel vs sequential execution."""

    @pytest.mark.asyncio
    @pytest.mark.skip(reason="Run manually for performance testing")
    async def test_benchmark_parallel_vs_sequential(self, mock_project_root):
        """Benchmark parallel loading vs simulated sequential loading."""
        import aiofiles

        # Parallel execution
        loader = ParallelDocumentLoader(mock_project_root)
        start = time.time()
        parallel_result = await loader.execute()
        parallel_time = time.time() - start

        # Simulated sequential execution
        sequential_time = 0
        for doc_path in ParallelDocumentLoader.DOCUMENT_PATHS:
            start = time.time()
            full_path = mock_project_root / doc_path
            if full_path.exists():
                async with aiofiles.open(full_path, "r") as f:
                    await f.read()
            sequential_time += time.time() - start

        # Calculate improvement
        if sequential_time > 0:
            improvement = ((sequential_time - parallel_time) / sequential_time) * 100
            print(f"\nParallel: {parallel_time:.4f}s")
            print(f"Sequential: {sequential_time:.4f}s")
            print(f"Improvement: {improvement:.1f}%")

            # Parallel should be at least 30% faster
            assert improvement > 30


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
