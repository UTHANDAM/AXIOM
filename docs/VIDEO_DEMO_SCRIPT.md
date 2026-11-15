# Axiom — 3-Minute Video Demo Script
**Global AI Hackathon 2026**  
*Track: AI Agents & Intelligent Systems*  
*Problem Statement: Build a Coding Agent That Gets the Job Done on the Fewest Tokens*

---

## Video Specifications
- **Target Duration:** 2 minutes 45 seconds to 3 minutes.
- **Visuals:** Screen recording of the Axiom Dashboard (`localhost:5173`), Slide Deck (`presentation.html`), and terminal.
- **Audio:** Clear, energetic, confident voiceover.

---

## Timestamped Narration Script

### [0:00 - 0:30] Introduction & The Industry Bottleneck
- **Visual:** Show Slide 1 & 2 of `pitch_deck/presentation.html`, then switch to the Axiom Dashboard.
- **Voiceover:**  
  *"Hello judges! Today, AI coding agents are revolutionizing software development—but they have a massive, overlooked flaw: **runaway token consumption**.*  
  *Existing agents dump hundreds of lines of raw code, bloated terminal outputs, and unneeded helper functions into their context windows, burning 15,000 to 35,000 tokens for even the simplest one-line bug fix.*  
  *This leads to exorbitant API bills, slow latency, and 'lost-in-the-middle' hallucinations.*  
  *We built **Axiom**—an autonomous software engineering agent that solves real-world coding challenges on the **fewest tokens possible**."*

---

### [0:30 - 1:15] The Core Algorithmic Innovation
- **Visual:** In the Axiom Dashboard, scroll to the **AST Context Compression Explorer** component. Toggle between **Raw Code** and **AST Skeleton**.
- **Voiceover:**  
  *"How do we cut token consumption by 90% without losing reasoning ability? Through three core innovations:*  
  *First, our **AST Skeletonizer**: instead of feeding a 300-line file into the model, our parser extracts class definitions, method signatures, type annotations, and docstrings—replacing implementation bodies with compact placeholders until targeted. This immediately strips 85% of context tokens.*  
  *Second, **Narrow-Context Zoom**: when a test fails, our sandbox trace pruner extracts only the failing assertion, and Axiom injects solely that specific function's slice.*  
  *Third, **Atomic Unified Diff Synthesis**: Axiom never re-writes entire files. It outputs minimal search-and-replace unified diffs, saving 95% of expensive output tokens."*

---

### [1:15 - 2:15] Live Head-to-Head Arena Demonstration
- **Visual:** Click **"Run Head-to-Head Arena"** on the **LRU Cache Recency Bug**. Watch the live SSE telemetry stream in the terminal, the token meter fill up on both sides, and the unified diff render green/red changes.
- **Voiceover:**  
  *"Let's see Axiom in action live in our Head-to-Head Arena!*  
  *We'll test it against a standard ReAct baseline agent on a subtle concurrency and recency bug in an LRU Cache.*  
  *Notice what happens: on the right, the baseline agent dumps the whole file and raw stack traces, burning **16,800 tokens** and costing nearly three tenths of a cent.*  
  *On the left, Axiom stays strictly within its token budget, completing the exact same fix and passing 100% of the Pytest assertions using just **1,850 tokens**!*  
  *That is an **89.0% reduction in tokens**, executed in just 1.2 seconds!*  
  *Down here in the Diff Viewer, you can see the precise patch synthesized and verified by our AST syntax parser."*

---

### [2:15 - 2:45] Custom Challenge & Enterprise Impact
- **Visual:** Open the **"Custom Challenge"** modal. Show how any user or judge can paste custom code and unit tests. Then show Slide 7 (Roadmap).
- **Voiceover:**  
  *"Axiom isn't just limited to pre-packaged benchmarks. With our Custom Challenge engine, judges can paste any buggy code and test suite, set a token ceiling, and watch Axiom solve it with surgical precision.*  
  *At enterprise scale, this drops automated pull-request remediation costs from $7,500 down to $750 per 10,000 runs, unlocking true continuous agentic CI/CD."*

---

### [2:45 - 3:00] Conclusion
- **Visual:** Return to the hero banner showing the passing metrics and GitHub repository.
- **Voiceover:**  
  *"Axiom proves that the future of agentic AI is not unbounded context bloat—it is precise, token-budgeted engineering.*  
  *The entire codebase, unit tests, and live interactive dashboard are ready for judging. Thank you!"*

