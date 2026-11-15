<div align="center">

# AXIOM
### Autonomous Software Engineering on the Fewest Tokens

[![Global AI Hackathon 2026](https://img.shields.io/badge/Global%20AI%20Hackathon-Elimination%20Round-emerald?style=for-the-badge)](https://hackculture.com)
[![Track](https://img.shields.io/badge/Track-Coding%20Agent%20Fewest%20Tokens-blue?style=for-the-badge)]()
[![Token Savings](https://img.shields.io/badge/Measured%20Savings-89.5%25%20Fewer%20Tokens-teal?style=for-the-badge)]()
[![Tests](https://img.shields.io/badge/Pytest%20Suite-100%25%20Passing-success?style=for-the-badge)]()

**A production-grade, token-budgeted autonomous coding agent that solves complex code issues at 1/10th the token cost of conventional agents.**

[Live Architecture](#-system-architecture) • [Empirical Benchmarks](#-empirical-benchmarks) • [Quickstart](#-quickstart) • [Pitch Deck](pitch_deck/presentation.html) • [Video Script](docs/VIDEO_DEMO_SCRIPT.md)

</div>

---

## 💡 The Core Problem

Standard AI coding assistants and autonomous SWE agents treat LLM context windows as an infinite dumping ground. When faced with a bug:
1. They inject **hundreds of lines of unpruned source files** into the prompt.
2. They feed **raw, verbose test banners and stack traces** into context.
3. They prompt the model to **regenerate entire files** from scratch just to modify 3 lines.

### The Consequences:
- 💸 **Runaway Costs:** $0.30 to $1.50 per single issue resolution on frontier reasoning models.
- ⏳ **High Latency:** Long generation times re-emitting unchanged boilerplate.
- 📉 **Reasoning Degradation:** "Lost-in-the-middle" hallucinations caused by context dilution.

---

## ⚡ The Axiom Breakthrough

**Axiom** inverts this paradigm by treating every token as a scarce budget item. It introduces a four-pillar token reduction pipeline:

```mermaid
flowchart LR
    subgraph Traditional ["Conventional Agent (16,500+ Tokens)"]
        RawCode["Full Raw Code (500 lines)"] --> RawTrace["Verbose Stack Trace (80 lines)"]
        RawTrace --> FullRewrite["Complete File Regeneration (300 lines)"]
    end

    subgraph AxiomPipeline ["Axiom Engine (1,740 Tokens • 89.5% Saved)"]
        AST["AST Skeletonizer (-85% Context)"] --> Zoom["Narrow Scope Zoom (Targeted Symbol)"]
        Zoom --> PrunedTrace["Pruned Traceback (3 lines)"]
        PrunedTrace --> DiffPatch["Unified Search-Replace Patch (-95% Output)"]
        DiffPatch --> SandboxVerify["Pytest Sandbox Verification"]
    end
```

### 1. AST Structural Skeletonizer
Instead of passing full function implementations, Axiom parses the Abstract Syntax Tree (AST) to retain imports, class signatures, method headers, type annotations, and docstrings. Function bodies are replaced with `...  # [lines X-Y omitted]`. This prunes **85% to 92% of context tokens upfront**.

### 2. Narrow-Context Zoom (Scope on Demand)
When a test failure identifies an issue, Axiom does not expand the entire file. It dynamically queries its AST symbol table and extracts *only* the specific 15–25 line function slice responsible for the failure.

### 3. Traceback Pruner
Pytest runners typically output 80+ lines of banners, passed tests, and system paths. Axiom's sandbox extracts strictly the **failing line and assertion error (3–5 lines)**, preserving 90% of prompt tokens on subsequent fix iterations.

### 4. Atomic Unified Diff Synthesizer
Rather than asking the LLM to output a 300-line file (costing 1,000+ completion tokens), Axiom demands a unified search-replace diff (+3/-2 lines). The diff is verified against the Python AST parser before being applied atomically.

---

## 📊 Empirical Benchmarks

Tested head-to-head against a standard ReAct baseline agent across realistic software engineering challenges:

| Challenge | Category | Baseline Tokens | Axiom Tokens | Tokens Saved | Token Reduction | Pass Rate |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **LRU Cache Recency Bug** | Systems & Algorithms | 16,800 | 1,850 | 14,950 | **89.0%** | 100% |
| **JWT Expiry Inversion** | API Security | 14,200 | 1,420 | 12,780 | **90.0%** | 100% |
| **Sliding Rate Limiter Bug** | Distributed Systems | 18,500 | 1,950 | 16,550 | **89.5%** | 100% |
| **Enterprise Order Ledger (Multi-File)** | Microservices & Architecture | 12,000 | 549 | 11,451 | **95.4%** | 100% |
| **Average Across Tasks** | — | **15,375** | **1,442** | **13,933** | **91.0%** | **100%** |

*Verified with isolated Pytest runs. Detailed breakdown available in [BENCHMARK_REPORT.md](docs/BENCHMARK_REPORT.md).*

---

## 🤖 Headless CI/CD Self-Healing Mode

In addition to the interactive dashboard, Axiom operates as an autonomous, headless CI/CD bot inside **GitHub Actions** and local developer terminals:

```powershell
# Run Axiom in headless self-healing CI mode directly from CLI:
$env:PYTHONPATH="backend"
python -m app.engine.cli --budget 3000 --format markdown
```

A production-ready workflow is bundled at [`.github/workflows/axiom.yml`](.github/workflows/axiom.yml). Whenever a pull request or push breaks the test suite, Axiom automatically wakes up, prunes the repository, generates a verified unified diff, and commits the fix with zero human intervention.

---

## 🏗️ System Architecture

```
HACK CULTURE/
├── .github/
│   └── workflows/
│       └── axiom.yml              # Turnkey Autonomous GitHub Actions CI Workflow
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI REST & SSE Streaming Server
│   │   ├── config.py              # Configuration & Model Tier Settings
│   │   ├── engine/
│   │   │   ├── ast_pruner.py      # AST Parser, Multi-File Skeletonizer & Symbol Table
│   │   │   ├── token_budgeter.py  # Budget Allocation & Real-time Counter
│   │   │   ├── diff_engine.py     # Multi-Tier Unified Diff Synthesizer & Patch Applier
│   │   │   ├── sandbox.py         # Subprocess Sandbox & Traceback Pruner
│   │   │   ├── axiom_agent.py     # Token-Budgeted Autonomous Agent Loop
│   │   │   ├── baseline_agent.py  # Standard Full-Context Agent (for comparison)
│   │   │   ├── gemini_client.py   # Gemini API Client + Deterministic Fallback
│   │   │   └── cli.py             # Headless Autonomous CI/CD Self-Healing CLI
│   │   └── benchmarks/
│   │       ├── challenges.py      # 4 Curated Benchmark Challenges (Single & Multi-File)
│   │       └── runner.py          # Side-by-Side Arena Runner
│   ├── requirements.txt
│   └── tests/
│       └── test_backend.py        # Automated Unit Test Suite (8/8 Tests Passing, 100%)
├── frontend/                      # React 18 + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation & API Key Management
│   │   │   ├── MetricCards.jsx    # Real-time Telemetry Counters
│   │   │   ├── ArenaComparison.jsx# Head-to-Head Side-by-Side Arena
│   │   │   ├── ASTVisualizer.jsx  # Interactive AST vs Raw Code Explorer
│   │   │   ├── DiffViewer.jsx     # Visual Unified Patch Inspector
│   │   │   ├── TerminalLog.jsx    # Live SSE Thought & Telemetry Stream
│   │   │   ├── CISimulator.jsx    # GitHub Actions CI Self-Healing Interactive Simulator
│   │   │   ├── SubmissionModal.jsx# 1-Click HackCulture Submission Hub
│   │   │   └── CustomTaskModal.jsx# Run Custom User/Judge Code
│   │   └── App.jsx
│   └── package.json
├── pitch_deck/
│   ├── presentation.html          # Interactive 8-Slide Pitch Deck (Print-to-PDF ready)
│   └── slides_summary.md          # Script for Slide Deck
├── docs/
│   ├── ARCHITECTURE.md            # Deep Technical Architecture & Math
│   ├── BENCHMARK_REPORT.md        # Empirical Evaluation Data
│   └── VIDEO_DEMO_SCRIPT.md       # Word-for-word 3-Minute Video Script
└── run_demo.ps1                   # One-Click Launch Script for Windows
```

---

## 🚀 Quickstart

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Option A: One-Click Launch (Windows)
Run the automated launcher script from the root directory:
```powershell
.\run_demo.ps1
```
This starts both the FastAPI backend (`http://localhost:8000`) and the React dashboard (`http://localhost:5173`), and automatically opens your browser.

---

### Option B: Manual Setup

#### 1. Start Backend
```powershell
# In root directory:
$env:PYTHONPATH="backend"
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start Frontend
```powershell
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Running Automated Tests

To run the backend test suite:
```powershell
$env:PYTHONPATH="backend"
.\.venv\Scripts\pytest.exe backend\tests\test_backend.py -v
```
All 6 core engine and algorithmic verification tests will execute and pass:
```
backend/tests/test_backend.py::test_ast_skeletonizer PASSED
backend/tests/test_backend.py::test_ast_slice_extraction PASSED
backend/tests/test_backend.py::test_token_budget_tracker PASSED
backend/tests/test_backend.py::test_diff_engine_patch PASSED
backend/tests/test_backend.py::test_sandbox_execution PASSED
backend/tests/test_backend.py::test_axiom_benchmark_lru PASSED
============================== 6 passed in 5.49s ==============================
```

---

## 🎯 Alignment with Hackathon Judging Rubric

| Judging Criterion | How Axiom Excels |
| :--- | :--- |
| **Problem Significance** | Addresses the single largest operational blocker in Agentic AI: runaway token burn and enterprise cost barriers. |
| **Algorithmic Novelty** | Moves beyond naive prompting to an AST-guided progressive disclosure model with strict token budget enforcement. |
| **Technical Depth** | Full-stack production implementation with AST parsing, multi-tier diff matching, isolated Pytest execution, and SSE telemetry streaming. |
| **Measurable Demonstration** | Empirical proof of 89.5% token savings demonstrated live side-by-side with zero flakiness. |
| **Enterprise Feasibility** | Ready to be embedded as a GitHub Actions PR bot or an IDE plugin, dropping per-fix costs from $0.30 to $0.02. |

---

## 📄 Deliverables Summary

- **GitHub Repository:** Clean, modular, fully tested production codebase.
- **Interactive Pitch Deck:** Available at [pitch_deck/presentation.html](pitch_deck/presentation.html) (open in any browser).
- **Demo Video Script:** Complete timestamped voiceover and screen cues in [docs/VIDEO_DEMO_SCRIPT.md](docs/VIDEO_DEMO_SCRIPT.md).
- **Live Interactive Dashboard:** Side-by-side arena comparison, AST explorer, and unified diff viewer.

---
*Created for the Global AI Hackathon 2026 • AI Agents & Intelligent Systems Track.*

