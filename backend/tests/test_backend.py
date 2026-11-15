import pytest
from app.engine.ast_pruner import ASTCodePruner
from app.engine.token_budgeter import TokenBudgetTracker
from app.engine.diff_engine import DiffEngine
from app.engine.sandbox import ExecutionSandbox
from app.engine.axiom_agent import AxiomAgent
from app.benchmarks.challenges import BENCHMARK_TASKS

SAMPLE_CODE = """
import math

class Calculator:
    \"\"\"High-performance scientific calculator.\"\"\"
    def __init__(self, precision: int = 4):
        self.precision = precision

    def add(self, a: float, b: float) -> float:
        \"\"\"Adds two numbers.\"\"\"
        result = a + b
        return round(result, self.precision)

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ZeroDivisionError("Cannot divide by zero")
        return round(a / b, self.precision)
"""

def test_ast_skeletonizer():
    skeleton, meta = ASTCodePruner.skeletonize(SAMPLE_CODE)
    assert meta["pruned"] is True
    assert meta["savings_ratio"] > 10.0
    assert "...  # [lines" in skeleton
    assert "class Calculator:" in skeleton
    assert "def add(self" in skeleton
    symbols = ASTCodePruner.parse_symbols(SAMPLE_CODE)
    assert len(symbols) >= 3

def test_ast_slice_extraction():
    slice_code = ASTCodePruner.extract_symbol_slice(SAMPLE_CODE, "Calculator.divide")
    assert slice_code is not None
    assert "Cannot divide by zero" in slice_code

def test_token_budget_tracker():
    tracker = TokenBudgetTracker(initial_budget=2000)
    tracker.record_turn("Hello model, fix this bug", "Here is the patch", step_label="step1")
    assert tracker.total_tokens > 0
    assert tracker.total_tokens < tracker.initial_budget
    summary = tracker.get_summary()
    assert summary["efficiency_percentage"] > 0
    assert summary["tokens_saved"] > 0

def test_diff_engine_patch():
    orig = "def foo():\n    return False\n"
    search_b = "    return False"
    replace_b = "    return True"
    ok, new_code, err = DiffEngine.apply_search_replace_block(orig, search_b, replace_b)
    assert ok is True
    assert "return True" in new_code
    diff_stats = DiffEngine.get_diff_stats(orig, new_code)
    assert diff_stats["lines_added"] == 1
    assert diff_stats["lines_removed"] == 1

def test_sandbox_execution():
    code = "def add(a, b): return a + b"
    test_code = "def test_add(): assert add(2, 3) == 5"
    res = ExecutionSandbox.run_in_memory(code, test_code)
    assert res["passed"] is True

    failing_test = "def test_add_fail(): assert add(2, 3) == 99"
    res_fail = ExecutionSandbox.run_in_memory(code, failing_test)
    assert res_fail["passed"] is False
    assert "PRUNED ERROR TRACE" in res_fail["pruned_trace"]

def test_axiom_benchmark_lru():
    task = BENCHMARK_TASKS["lru_cache"]
    agent = AxiomAgent(budget=3500)
    events = list(agent.run_task_stream(
        task_name=task["name"],
        problem_description=task["description"],
        initial_code=task["initial_code"],
        test_code=task["test_code"]
    ))
    last_event = events[-1]
    assert last_event["type"] == "COMPLETED"
    assert last_event["success"] is True
    summary = last_event["summary"]
    # Verify token efficiency constraint: Axiom must use < 3500 tokens
    assert summary["axiom_tokens"] < 3500
    assert summary["efficiency_percentage"] >= 70.0

def test_ast_multi_file_repository_skeleton():
    files = {
        "models.py": "class User:\n    def __init__(self, name: str):\n        self.name = name\n",
        "service.py": "from models import User\n\ndef get_user_display(u: User) -> str:\n    return f'User: {u.name}'\n"
    }
    repo_skel = ASTCodePruner.skeletonize_repository(files)
    assert repo_skel["total_files"] == 2
    assert len(repo_skel["symbols"]) >= 2
    fname, slice_code = ASTCodePruner.resolve_cross_file_symbol(files, "get_user_display")
    assert fname == "service.py"
    assert "User: {u.name}" in slice_code

def test_axiom_benchmark_distributed_ledger():
    task = BENCHMARK_TASKS["distributed_ledger"]
    agent = AxiomAgent(budget=3500)
    events = list(agent.run_task_stream(
        task_name=task["name"],
        problem_description=task["description"],
        initial_code=task["initial_code"],
        test_code=task["test_code"]
    ))
    last_event = events[-1]
    assert last_event["type"] == "COMPLETED"
    assert last_event["success"] is True
    summary = last_event["summary"]
    assert summary["axiom_tokens"] < 3500
    assert summary["efficiency_percentage"] >= 70.0

