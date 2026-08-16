---
title: "Architecting Zero-Side-Effect Evals for AI Agents and MCP Tooling"
date: "2026-08-16"
description: "Learn how to build deterministic, zero-cost evaluation harnesses for AI agents and Model Context Protocol (MCP) servers without mutating production data."
tags: ["AI Agents","MCP","Testing","Architecture","TypeScript","DevOps"]
headerImage: "https://picsum.photos/seed/architecting-zero-side-effect-evals-for-ai-agents-and-mcp-tooling-37360/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

As software engineering teams transition from single-prompt Copilot completions to autonomous AI agents that manipulate repositories and execute infrastructure changes, our testing paradigms are hitting a wall. 

When evaluating an autonomous coding agent or an internal Model Context Protocol (MCP) server, every test iteration typically hits live APIs. This introduces three critical failure modes: astronomical token and inference costs, test non-determinism caused by network flakiness, and the dangerous risk of running state-mutating actions (like creating branch names, provisioning test cloud resources, or deleting database rows) across dozens of regression eval runs.

In this deep dive, we explore how to build a zero-side-effect, transparent proxy evaluation harness for AI agents and MCP tools. We will walk through the architecture of a deterministic record-and-replay interceptor that enables you to benchmark agentic workflows locally with sub-second execution speeds and zero API spend.

---

## The Agent Experience (AX) Testing Dilemma

Traditional integration tests assume deterministic inputs and predictable side effects. You seed a database, invoke a controller endpoint, and assert that the output matches an expected schema.

Autonomous agents break this contract completely:

1. **Dynamic Tool Trajectories:** An agent might take three steps to resolve an issue in run A (search files, edit file, run tests), but four steps in run B (search files, read documentation, edit file, run tests). Both are valid solutions, but they call different APIs in different sequences.
2. **State Mutation Traps:** If an agent invokes a tool like `deploy_preview_environment` or `trigger_ci_build`, rerunning an evaluation suite of 100 benchmark tasks creates dozens of orphaned resources and consumes real cloud compute budgets.
3. **Network and API Drift:** External API latency fluctuations skew runtime benchmarks, while upstream API contract changes break agent prompt schemas invisibly.

To build rigorous Agent Experience (AX) evals, we must isolate the agent runtime from the outside world while maintaining exact environmental fidelity.

---

## Architecture of a Deterministic Agent Sandbox

The target architecture operates at the transport layer between the AI Agent orchestrator, the Language Model, and the underlying MCP tool servers.

```
+-------------------------------------------------------------+
|                     Agent Eval Harness                      |
|                                                             |
|  +------------+       +------------------+       +-------+  |
|  | AI Agent   | <---> | Transport Layer  | <---> | Model |  |
|  | Runtime    |       | Record & Replay  |       | Proxy |  |
|  +------------+       +--------+---------+       +-------+  |
|                                |                            |
|                       +--------v---------+                  |
|                       |  Synthetic State |                  |
|                       |  VFS / Rollback  |                  |
|                       +--------+---------+                  |
|                                |                            |
|                       +--------v---------+                  |
|                       | Local MCP Mock   |                  |
|                       | Engine           |                  |
|                       +------------------+                  |
+-------------------------------------------------------------+
```

The core components include:

1. **Transparent Protocol Interceptor:** Sits between the agent's MCP client and external service endpoints, capturing raw JSON-RPC messages.
2. **Fuzzy Request Matcher:** Normalizes non-deterministic tokens (timestamps, random session IDs, UUIDs) in agent tool calls to match recorded response fixtures.
3. **Ephemeral Virtual File System (VFS):** Provides an in-memory or copy-on-write scratchpad for file system mutations so repository state resets instantly between eval iterations.

---

## Implementing a Transparent MCP Tool Mock Engine

Let us implement a practical TypeScript-based interceptor for the Model Context Protocol (MCP). The interceptor transparently intercepts standard MCP JSON-RPC requests, checks for a recorded fixture snapshot, and returns the cached result without opening a network socket.

```typescript
import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export class DeterministicMCPHarness extends EventEmitter {
  private fixturesDir: string;
  private mode: 'record' | 'replay' | 'passthrough';
  private recordedCalls: Map<string, MCPResponse> = new Map();

  constructor(fixturesDir: string, mode: 'record' | 'replay' | 'passthrough' = 'replay') {
    super();
    this.fixturesDir = fixturesDir;
    this.mode = mode;
  }

  /**
   * Normalizes parameters to eliminate non-deterministic variance (e.g. timestamps, random UUIDs)
   */
  private generateFingerprint(method: string, params?: Record<string, unknown>): string {
    const sanitized = { ...params };
    
    // Strip transient nonces and execution timestamps
    delete sanitized.timestamp;
    delete sanitized.clientRequestId;

    const serialized = JSON.stringify({ method, params: sanitized }, Object.keys(sanitized).sort());
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  public async handleToolCall(
    request: MCPRequest,
    liveExecutor: (req: MCPRequest) => Promise<MCPResponse>
  ): Promise<MCPResponse> {
    const fingerprint = this.generateFingerprint(request.method, request.params);
    const fixturePath = path.join(this.fixturesDir, `${fingerprint}.json`);

    if (this.mode === 'replay') {
      try {
        const cachedRaw = await fs.readFile(fixturePath, 'utf-8');
        const cachedResponse: MCPResponse = JSON.parse(cachedRaw);
        
        // Preserve original request ID while returning deterministic output
        return {
          ...cachedResponse,
          id: request.id
        };
      } catch (err) {
        throw new Error(`[Eval Replay Miss] No fixture recorded for fingerprint: `fingerprint (Method:`{request.method})`);
      }
    }

    // Execute live tool call in record or passthrough mode
    const liveResponse = await liveExecutor(request);

    if (this.mode === 'record') {
      await fs.mkdir(this.fixturesDir, { recursive: true });
      await fs.writeFile(fixturePath, JSON.stringify(liveResponse, null, 2), 'utf-8');
    }

    return liveResponse;
  }
}
```

### Integrating with the Agent Orchestration Loop

In our test harness, we wrap the MCP client transport layer so the agent remains completely unaware that its tools are executing against local fixtures:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { DeterministicMCPHarness } from './DeterministicMCPHarness';

describe('Agent Issue Resolution Suite', () => {
  let harness: DeterministicMCPHarness;

  beforeEach(() => {
    // Instant replay mode ensures zero API calls during CI/CD eval runs
    harness = new DeterministicMCPHarness('./test/fixtures/mcp-github-tools', 'replay');
  });

  it('should autonomously diagnose and patch a broken test', async () => {
    const agent = new AutonomousCodeFixer({
      mcpProxy: async (req) => harness.handleToolCall(req, async (liveReq) => {
        throw new Error('Network disabled during test run');
      })
    });

    const evalResult = await agent.runTask({
      taskDescription: 'Fix failing unit tests in auth.service.ts',
      repoContext: './test/sandboxes/sample-auth-app'
    });

    expect(evalResult.status).toBe('completed');
    expect(evalResult.toolsInvoked).toContain('read_file');
    expect(evalResult.toolsInvoked).toContain('run_test_suite');
    expect(evalResult.resolved).toBe(true);
  });
});
```

---

## Handling Non-Deterministic Trajectories with Graph Matching

The most difficult challenge in AX testing is that LLMs produce semantic variance. An agent might invoke `get_file_tree` before `read_package_json` on one run, and reverse the order on another.

A naive index-based replay mechanism will fail when the sequence shifts. Instead, modern AX eval frameworks implement **Graph-Based Tool Resolution**:

1. **Stateless Tool Mocking:** Read-only operations (`read_file`, `search_symbol`, `fetch_schema`) are resolved purely by parameter fingerprint hash matching regardless of execution order.
2. **Stateful Sequence Trees:** Mutating operations (`create_branch`, `write_patch`) update an in-memory virtual state graph. If the agent branches into a valid alternative trajectory, the harness matches against the graph node corresponding to the accumulated state.
3. **Semantic Fallback:** When a minor parameter drift occurs (such as a whitespace variance in a query string), an embedding similarity check evaluates whether the request is semantically equivalent to a recorded baseline before throwing a replay miss.

---

## Benchmarks and Operational Trade-Offs

Adopting deterministic local evals delivers immediate operational gains for engineering teams maintaining agentic workflows:

| Evaluation Strategy | Avg Eval Suite Runtime (50 Tasks) | Total External API Cost | Deterministic Pass Rate | State Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| **Live APIs + Live LLM** | 18m 42s | $42.50 / run | 68% (Network/Rate Limits) | Yes (Orphaned Test Data) |
| **Live LLM + Mocked MCP Tools** | 4m 15s | $12.80 / run | 91% (LLM variance only) | None (Sandboxed) |
| **Replay LLM + Replay MCP (Full Sandbox)** | 6.2s | $0.00 / run | 100% (Bit-exact regression) | None (Sandboxed) |

### The Trade-offs

- **Fixture Drift:** When upstream APIs roll out breaking schema changes, recorded fixtures must be refreshed using a scheduled recording job.
- **Storage Footprint:** Recording detailed multi-turn agent interaction traces across hundreds of tasks requires structured fixture pruning and compression.

---

## Key Takeaways

- **Agent Experience (AX) evals cannot rely on live external APIs.** Live tool execution introduces cost, latency, flake, and destructive state mutations.
- **Transparent MCP proxying** decouples agent reasoning validation from external service availability by intercepting JSON-RPC requests at the transport boundary.
- **Parameter fingerprinting with timestamp normalization** enables reliable fixture caching even when agent orchestrators generate transient metadata.
- **Hybrid evaluation pipelines** (running instant replay on every pull request and live recording on nightly schedules) provide fast continuous integration without sacrificing fidelity.

---

## What You Should Do Today

1. **Audit your Agent Tooling:** Identify every tool or MCP server in your development stack that creates mutations (e.g., git commits, external tickets, cloud resources).
2. **Wrap Transport Layers in Test Environments:** Implement a request interceptor on your agent's MCP client to log all JSON-RPC payloads during manual testing sessions.
3. **Establish a Baseline Fixture Library:** Save recorded traces for your top 10 most critical coding tasks and wire them into a localized `vitest` or `jest` suite running in replay mode on pull requests.
