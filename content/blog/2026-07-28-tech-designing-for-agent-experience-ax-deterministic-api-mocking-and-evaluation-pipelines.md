---
title: "Designing for Agent Experience (AX): Deterministic API Mocking and Evaluation Pipelines"
date: "2026-07-28"
description: "Learn how to build deterministic testing harnesses and schema-aware API mocking layers for AI coding agents without breaking production or API budgets."
tags: ["AI Agents","Agent Experience","Testing","Architecture","TypeScript"]
headerImage: "https://picsum.photos/seed/designing-for-agent-experience-ax-deterministic-api-mocking-and-evaluation-pipelines-77785/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

As engineering organizations shift toward AI-assisted development workflows, a new discipline has quietly emerged alongside Developer Experience (DX): **Agent Experience (AX)**.

While DX optimizes how human developers consume documentation, APIs, and CLI tooling, AX optimizes how AI agents (such as GitHub Copilot extensions, Model Context Protocol servers, and specialized workspace agents) inspect, invoke, and reason about your code and services.

If your agent skills or custom tools communicate directly with real backend APIs during evaluation, you face an immediate bottleneck: **you cannot test agent behavioral changes deterministically.** Every evaluation run either mutates production or staging databases, or incurs substantial API billing while introducing network latency.

In this deep-dive, we will examine how to build a zero-side-effect testing harness for AI agent skills using transparent API interception, structural mocking, and quantitative AX evaluation metrics.

---

## The AX Bottleneck: Why Standard Evals Fail

When testing standard software, unit tests execute in milliseconds using static mocks. When testing an AI agent's tool usage, however, the test subject is non-deterministic.

When an agent needs to execute a skill—such as updating a feature flag via a REST endpoint or querying a GraphQL service—a traditional test loop presents three major flaws:

1. **Side-Effect Pollution:** Executing destructive or state-altering API calls (e.g., `POST /api/v1/deployments` or `DELETE /api/v1/cache`) during an eval loop corrupts test environments.
2. **Latent Cost Escalation:** Running a multi-step agent trajectory through 50 test cases can consume millions of tokens and hundreds of network round-trips per CI run.
3. **Flaky Non-Determinism:** If the underlying sandbox environment changes slightly, the agent's reasoning loop changes, making it impossible to isolate whether a failure stemmed from the prompt, the schema, or the underlying API response.

To build reliable Agent Experience evaluations (AX evals), we must decouple agent skill execution from actual downstream API invocations using a transparent interception layer.

---

## Architecture: Transparent Skill Mocking for MCP & REST

To evaluate agent skill invocation without modifying either the agent prompt harness or the downstream production code, we insert an **Agent Interception Proxy (AIP)**.

```
+-------------------+      JSON-RPC / HTTP      +------------------------+
|  AI Agent / LLM   | ------------------------> |  Agent Interception    |
| (Copilot / Claude)| <------------------------ |  Proxy (AIP)           |
+-------------------+                           +------------------------+
                                                            |
                                        +-------------------+-------------------+
                                        |                                       |
                             [ Match Mock Record? ]                   [ Pass-through ]
                                  /            \                             |
                                YES             NO                           v
                                /                \                 +------------------+
                               v                  v                | Staging / Live   |
                      +----------------+   +----------------+      | API Endpoint     |
                      | Replay Buffer  |   | Mock Fallback  |      +------------------+
                      | & Schema Check |   | Engine         |
                      +----------------+   +----------------+
```

The Interception Proxy fulfills three primary responsibilities:
1. **Request Interception:** Captures tool call invocations (whether JSON-RPC over stdio for MCP or standard HTTP fetch).
2. **Schema Verification:** Assesses if the agent generated tool arguments matching the expected Zod or JSON Schema contract.
3. **Deterministic Response Replay:** Returns recorded or synthetic JSON payloads within 2 milliseconds, skipping real network transport.

---

## Implementing a Deterministic Skill Mock in TypeScript

Let's construct a lightweight, schema-aware mock proxy for a Model Context Protocol (MCP) tool or agent skill.

Below is an implementation using Node.js and Zod that intercepts tool calls, validates agent-generated arguments, and yields deterministic fixtures:

```typescript
import { z } from "zod";

// Define the Agent Tool Schema
export const CreateFeatureFlagSchema = z.object({
  key: z.string().regex(/^[a-z0-9_-]+$/),
  description: z.string().min(10),
  defaultValue: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100),
});

export type CreateFeatureFlagInput = z.infer<typeof CreateFeatureFlagSchema>;

// Mock Response Store
interface MockRule<T> {
  toolName: string;
  validate: (input: unknown) => { success: boolean; data?: T; errors?: string[] };
  handler: (input: T) => { status: number; body: Record<string, unknown> };
}

export class AgentSkillMockHarness {
  private rules = new Map<string, MockRule<any>>();

  public registerTool<T>(
    toolName: string,
    schema: z.ZodSchema<T>,
    mockHandler: (input: T) => { status: number; body: Record<string, unknown> }
  ) {
    this.rules.set(toolName, {
      toolName,
      validate: (input: unknown) => {
        const result = schema.safeParse(input);
        if (result.success) {
          return { success: true, data: result.data };
        }
        return {
          success: false,
          errors: result.error.errors.map((e) => ``e.path.join("."):`{e.message}`),
        };
      },
      handler: mockHandler,
    });
  }

  public async executeToolCall(toolName: string, rawArgs: unknown) {
    const rule = this.rules.get(toolName);
    if (!rule) {
      return {
        isError: true,
        content: `Tool '${toolName}' is not registered in the evaluation harness.`,
      };
    }

    const validation = rule.validate(rawArgs);
    if (!validation.success) {
      return {
        isError: true,
        content: `AX Validation Error: Agent provided invalid arguments for tool '`toolName'. Errors:`{validation.errors?.join("; ")}`,
      };
    }

    const response = rule.handler(validation.data);
    return {
      isError: response.status >= 400,
      content: JSON.stringify(response.body),
    };
  }
}

// Example Harness Setup
const harness = new AgentSkillMockHarness();

harness.registerTool(
  "create_feature_flag",
  CreateFeatureFlagSchema,
  (input) => ({
    status: 201,
    body: {
      id: "ff_99281",
      key: input.key,
      status: "active",
      createdAt: "2026-07-28T12:00:00Z",
    },
  })
);
```

### Why Schema-Aware Mocking Improves AX

When an agent produces invalid arguments (e.g., passing a float to `rolloutPercentage` exceeding 100, or a non-kebab-case flag key), the mock harness rejects the payload **before** any network request occurs. This gives us an immediate, actionable metric: **Argument Accuracy Rate (AAR)**.

---

## Measuring What Matters: Quantitative AX Metrics

When tuning documentation, tool description annotations, or system prompts for coding agents, track three key performance indicators across your evaluation suite:

| Metric | Calculation | What it Signals |
| :--- | :--- | :--- |
| **Tool Selection Accuracy (TSA)** | (Correct Tool Invocations) / (Total Prompts requiring Tools) | Measures whether tool descriptions in OpenAPI or MCP schemas are clear to the LLM. |
| **Argument Accuracy Rate (AAR)** | (Valid Argument Schemas) / (Total Tool Invocations) | Indicates whether your parameter descriptions and Zod/JSON constraints are unambiguous. |
| **Trajectory Completion Rate (TCR)** | (Successful Trajectories) / (Total Eval Runs) | Evaluates end-to-end task success when the agent consumes mocked API responses. |

---

## Trade-off Analysis: Mocking Strategy Comparison

When setting up your AX evaluation harness, choose the strategy that fits your lifecycle stage:

| Strategy | Cost / Run | Determinism | Fidelity | Best Used For |
| :--- | :--- | :--- | :--- | :--- |
| **Direct Live APIs** | High | Low (Flaky) | 100% | Final Sanity Checks / Nightly Smoke Tests |
| **Recorded Replay Buffers** | Very Low | High | 90% | Regression Testing Existing Trajectories |
| **Schema-Aware Mock Harness** | Zero Network | 100% | 85% | Fast CI / CD Iteration and AX Tuning |
| **LLM-Based Mock Generator** | Medium | Medium | 95% | Edge-Case Invalidation / Fuzzing |

---

## Key Takeaways

1. **AX is as crucial as DX:** AI coding agents depend on clear, unambiguous tool schemas and structured responses just as human engineers depend on clean docs.
2. **Never test agents against live mutation endpoints:** Network latency, state corruption, and token costs render live-API evals impractical for continuous integration.
3. **Mock at the Schema Layer:** Intercept agent invocations early using schema validators like Zod to isolate whether failures are caused by LLM argument hallucination or backend logic.
4. **Track Quantitative AX Metrics:** Measure Tool Selection Accuracy (TSA) and Argument Accuracy Rate (AAR) to objectively judge prompt and schema revisions.

---

## What You Should Do Today

1. **Audit your Agent Tools / MCP Servers:** Check if parameter descriptions in your tool schemas provide explicit constraints and clear examples.
2. **Build a Mock Harness in CI:** Wrap your agent skills in a mock proxy so evals execute offline without hitting production or staging APIs.
3. **Establish Baseline AX Evals:** Create 10 to 20 representative developer prompt trajectories and measure your current Argument Accuracy Rate before making any prompt or schema changes.
