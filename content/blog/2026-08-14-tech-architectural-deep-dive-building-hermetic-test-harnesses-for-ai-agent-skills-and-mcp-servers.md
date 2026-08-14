---
title: "Architectural Deep-Dive: Building Hermetic Test Harnesses for AI Agent Skills and MCP Servers"
date: "2026-08-14"
description: "Learn how to build transparent mock layers and deterministic AX evaluation suites for tool-calling AI agents and MCP servers without mutating production data."
tags: ["ai-agents","testing","mcp","architecture","devops"]
headerImage: "https://picsum.photos/seed/architectural-deep-dive-building-hermetic-test-harnesses-for-ai-agent-skills-and-mcp-servers-77388/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

Building autonomous AI agents with tool-calling capabilities is straightforward in a weekend prototype. The wheels come off the moment you try to build a robust Continuous Integration (CI) and evaluation pipeline for them.

Every time your agent executes an evaluation run, it needs to invoke tools: querying search engines, reading GitHub issues, modifying database records, or issuing API calls over the Model Context Protocol (MCP). If your test harness hits real endpoints, you burn money, encounter rate limits, and risk mutating production or staging state with hallucinated parameters. If you rely on basic unit mocks, you destroy the non-deterministic reasoning loop that makes agents work in the first place.

This breakdown explores how to architect a **hermetic Agent Experience (AX) test harness**: an intercepting, stateful virtualization layer that lets you evaluate agents and MCP servers locally, deterministically, and without hitting external APIs.

---

## The Failure Modes of Naive Agent Testing

When evaluating conventional software, deterministic inputs yield deterministic outputs. With LLM-based agents, testing requires handling two distinct layers of non-determinism:

1. **The Reasoning Layer:** The model decides *which* tool to call and with *what* arguments based on system prompts and conversation history.
2. **The Environment Layer:** The external systems return dynamic responses, errors, or partial states that feed back into the agent's next step.

Standard mock frameworks (like `jest.mock()` or Sinon) fail here. If an agent decides to rephrase a search query from `"find order 1234"` to `"order_id:1234"`, static equality matchers fail immediately. Conversely, if you let the agent talk to live staging APIs, you cannot reliably reproduce a multi-step sequence where step 3 returns a 429 Rate Limit error.

To build real **Agent Experience (AX) evals**, you need a system that virtualizes tool responses while preserving stateful dependencies across multi-turn trajectories.

---

## The Architecture of an Intercepting AX Sandbox

A resilient AX eval harness sits between the agent runtime (e.g., LangChain, AutoGen, custom orchestration loop) and the MCP servers. It contains three core components:

```
+-------------------------------------------------------------+
|                        Agent Runtime                        |
|      (LLM reasoning loop, prompt templates, tool choice)     |
+------------------------------+------------------------------+
                               |
                    Tool Call Request (JSON-RPC)
                               v
+-------------------------------------------------------------+
|                 Hermetic AX Proxy / Interceptor             |
|  - Fuzzy Semantic Matcher (handles query variation)         |
|  - Ephemeral Virtual State Engine (in-memory SQLite/KV)     |
|  - Deterministic Chaos Injector (latency, 5xx, schema drift)|
+------------------------------+------------------------------+
                               |
               +---------------+---------------+
               |                               |
               v                               v
      [Synthetic State Engine]     [Golden Fixture Replay]
```

1. **Ephemeral Virtual State Engine:** Instead of mocking API functions individually, we back the mock layer with an in-memory transactional database (like SQLite or DuckDB). Read tools query this state; write tools mutate it.
2. **Fuzzy Fixture Replayer:** For read-only external endpoints (e.g., documentation lookups, third-party search), the proxy compares embeddings of incoming queries against a local cassette of recorded responses.
3. **Deterministic Fault Injector:** Simulates API degradation, partial payloads, and MCP protocol errors to verify the agent's self-healing loops.

---

## Implementing a Transparent MCP Virtualization Layer

Let's write a practical Node.js/TypeScript interceptor for an MCP server client. We will create a harness that simulates an issue-tracking toolset without network I/O.

### Step 1: Defining the In-Memory State Model

```typescript
import { Database } from "bun:sqlite";

export class VirtualEnvironment {
  private db: Database;

  constructor() {
    this.db = new Database(":memory:");
    this.init();
  }

  private init() {
    this.db.run(`
      CREATE TABLE issues (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'closed')),
        assignee TEXT
      );
    `);
    
    // Seed baseline state for the eval scenario
    this.db.run(
      `INSERT INTO issues VALUES ('ISSUE-101', 'Fix memory leak in auth worker', 'open', NULL)`
    );
  }

  public query(sql: string, params: any[] = []) {
    return this.db.query(sql).all(...params);
  }

  public execute(sql: string, params: any[] = []) {
    return this.db.run(sql, ...params);
  }
}
```

### Step 2: The Intercepting Tool Dispatcher

Now, we implement the MCP tool proxy. Instead of forwarding calls over STDIO or WebSockets to a live server, the proxy dispatches calls against the `VirtualEnvironment`.

```typescript
export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export class MockMCPDispatcher {
  constructor(private env: VirtualEnvironment) {}

  async dispatch(call: ToolCall): Promise<ToolResult> {
    switch (call.name) {
      case "get_issue": {
        const { id } = call.arguments;
        const rows = this.env.query("SELECT * FROM issues WHERE id = ?", [id]);
        if (rows.length === 0) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: Issue ${id} not found.` }],
          };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(rows[0]) }],
        };
      }

      case "update_issue_status": {
        const { id, status } = call.arguments;
        if (!["open", "in_progress", "closed"].includes(status)) {
          return {
            isError: true,
            content: [{ type: "text", text: `Invalid status: ${status}` }],
          };
        }

        this.env.execute("UPDATE issues SET status = ? WHERE id = ?", [status, id]);
        return {
          content: [{ type: "text", text: `Issue `id updated to`{status}.` }],
        };
      }

      default:
        throw new Error(`Tool ${call.name} not registered in test harness.`);
    }
  }
}
```

---

## Writing Graded Assertions for Agent Trajectories

Traditional unit tests assert: `expect(output).toEqual(expected)`. With agents, you must evaluate **trajectories**: did the agent reach the goal using a sound, cost-effective path?

Here is how you structure a deterministic evaluation test case:

```typescript
import { describe, it, expect, beforeEach } from "vitest";

describe("Agent Trajectory: Issue Resolution Workflow", () => {
  let env: VirtualEnvironment;
  let dispatcher: MockMCPDispatcher;

  beforeEach(() => {
    env = new VirtualEnvironment();
    dispatcher = new MockMCPDispatcher(env);
  });

  it("should inspect ISSUE-101 and transition status to in_progress", async () => {
    const agent = new AutonomousDevAgent({ dispatcher });
    
    const trajectory = await agent.run(
      "Pick up the open memory leak issue and mark it as in progress."
    );

    // 1. Structural Trajectory Assertion: Max step count constraint
    expect(trajectory.steps.length).toBeLessThanOrEqual(3);

    // 2. Behavioral Assertion: Verify correct tool sequence was attempted
    const toolNames = trajectory.steps.map((s) => s.toolCall.name);
    expect(toolNames).toEqual(["get_issue", "update_issue_status"]);

    // 3. State Assertion: Check persistent side effects in the virtual engine
    const updatedIssue = env.query("SELECT * FROM issues WHERE id = 'ISSUE-101'")[0] as any;
    expect(updatedIssue.status).toBe("in_progress");
  });
});
```

---

## Handling Non-Deterministic Natural Language Tools with Fuzzy Matching

What happens when an agent searches documentation before taking action? You cannot hardcode SQL for dynamic documentation queries.

Instead of calling live vector databases during CI, use a **pre-computed local vector cassette**:

1. Run the agent once in record mode against live doc APIs.
2. Store pairs of `(query_embedding, response_markdown)` in a local JSON fixture.
3. During evaluation, compute the cosine similarity between the agent's runtime query and cached queries.
4. If similarity is greater than or equal to 0.88, return the cached result. Otherwise, return a synthetic 404 or prompt the agent to refine its query.

This prevents minor phrasing changes in the model's output from breaking your automated test suites while completely isolating your CI runners from the internet.

---

## Key Takeaways

- **Live API testing is an anti-pattern in agent CI:** It incurs uncontrolled costs, hits rate limits, and introduces non-deterministic network noise into your evaluation metrics.
- **Static mocks break agent reasoning:** Hardcoded parameter matchers fail when models rephrase queries or dynamically choose different tool argument structures.
- **Stateful in-memory sandboxes are required:** Backing your MCP proxy with an ephemeral SQLite database allows read and write tools to mutate state realistically across multi-turn interactions.
- **Evaluate trajectories, not just final answers:** Assert on step counts, token expenditures, tool invocation sequences, and final database states.

---

## What You Should Do Today

1. **Audit your agent test suite:** Identify any CI step that makes direct HTTP requests or invokes live external APIs during eval loops.
2. **Isolate your MCP servers behind a mock dispatcher:** Build a lightweight in-memory router (like the SQLite example above) for your critical tools.
3. **Implement trajectory metrics:** Track step counts and tool choice regressions across model updates before deploying agent prompts to production.
