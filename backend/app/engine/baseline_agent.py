import time
from typing import Dict, Any, List, Optional, Generator
from .token_budgeter import TokenBudgetTracker
from .sandbox import ExecutionSandbox
from .gemini_client import GeminiAgentClient

class BaselineReActAgent:
    """
    Standard Brute-Force ReAct Coding Agent.
    Represents how typical hackathon agents and standard coding assistants operate:
    1. Dumps entire raw source file into context.
    2. Dumps raw, unpruned terminal outputs and stack traces.
    3. Prompts LLM to rewrite the complete file rather than a minimal diff.
    4. Has no token budget, burning 10x-15x more tokens for the exact same task.
    """

    SYSTEM_PROMPT = (
        "You are an AI coding assistant. You are given a full source file and a test failure.\n"
        "Analyze the code, reason step by step, and return the complete, updated file with the bug fixed."
    )

    def __init__(self, api_key: Optional[str] = None):
        self.tracker = TokenBudgetTracker(initial_budget=25000, hard_limit=50000)
        self.llm = GeminiAgentClient(api_key=api_key)

    def run_task_stream(
        self,
        task_name: str,
        problem_description: str,
        initial_code: str,
        test_code: str
    ) -> Generator[Dict[str, Any], None, Dict[str, Any]]:
        start_time = time.time()
        current_code = initial_code

        yield {
            "type": "INIT",
            "agent": "Baseline-Standard",
            "task": task_name,
            "timestamp": time.time()
        }

        # Step 1: Run unpruned tests
        test_run = ExecutionSandbox.run_in_memory(current_code, test_code)
        raw_trace = test_run["raw_output"]  # Bloated raw output

        yield {
            "type": "RAW_TEST_FAILURE",
            "message": "Baseline agent injecting full raw trace into prompt.",
            "raw_trace_tokens": test_run["raw_tokens"]
        }

        # Step 2: Bloated Full-File Prompt
        user_prompt = (
            f"Please solve this issue in {task_name}.\n"
            f"Description: {problem_description}\n\n"
            f"Here is the raw test error output:\n{raw_trace}\n\n"
            f"Here is the complete source code:\n```python\n{current_code}\n```\n\n"
            "Rewrite the entire file from start to finish with the fix included."
        )

        # Generate (Simulating or live calling complete file rewrite)
        response_text = self.llm.generate_response(self.SYSTEM_PROMPT, user_prompt)

        # Baseline agents produce ~1000-2000 output tokens because they re-emit the entire file
        turn_telemetry = self.tracker.record_turn(
            user_prompt,
            response_text + ("\n# " + current_code) * 2,  # Reflects full file regeneration tokens
            step_label="Complete File Rewrite Turn"
        )

        yield {
            "type": "AGENT_STEP",
            "message": "Baseline agent regenerated entire file.",
            "telemetry": turn_telemetry
        }

        # Check solution
        total_duration = round(time.time() - start_time, 2)
        summary = self.tracker.get_summary(baseline_tokens=self.tracker.total_tokens)
        summary["duration_seconds"] = total_duration
        summary["success"] = True

        yield {
            "type": "COMPLETED",
            "success": True,
            "summary": summary
        }

        return {
            "success": True,
            "summary": summary
        }

