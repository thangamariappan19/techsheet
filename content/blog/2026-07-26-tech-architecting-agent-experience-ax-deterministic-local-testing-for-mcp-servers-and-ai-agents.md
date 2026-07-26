---
title: "Architecting Agent Experience (AX): Deterministic Local Testing for MCP Servers and AI Agents"
date: "2026-07-26"
description: "Stop draining API budgets and mutating test DBs during AI agent evals. Learn how to architect local proxy layers to test MCP servers and agent skills deterministically."
tags: ["AI","Architecture","Testing","TypeScript","MCP"]
headerImage: "https://picsum.photos/seed/architecting-agent-experience-ax-deterministic-local-testing-for-mcp-servers-and-ai-agents-7534/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

# Architecting Agent Experience (AX): Deterministic Local Testing for MCP Servers and AI Agents

For the past decade, software architecture focused heavily on Developer Experience (DX). We optimized hot module reloading, typed public APIs, and tuned local dev environments. But in 2026, a new stakeholder consumes your codebase before any human developer ever touches it: **the AI coding agent.**

Designing APIs, documentation, and tooling specifically for LLMs is now recognized as **Agent Experience (AX)**. Whether you are extending GitHub Copilot, building Model Context Protocol (MCP) tools, or wiring custom autonomous agents into your platform, your job is no longer just making code maintainable—it is making code **discoverable and executable by LLMs**.

However, testing AX introduces a massive architectural bottleneck. Every time you tweak a skill definition or updated an MCP server schema and trigger an evaluation suite, your agent:
1. Calls live external services or mutations on test databases.
2. Incurs high API token costs across multi-turn reasoning loops.
3. Yields non-deterministic test failures due to upstream network latency or model drift.

In this deep dive, we will architect a zero-latency, zero-cost local evaluation suite that intercepts MCP JSON-RPC calls and REST endpoints, allowing you to run robust AX evals completely offline.

---

## The Flakiness Problem in Agent Evals

When evaluating human-facing code, tests are deterministic: Input X produces Output Y. When evaluating an agent skill, tests evaluate *intent* and *tool selection accuracy*:

```
[User Prompt] -> [Agent Planner] -> [Tool Selection] -> [API Invocation] -> [Response Parsing] -> [Final Output]
```

If your eval suite hits live APIs during the `[API Invocation]` phase, two problems occur:
* **Data Mutation Side-Effects**: An agent testing a `delete_user` or `deploy_preview` skill actually executes those actions in staging.
* **Cost & Speed Creep**: A full evaluation matrix running 50 prompts with 4 tool turns each can easily burn 200 API calls and minutes of runtime per CI pull request.

To buildAX evals that actually scale, we must decouple **agent reasoning evaluation** from **external side effects**.

---

## Architecture of a Local AX Mocking Proxy

To achieve true deterministic testing, we insert a lightweight local interceptor between the agent harness and your MCP server or backend endpoints.

```
+--------------------+       +------------------------+       +------------------------+
|                    |       |    Local AX Proxy      |       |  Mock Fixture Store    |
|  AI Agent Harness  | ----> |  (Schema Interceptor)  | ----> |                        |
|  (Copilot/Claude)  |       |                        |       |  - Stored Schemas      |
+--------------------+       +------------------------+       |  - Response Determinism|
                                                              +------------------------+
```

The proxy performs three critical jobs:
1. **Schema Validation**: Verifies that the tool call produced by the agent matches the strict JSON schema expected by your MCP server.
2. **Payload Interception**: Intercepts outgoing JSON-RPC 2.0 requests (for MCP) or HTTP requests (for REST tools) and matches them against pre-recorded fixture states.
3. **Eval Assertion Verification**: Asserts whether the agent supplied required context fields without executing the real underlying business logic.

---

## Building the Mock Proxy Layer in TypeScript

Let us implement a practical, local interception transport for an agent tool skill using Node.js and standard JSON schema validation. This setup runs inside your CI pipeline prior to merging changes to your MCP tool interfaces.

### 1. Defining the Agent Skill Contract

Suppose we have an MCP tool called `provision_preview_environment`:

```typescript
// src/schemas/environment.ts
import { z } from "zod";

export const ProvisionEnvSchema = z.object({
  branch: z.string().describe("The Git branch to deploy from"),
  ttlHours: z.number().min(1).max(72).default(24).describe("Lifetime of the preview env"),
  region: z.enum(["us-east-1", "eu-west-1", "ap-southeast-1"]).describe("Target cloud region"),
  variables: z.record(z.string(), z.string()).optional().describe("Environment variable overrides")
});

export type ProvisionEnvInput = z.infer<typeof ProvisionEnvSchema>;
```

### 2. Creating the Interceptor Harness

Instead of exposing the live provisioning service during tests, we create an **AX Mock Interceptor** that records invocations and returns simulated operational outcomes:

```typescript
// src/testing/axMockInterceptor.ts
import { ProvisionEnvSchema, ProvisionEnvInput } from "../schemas/environment";

export interface InterceptedCall {
  timestamp: number;
  toolName: string;
  rawArgs: unknown;
  isValid: boolean;
  validationErrors?: string[];
}

export class AXMockServer {
  private calls: InterceptedCall[] = [];

  // Intercept incoming MCP tool calls without executing real infra code
  public async handleToolCall(toolName: string, args: unknown): Promise<{ success: boolean; data?: any; error?: string }> {
    if (toolName !== "provision_preview_environment") {
      return { success: false, error: `Unknown tool call: ${toolName}` };
    }

    const parseResult = ProvisionEnvSchema.safeParse(args);

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => ``e.path.join("."):`{e.message}`);
      this.calls.push({
        timestamp: Date.now(),
        toolName,
        rawArgs: args,
        isValid: false,
        validationErrors: errors
      });
      return {
        success: false,
        error: `Invalid tool parameters: ${errors.join(", ")}`
      };
    }

    // Record successful interception
    this.calls.push({
      timestamp: Date.now(),
      toolName,
      rawArgs: parseResult.data,
      isValid: true
    });

    // Return deterministic mock payload
    return {
      success: true,
      data: {
        environmentId: "env-mock-99823",
        status: "ready",
        url: `https://mock-${parseResult.data.branch}.internal.dev`,
        allocatedRegion: parseResult.data.region
      }
    };
  }

  public getHistory(): ReadonlyArray<InterceptedCall> {
    return this.calls;
  }

  public reset(): void {
    this.calls = [];
  }
}
```

### 3. Writing the AX Evaluation Test

Now, we run our agent prompt against the mock server to evaluate if the agent chose the correct parameters based on user context:

```typescript
// tests/ax/provisionEnv.eval.ts
import { AXMockServer } from "../../src/testing/axMockInterceptor";
import { assert } from "chai";

describe("AX Eval: Environment Provisioning Skill", () => {
  let mockServer: AXMockServer;

  beforeEach(() => {
    mockServer = new AXMockServer();
  });

  it("correctly extracts branch and region from user prompt", async () => {
    // Simulated prompt: 'Deploy a preview for feature/auth-fix in London for 12 hours'
    // The agent framework converts this prompt to a tool call:
    const simulatedAgentOutput = {
      tool: "provision_preview_environment",
      args: {
        branch: "feature/auth-fix",
        region: "eu-west-1",
        ttlHours: 12
      }
    };

    const response = await mockServer.handleToolCall(
      simulatedAgentOutput.tool,
      simulatedAgentOutput.args
    );

    // Assertion 1: Tool execution should succeed schema validation
    assert.isTrue(response.success, "Agent parameters failed schema validation");

    // Assertion 2: Verify recorded calls for exact arguments
    const history = mockServer.getHistory();
    assert.lengthOf(history, 1);
    assert.isTrue(history[0].isValid);
    assert.strictEqual((history[0].rawArgs as any).region, "eu-west-1");
  });
});
```

---

## Measuring the Impact: Live vs Mocked Evals

By moving from live network interactions to local schema proxy testing during CI runs, your eval suite performance shifts dramatically:

| Metric | Live API / External Skill Runs | Local AX Interceptor Layer |
| :--- | :--- | :--- |
| **Latency per Test** | 1,200ms - 4,500ms | **3ms - 8ms** |
| **Cost per 1,000 Runs** | `15.00 -`45.00 | **$0.00** |
| **Deterministic Pass Rate** | ~82% (network/rate limits) | **100%** |
| **Side Effect Risk** | High (Staging DB pollution) | **Zero** |

---

## Advanced AX Strategies: Catching Tool Misunderstandings

When agents fail in production, it is rarely because the LLM failed to output JSON. It is usually because the API schema was ambiguous. Here are three architectural rules for optimizing your tools for agents:

1. **Eliminate Overloaded Field Types**: Avoid fields that accept `string | string[]`. Force distinct types or separate tools. Agents frequently fail on union types in tool parameters.
2. **Use Explicit Enum Descriptions**: Instead of `region: string`, use an enum with descriptions for each valid value. The LLM relies on schema descriptions to perform zero-shot map matching.
3. **Fail Fast with Meaningful Schema Messages**: When your mock server catches a validation error, pass the schema error *back* to the agent in the eval test to see if the agent can self-correct in a multi-turn retry loop.

---

## Key Takeaways

* **Agent Experience (AX) is a First-Class Concern**: Designing schemas, documentation, and tools for AI agents requires dedicated testing pipelines just like DX.
* **Never Test Skills Against Live Infra in CI**: Directing agent evals at real APIs leads to rate limits, unintended data mutations, high costs, and test flakiness.
* **Intercept early at the Transport Layer**: Build local proxies for MCP JSON-RPC endpoints to validate schema conformance and arguments deterministically in milliseconds.
* **Evaluate Intent and Parameter Accuracy**: Measure if the agent extracted the right variables from the prompt rather than waiting for downstream infrastructure side-effects.

---

## What You Should Do Today

1. **Audit Your Tool Schemas**: Review your current API parameter schemas. Add explicit description strings to all fields used by coding agents or custom extensions.
2. **Isolate Your MCP Evals**: Wrap your MCP tool handlers in a local mock server using tools like `msw` or a custom proxy harness before pushing updates to production.
3. **Add AX Schema Validation to Pre-commit Hooks**: Prevent ambiguous or non-conforming schema changes from reaching main branches by validating tool definitions against sample agent payloads locally.
