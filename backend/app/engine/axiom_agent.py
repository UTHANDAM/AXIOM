import time
import json
from typing import Dict, Any, List, Optional, Generator, Callable

from .ast_pruner import ASTCodePruner
from .token_budgeter import TokenBudgetTracker
from .diff_engine import DiffEngine
from .sandbox import ExecutionSandbox
from .gemini_client import GeminiAgentClient

class AxiomAgent:
    """
    Axiom: Autonomous Token-Budgeted Coding Agent.
    Executes software engineering tasks on a strictly budgeted token footprint
    using AST Skeletonization, Narrow-Context Zoom, and Unified Diff Patching.
    """

    SYSTEM_PROMPT = (
        "You are Axiom, the world's most token-efficient autonomous software engineering agent.\n"
        "Your prime directive: SOLVE THE PROBLEM WITH THE FEWEST TOKENS POSSIBLE.\n"
        "Rules:\n"
        "1. Never output complete files or re-write untouched code.\n"
        "2. Output ONLY minimal search-replace blocks in the exact format:\n"
        "   <<<<<<< SEARCH\n"
        "   exact_old_code\n"
        "   =======\n"
        "   minimal_new_code\n"
        "   >>>>>>> REPLACE\n"
        "3. Prioritize exact correctness, clean edge-case handling, and minimal token overhead."
    )

    def __init__(self, api_key: Optional[str] = None, budget: int = 3000):
        self.tracker = TokenBudgetTracker(initial_budget=budget)
        self.llm = GeminiAgentClient(api_key=api_key)

    def run_task_stream(
        self,
        task_name: str,
        problem_description: str,
        initial_code: str,
        test_code: str,
        max_iterations: int = 3
    ) -> Generator[Dict[str, Any], None, Dict[str, Any]]:
        """
        Runs the token-budgeted problem-solving loop, yielding real-time SSE telemetry events.
        """
        start_time = time.time()
        current_code = initial_code

        # Yield Start Event
        yield {
            "type": "INIT",
            "agent": "Axiom",
            "task": task_name,
            "budget": self.tracker.initial_budget,
            "timestamp": time.time()
        }

        # Step 1: AST Skeletonization
        skeleton, ast_meta = ASTCodePruner.skeletonize(current_code)
        raw_code_tokens = TokenBudgetTracker.count_tokens(current_code)
        skeleton_tokens = TokenBudgetTracker.count_tokens(skeleton)

        yield {
            "type": "AST_PRUNE",
            "message": f"AST Skeletonizer compressed code context from {raw_code_tokens} to {skeleton_tokens} tokens ({ast_meta.get('savings_ratio', 0)}% savings).",
            "raw_tokens": raw_code_tokens,
            "skeleton_tokens": skeleton_tokens,
            "symbols_count": ast_meta.get("symbols_count", 0),
            "skeleton_preview": skeleton[:400] + "..." if len(skeleton) > 400 else skeleton
        }

        # Step 2: Initial Sandbox Test Execution
        test_run = ExecutionSandbox.run_in_memory(current_code, test_code)
        if test_run["passed"]:
            yield {
                "type": "SUCCESS",
                "message": "Initial code already passes all test suites.",
                "metrics": self.tracker.get_summary()
            }
            return {"success": True, "code": current_code, "metrics": self.tracker.get_summary()}

        yield {
            "type": "TEST_FAILURE",
            "message": "Baseline test failure identified. Traceback pruned to minimal tokens.",
            "pruned_trace": test_run["pruned_trace"],
            "raw_trace_tokens": test_run["raw_tokens"],
            "pruned_trace_tokens": test_run["pruned_tokens"]
        }

        iteration = 0
        success = False

        while iteration < max_iterations and not self.tracker.is_budget_exceeded:
            iteration += 1

            # Dynamic Context Zoom: Find likely failing symbol or line
            symbols = ASTCodePruner.parse_symbols(current_code)
            context_snippet = skeleton

            # Identify if specific function was named in pruned trace
            for sym in symbols:
                if sym.name.lower() in test_run["pruned_trace"].lower():
                    targeted_slice = ASTCodePruner.extract_symbol_slice(current_code, sym.name)
                    if targeted_slice:
                        context_snippet = f"{skeleton}\n\n# TARGETED FOCUS SLICE:\n{targeted_slice}"
                        yield {
                            "type": "CONTEXT_ZOOM",
                            "message": f"Zoomed in on specific symbol `{sym.name}` (lines {sym.start_line}-{sym.end_line}) to minimize prompt overhead.",
                            "symbol": sym.name
                        }
                        break

            # Prompt Construction with strict token guidance
            user_prompt = (
                f"TASK: Fix bug in {task_name}.\n"
                f"REQUIREMENT: {problem_description}\n"
                f"FAILING TRACE:\n{test_run['pruned_trace']}\n\n"
                f"CODE CONTEXT:\n{context_snippet}\n\n"
                f"TOKEN BUDGET REMAINING: {self.tracker.initial_budget - self.tracker.total_tokens} tokens.\n"
                "Provide ONLY the search-replace patch block."
            )

            # Record Prompt & Generate
            turn_start = time.time()
            response_text = self.llm.generate_response(self.SYSTEM_PROMPT, user_prompt)

            # Telemetry update
            turn_telemetry = self.tracker.record_turn(
                user_prompt,
                response_text,
                step_label=f"Iteration {iteration} Patch Generation"
            )

            yield {
                "type": "AGENT_STEP",
                "iteration": iteration,
                "thought": response_text.split("ACTION:")[0].replace("THOUGHT:", "").strip() if "THOUGHT:" in response_text else "Synthesizing minimal patch...",
                "telemetry": turn_telemetry
            }

            # Step 3: Parse and Apply Patch
            patches = DiffEngine.parse_patch_instructions(response_text)
            if not patches:
                yield {
                    "type": "PATCH_WARNING",
                    "message": "No valid search-replace blocks found. Attempting secondary token-efficient parse."
                }
                break

            patch_applied = False
            for search_b, replace_b in patches:
                ok, new_code, err = DiffEngine.apply_search_replace_block(current_code, search_b, replace_b)
                if ok:
                    current_code = new_code
                    patch_applied = True
                    diff_stats = DiffEngine.get_diff_stats(initial_code, current_code)

                    yield {
                        "type": "PATCH_APPLIED",
                        "message": f"Patch applied cleanly! Diff: +{diff_stats['lines_added']} / -{diff_stats['lines_removed']} lines.",
                        "diff_stats": diff_stats
                    }
                    break
                else:
                    yield {
                        "type": "PATCH_REJECTED",
                        "message": f"Patch application failed: {err}"
                    }

            if not patch_applied:
                continue

            # Step 4: Re-verify in Sandbox
            test_run = ExecutionSandbox.run_in_memory(current_code, test_code)
            if test_run["passed"]:
                success = True
                yield {
                    "type": "TEST_SUCCESS",
                    "message": "VERIFIED! All tests passing with 100% assertion accuracy.",
                    "duration": test_run["duration_seconds"]
                }
                break
            else:
                yield {
                    "type": "TEST_RETRY",
                    "message": f"Iteration {iteration} tests failed. Pruning trace for next iteration.",
                    "pruned_trace": test_run["pruned_trace"]
                }

        total_duration = round(time.time() - start_time, 2)
        summary = self.tracker.get_summary()
        summary["duration_seconds"] = total_duration
        summary["success"] = success

        yield {
            "type": "COMPLETED",
            "success": success,
            "final_code": current_code,
            "summary": summary
        }

        return {
            "success": success,
            "final_code": current_code,
            "summary": summary
        }

