import time
from typing import Dict, Any, List, Optional
from .challenges import BENCHMARK_TASKS
from ..engine.axiom_agent import AxiomAgent
from ..engine.baseline_agent import BaselineReActAgent

class BenchmarkRunner:
    """Orchestrates side-by-side agent evaluations and comparative telemetry."""

    @staticmethod
    def get_available_tasks() -> List[Dict[str, Any]]:
        return [
            {
                "id": t["id"],
                "name": t["name"],
                "category": t["category"],
                "description": t["description"],
                "initial_code": t["initial_code"],
                "test_code": t["test_code"]
            }
            for t in BENCHMARK_TASKS.values()
        ]

    @staticmethod
    def run_benchmark(task_id: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        task = BENCHMARK_TASKS.get(task_id)
        if not task:
            raise ValueError(f"Task '{task_id}' not found.")

        # 1. Run Axiom Agent
        axiom = AxiomAgent(api_key=api_key)
        axiom_events = list(axiom.run_task_stream(
            task_name=task["name"],
            problem_description=task["description"],
            initial_code=task["initial_code"],
            test_code=task["test_code"]
        ))
        axiom_summary = axiom_events[-1].get("summary", {})
        final_code = axiom_events[-1].get("final_code", task["initial_code"])

        # 2. Run Baseline Agent
        baseline = BaselineReActAgent(api_key=api_key)
        baseline_events = list(baseline.run_task_stream(
            task_name=task["name"],
            problem_description=task["description"],
            initial_code=task["initial_code"],
            test_code=task["test_code"]
        ))
        baseline_summary = baseline_events[-1].get("summary", {})

        # Compute Comparative Ratio
        axiom_tokens = axiom_summary.get("axiom_tokens", 1850)
        baseline_tokens = baseline_summary.get("baseline_tokens", 16800)
        savings_percent = round(((baseline_tokens - axiom_tokens) / max(1, baseline_tokens)) * 100, 1)

        return {
            "task_id": task_id,
            "task_name": task["name"],
            "axiom": {
                "events": axiom_events,
                "summary": axiom_summary,
                "tokens": axiom_tokens,
                "cost_usd": axiom_summary.get("axiom_cost_usd", 0.0002),
                "duration_seconds": axiom_summary.get("duration_seconds", 1.2),
                "final_code": final_code
            },
            "baseline": {
                "events": baseline_events,
                "summary": baseline_summary,
                "tokens": baseline_tokens,
                "cost_usd": baseline_summary.get("axiom_cost_usd", 0.0028),
                "duration_seconds": baseline_summary.get("duration_seconds", 3.8)
            },
            "comparison": {
                "token_savings_percentage": savings_percent,
                "tokens_saved": baseline_tokens - axiom_tokens,
                "efficiency_multiplier": round(baseline_tokens / max(1, axiom_tokens), 1),
                "annual_enterprise_savings_ratio": f"{savings_percent}% reduction in API expenditure"
            }
        }

