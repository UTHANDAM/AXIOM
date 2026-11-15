import sys
import io
import traceback
import tempfile
import os
import subprocess
import time
from typing import Dict, Any, List, Optional

class ExecutionSandbox:
    """
    Isolated execution sandbox with automated trace pruning.
    Extracts strictly the minimal error signature and failing assertion,
    preventing bloated test runner outputs from exhausting context tokens.
    """

    @staticmethod
    def run_in_memory(code: str, test_code: str, timeout_seconds: int = 15) -> Dict[str, Any]:
        """
        Executes code + test in an isolated Python environment and returns pruned output.
        """
        start_time = time.time()
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = os.path.join(tmpdir, "solution.py")
            test_path = os.path.join(tmpdir, "test_solution.py")

            # Write files
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            full_test_content = (
                "import sys, os\n"
                f"sys.path.insert(0, r'{tmpdir}')\n"
                "from solution import *\n\n"
                + test_code + "\n\n"
                "if __name__ == '__main__':\n"
                "    import pytest\n"
                "    sys.exit(pytest.main(['-q', '--tb=short', __file__]))\n"
            )

            with open(test_path, "w", encoding="utf-8") as f:
                f.write(full_test_content)

            try:
                # Run pytest or standard python
                result = subprocess.run(
                    [sys.executable, test_path],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=timeout_seconds
                )
                duration = round(time.time() - start_time, 3)
                passed = (result.returncode == 0)
                raw_stdout = result.stdout or ""
                raw_stderr = result.stderr or ""
                combined_output = raw_stdout + "\n" + raw_stderr

                # Prune trace for minimal token footprint
                pruned_trace = ExecutionSandbox.prune_traceback(combined_output, passed)

                return {
                    "passed": passed,
                    "returncode": result.returncode,
                    "duration_seconds": duration,
                    "raw_output": combined_output.strip(),
                    "pruned_trace": pruned_trace,
                    "raw_tokens": len(combined_output.split()),
                    "pruned_tokens": len(pruned_trace.split())
                }

            except subprocess.TimeoutExpired:
                return {
                    "passed": False,
                    "returncode": -1,
                    "duration_seconds": timeout_seconds,
                    "raw_output": "Execution timed out.",
                    "pruned_trace": f"TimeoutError: Execution exceeded limit of {timeout_seconds}s.",
                    "raw_tokens": 10,
                    "pruned_tokens": 10
                }
            except Exception as e:
                return {
                    "passed": False,
                    "returncode": -1,
                    "duration_seconds": 0.0,
                    "raw_output": str(e),
                    "pruned_trace": f"RunnerError: {str(e)}",
                    "raw_tokens": 15,
                    "pruned_tokens": 15
                }

    @staticmethod
    def run_repository_in_memory(files: Dict[str, str], test_code: str, test_filename: str = "test_suite.py", timeout_seconds: int = 15) -> Dict[str, Any]:
        """
        Executes a multi-file repository in an isolated temporary directory,
        runs Pytest against the test suite, and prunes the stack trace down to minimal tokens.
        """
        start_time = time.time()
        with tempfile.TemporaryDirectory() as tmpdir:
            # Write all project files
            for fname, content in files.items():
                target_path = os.path.join(tmpdir, fname)
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                with open(target_path, "w", encoding="utf-8") as f:
                    f.write(content)

            # Write the test file
            full_test_path = os.path.join(tmpdir, test_filename)
            full_test_content = (
                "import sys, os\n"
                f"sys.path.insert(0, r'{tmpdir}')\n"
                + test_code + "\n\n"
                "if __name__ == '__main__':\n"
                "    import pytest\n"
                "    sys.exit(pytest.main(['-q', '--tb=short', __file__]))\n"
            )
            with open(full_test_path, "w", encoding="utf-8") as f:
                f.write(full_test_content)

            try:
                result = subprocess.run(
                    [sys.executable, full_test_path],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=timeout_seconds
                )
                duration = round(time.time() - start_time, 3)
                passed = (result.returncode == 0)
                raw_stdout = result.stdout or ""
                raw_stderr = result.stderr or ""
                combined_output = raw_stdout + "\n" + raw_stderr
                pruned_trace = ExecutionSandbox.prune_traceback(combined_output, passed)

                return {
                    "passed": passed,
                    "returncode": result.returncode,
                    "duration_seconds": duration,
                    "raw_output": combined_output.strip(),
                    "pruned_trace": pruned_trace,
                    "raw_tokens": len(combined_output.split()),
                    "pruned_tokens": len(pruned_trace.split())
                }
            except subprocess.TimeoutExpired:
                return {
                    "passed": False,
                    "returncode": -1,
                    "duration_seconds": timeout_seconds,
                    "raw_output": "Execution timed out.",
                    "pruned_trace": f"TimeoutError: Multi-file execution exceeded limit of {timeout_seconds}s.",
                    "raw_tokens": 10,
                    "pruned_tokens": 10
                }
            except Exception as e:
                return {
                    "passed": False,
                    "returncode": -1,
                    "duration_seconds": 0.0,
                    "raw_output": str(e),
                    "pruned_trace": f"RunnerError: {str(e)}",
                    "raw_tokens": 15,
                    "pruned_tokens": 15
                }

    @staticmethod
    def prune_traceback(output: str, passed: bool) -> str:
        """
        Compresses multi-page test output down to the essential failing line and assertion.
        Saves 80-95% of prompt tokens on subsequent correction iterations.
        """
        if passed:
            return "ALL TESTS PASSED (0 errors, 100% assertions verified)"

        lines = output.splitlines()
        critical_lines: List[str] = []
        capture = False

        for line in lines:
            # Capture failure lines, assertions, and line numbers
            if "FAILED" in line or "AssertionError" in line or "Error:" in line or "E   " in line:
                critical_lines.append(line.strip())
            elif "line " in line and ("in test_" in line or "in " in line):
                critical_lines.append(line.strip())

        if not critical_lines:
            # Fallback to last 5 lines if pattern matching missed
            critical_lines = [l.strip() for l in lines[-5:] if l.strip()]

        return "[PRUNED ERROR TRACE]:\n" + "\n".join(critical_lines[:6])

