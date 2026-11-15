import asyncio
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from .config import settings
from .engine.ast_pruner import ASTCodePruner
from .engine.diff_engine import DiffEngine
from .engine.axiom_agent import AxiomAgent
from .engine.baseline_agent import BaselineReActAgent
from .benchmarks.challenges import BENCHMARK_TASKS
from .benchmarks.runner import BenchmarkRunner

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Axiom: Production Token-Budgeted Coding Agent Engine"
)

# Enable CORS for frontend Vite/React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BenchmarkRequest(BaseModel):
    task_id: str
    api_key: Optional[str] = None


class CustomTaskRequest(BaseModel):
    title: str
    description: str
    initial_code: str
    test_code: str
    api_key: Optional[str] = None
    budget: Optional[int] = 3000


class SkeletonizeRequest(BaseModel):
    code: str
    keep_docstrings: bool = True


class DiffRequest(BaseModel):
    original_code: str
    modified_code: str


@app.get("/api/health")
async def health_check():
    has_env_key = bool(settings.GEMINI_API_KEY)
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_api_configured": has_env_key,
        "active_model": settings.DEFAULT_MODEL,
        "default_token_budget": settings.DEFAULT_TOKEN_BUDGET,
        "hard_token_limit": settings.HARD_TOKEN_LIMIT
    }


@app.get("/api/tasks")
async def list_tasks():
    return BenchmarkRunner.get_available_tasks()


@app.post("/api/benchmark/run")
async def run_benchmark(req: BenchmarkRequest):
    try:
        active_key = req.api_key or settings.GEMINI_API_KEY
        result = BenchmarkRunner.run_benchmark(req.task_id, api_key=active_key)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/custom")
async def run_custom_task(req: CustomTaskRequest):
    try:
        active_key = req.api_key or settings.GEMINI_API_KEY
        agent = AxiomAgent(api_key=active_key, budget=req.budget or 3000)
        events = list(agent.run_task_stream(
            task_name=req.title,
            problem_description=req.description,
            initial_code=req.initial_code,
            test_code=req.test_code
        ))
        return {
            "title": req.title,
            "events": events,
            "summary": events[-1].get("summary", {}),
            "final_code": events[-1].get("final_code", req.initial_code)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ast/skeletonize")
async def skeletonize_code(req: SkeletonizeRequest):
    skeleton, meta = ASTCodePruner.skeletonize(req.code, keep_docstrings=req.keep_docstrings)
    symbols = ASTCodePruner.parse_symbols(req.code)
    return {
        "skeleton": skeleton,
        "metadata": meta,
        "symbols": [s.to_dict() for s in symbols]
    }


@app.post("/api/diff/preview")
async def preview_diff(req: DiffRequest):
    stats = DiffEngine.get_diff_stats(req.original_code, req.modified_code)
    return stats


@app.get("/api/stream/benchmark/{task_id}")
async def stream_benchmark(task_id: str, api_key: Optional[str] = None):
    """
    Real-time Server-Sent Events (SSE) streaming endpoint.
    Emits token telemetry, AST compression stages, diff applications, and test results.
    """
    task = BENCHMARK_TASKS.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    active_key = api_key or settings.GEMINI_API_KEY
    agent = AxiomAgent(api_key=active_key)

    async def event_generator():
        for event in agent.run_task_stream(
            task_name=task["name"],
            problem_description=task["description"],
            initial_code=task["initial_code"],
            test_code=task["test_code"]
        ):
            yield {
                "event": "telemetry",
                "data": json.dumps(event)
            }
            await asyncio.sleep(0.05)  # Smooth UI visualization stream

    return EventSourceResponse(event_generator())

# Mount frontend production dist if built
dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="static")

