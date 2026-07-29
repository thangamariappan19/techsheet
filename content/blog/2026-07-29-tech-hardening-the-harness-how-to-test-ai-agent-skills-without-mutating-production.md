---
title: "Hardening the Harness: How to Test AI Agent Skills Without Mutating Production"
date: "2026-07-29"
description: "Learn how to build Agent Experience (AX) evals, mock MCP tools locally, and evaluate AI agent workflows safely without burning API credits."
tags: ["AI Architecture","Developer Tools","Testing","TypeScript"]
headerImage: "https://picsum.photos/seed/hardening-the-harness-how-to-test-ai-agent-skills-without-mutating-production-47608/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

AI coding agents are no longer just completion engines. With the rise of the Model Context Protocol (MCP), custom agent tools, and repository-level automation, engineers are extending LLM workflows by giving agents direct execution capabilities. We give agents access to issue trackers, database schemas, deployment pipelines, and internal REST APIs.

However, a fundamental architectural bottleneck has emerged: **How do you safely test and evaluate AI agent skills without mutating real data or draining your API budget?**

When developing traditional software, unit tests run against mocks or isolated test doubles. But when evaluating an Agent Experience (AX), running a test suite means letting an LLM reason through a prompt, select tools, and execute remote functions. If your agent's task is to "resolve stale issue reports," a naive evaluation loop will execute live HTTP requests against your issue tracker for every single test iteration.

In this deep dive, we will explore how to architect a local mock harness for agent tools, intercept Model Context Protocol (MCP) executions, and build deterministic AX evals that measure tool execution trajectories without side effects.

## The Architecture of an Agent Skill Call

To test an agent skill, we must first dissect how agents interact with tools. When an LLM executes an action, it goes through three distinct phases:

1. **Context & Discovery:** The agent receives system instructions, repository files, and tool schema definitions (e.g., JSON Schema describing available functions).
2. **Tool Call Intent:** The LLM produces a structured payload indicating its intent to invoke a function with specific parameters.
3. **Execution & Reaction:** The client runtime executes the function, captures the return payload, and feeds it back to the context window for the next reasoning step.

```typescript
// Example: Tool definition supplied to an agent runtime
export const updateDatabaseSchemaTool = {
  name: "apply_migration",
  description: "Applies a SQL migration file to the target environment",
  inputSchema: {
    type: "object",
    properties: {
      migrationName: { type: "string" },
      environment: { type: "string", enum: ["development", "staging"] }
    },
    required: ["migrationName", "environment"]
  }
};
```

If you execute an evaluation framework that runs this tool against live infrastructure, testing a simple prompt tweak on 10 eval cases across 5 test iterations results in 50 live database migrations.

To iterate fast, we need **Local AX Interception**.

## Building a Deterministic Tool Interceptor

Instead of allowing the agent runtime to call live external endpoints, we introduce an interceptor proxy at the harness level. This proxy serves two purposes:

1. It validates whether the LLM generated parameters matching the expected schema.
2. It returns synthetic, rule-based fixture data without hitting real servers.

Here is a lightweight TypeScript implementation of a local tool mocking interceptor for testing MCP/agent skills:

```typescript
type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export class AgentToolMockRegistry {
  private mocks = new Map<string, ToolHandler>();
  private executionLog: Array<{ tool: string; args: Record<string, unknown>; timestamp: number }> = [];

  // Register a mock handler for a specific tool name
  registerMock(toolName: string, mockHandler: ToolHandler): void {
    this.mocks.set(toolName, mockHandler);
  }

  // Intercept the agent tool call execution
  async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    this.executionLog.push({ tool: toolName, args, timestamp: Date.now() });

    const handler = this.mocks.get(toolName);
    if (!handler) {
      throw new Error(`Unregistered tool call attempted: ${toolName}`);
    }

    return await handler(args);
  }

  // Retrieve intercepted tool call logs for assertion
  getExecutionHistory() {
    return [...this.executionLog];
  }

  reset(): void {
    this.mocks.clear();
    this.executionLog = [];
  }
}
```

By substituting the production execution layer with `AgentToolMockRegistry`, your agent runtime receives authentic JSON structures back from tool calls, allowing it to complete multi-step reasoning chains locally.

## Creating AX Evals: Beyond Output Matching

Traditional software tests check `assert(result === expected)`. AI agent evaluations (AX Evals) are different because LLM text outputs are inherently non-deterministic. A successful test run does not require the agent to produce the exact string word-for-word; it requires the agent to:

- Select the **correct sequence of tools**.
- Pass **valid parameters** matching business constraints.
- Recover gracefully if a tool returns an error code or empty payload.

### Structuring an AX Eval Case

Here is how you write an assertion-based AX evaluation using our intercepted tool registry and modern testing patterns:

```typescript
import { test, expect } from "vitest";
import { AgentToolMockRegistry } from "./agent-mock-registry";
import { runAgentTask } from "./agent-runner";

test("Agent correctly identifies stale branches and calls cleanup tool", async () => {
  const mockRegistry = new AgentToolMockRegistry();

  // 1. Setup deterministic fixtures
  mockRegistry.registerMock("list_git_branches", async () => {
    return {
      branches: [
        { name: "main", lastCommitDaysAgo: 1 },
        { name: "feature/old-experiment", lastCommitDaysAgo: 120 }
      ]
    };
  });

  mockRegistry.registerMock("delete_git_branch", async (args) => {
    if (args.branchName === "main") {
      return { success: false, error: "Cannot delete protected branch main" };
    }
    return { success: true, deleted: args.branchName };
  });

  // 2. Invoke the Agent Harness with mock registry attached
  const agentResult = await runAgentTask({
    prompt: "Clean up branches that haven't received commits in over 90 days.",
    toolInterceptor: mockRegistry
  });

  // 3. Assert Tool Execution Intent, not just LLM text response
  const history = mockRegistry.getExecutionHistory();

  // Validate tool ordering
  expect(history[0].tool).toBe("list_git_branches");
  expect(history[1].tool).toBe("delete_git_branch");

  // Validate exact arguments generated by the LLM
  expect(history[1].args).toEqual({
    branchName: "feature/old-experiment"
  });

  // Ensure the agent completed its reasoning loop successfully
  expect(agentResult.status).toBe("completed");
});
```

## Eliminating Hidden Variables in Agent Evaluation

When building AX benchmarks, senior architects frequently run into false negatives caused by context pollution. If your evaluation environment isn't tightly controlled, test failures might be caused by:

1. **System Prompt Leakage:** Changes in global prompt templates altering tool selection priority.
2. **Dynamic Timestamps:** Hardcoded dates in fixtures making relative date conditions fail over time.
3. **Flaky Network State:** Remote schema updates breaking tool definition validation.

To eliminate these hidden variables:

- **Freeze System Clock Mocking:** Always mock system time inside the execution context before sending prompts to the agent.
- **Isolate Schema Files:** Store tool JSON schemas as static snapshot files in your test repository rather than pulling them dynamically from live API gateways.
- **Separate Skill Quality from Model Quality:** When an eval fails, check whether the model attempted the correct tool call with invalid arguments (a schema clarity issue) or selected an entirely wrong tool (a documentation/description issue).

## Key Takeaways

- **Don't let agents touch live APIs during test loops:** Intercept Model Context Protocol (MCP) calls at the harness level to prevent accidental data corruption and API rate-limiting.
- **Assert on Execution Trajectories:** Test which tools were selected and what arguments were generated, rather than attempting regex matches on unstructured LLM text responses.
- **Treat Agent Experience (AX) like Developer Experience (DX):** Clear tool descriptions, explicit JSON schemas, and reliable fixture mocks are the foundation of deterministic agent behavior.

## What You Should Do Today

1. **Audit your agent tool definitions:** Ensure every custom tool or MCP function has a comprehensive JSON schema with explicit description fields.
2. **Create a Tool Interceptor Registry:** Implement a lightweight local proxy in your test framework to stub external services during LLM evaluation runs.
3. **Add AX Evals to CI/CD:** Write test suites that validate agent tool calling trajectories against static fixtures before shipping prompt or tool changes to production.
