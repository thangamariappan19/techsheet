---
title: "Architecting for Agent Experience (AX): Deterministic Testing and API Mocking for AI Skills"
date: "2026-07-25"
description: "Learn how to build deterministic evaluation harnesses and transparent API mocks for AI agent skills without burning API credits or mutating production data."
tags: ["AI","Architecture","Testing","TypeScript","DevOps"]
headerImage: "https://picsum.photos/seed/architecting-for-agent-experience-ax-deterministic-testing-and-api-mocking-for-ai-skills-27711/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

# Architecting for Agent Experience (AX): Deterministic Testing and API Mocking for AI Skills

For the past decade, senior front-end and full-stack architects focused on User Experience (UX) and Developer Experience (DX). In 2026, a third paradigm dominates production systems: **Agent Experience (AX)**. As we expose our web apps, Model Context Protocol (MCP) servers, and REST APIs to autonomous AI agents—like GitHub Copilot, Cursor, and custom internal agents—the interface is no longer just a human-rendered DOM or a strictly typed SDK. It is a natural language specification attached to deterministic tool calls.

However, testing agent skills presents a massive architectural challenge. Every time an evaluation suite runs an agent skill that connects to a live backend, you face two catastrophic issues: **uncontrolled cloud cost** and **state mutation risk**. Worse, non-deterministic LLM behavior makes traditional unit testing frameworks (`jest`, `vitest`) feel useless if not structured correctly.

Here is how to design a transparent, zero-side-effect test harness for agent skills that allows your team to evaluate agent behavior locally and in CI/CD before shipping to production.

---

## The Dual Failure Modes of Agent Skill Testing

When evaluating whether an agent can correctly use a web API or system tool to perform a task (e.g., "Reschedule user subscription to next month"), teams usually hit one of two walls:

1. **The Live API Trap**: Running live endpoint calls during CI evals. A single test run executing 50 evaluation scenarios can mutate production database entries, send actual customer emails, or cost hundreds of dollars in API call volume.
2. **The Hardcoded Mock Trap**: Modifying the agent's core prompt or skill definition to point to stubbed functions during test mode. If your test environment uses a modified prompt or modified function signature, you are no longer testing the code you ship.

To achieve realistic Agent Experience (AX) testing, your test harness must observe **the exact production tool definitions** while intercepting I/O transparently at the transport layer.

```
+-----------------------------------------------------------------------+
|                            TEST HARNESS                               |
|                                                                       |
|  +-----------------+    Tool Call Request    +---------------------+  |
|  |   AI Agent /    | ----------------------> |  Production Tool /  |  |
|  |   LLM Engine    |                         |  Skill Definition   |  |
|  +-----------------+                         +---------------------+  |
|          ^                                              |             |
|          | Eval Score                                   | HTTP Fetch  |
|          |                                              v             |
|  +-----------------+                        +----------------------+  |
|  |  AX Evaluator   |                        | Network Interceptor  |  |
|  |  (Assertions)   |                        | (MSW / Transparent)  |  |
|  +-----------------+                        +----------------------+  |
|          ^                                              |             |
|          | Assert Network Payload                       v             |
|          +----------------------------------- [ Mock Response ]       |
+-----------------------------------------------------------------------+
```

---

## Building a Transparent Interception Harness

To test an agent skill cleanly, intercept HTTP calls at the global fetch or network layer without altering your OpenAPI specs, MCP tool schemas, or prompt templates. 

Below is a pattern using TypeScript and Mock Service Worker (MSW) or Node's global mock context to build an isolated, zero-dependency skill evaluation runner.

### Step 1: The Production Skill Definition

Here is a simple skill that allows an AI agent to cancel an order. Notice it knows nothing about testing frameworks.

```typescript
// src/skills/cancelOrder.ts
import { z } from "zod";

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.enum(["buyer_requested", "out_of_stock", "fraud"]),
});

type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export async function cancelOrderSkill(input: CancelOrderInput) {
  const validated = cancelOrderSchema.parse(input);
  
  const response = await fetch(`https://api.store.com/v1/orders/${validated.orderId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: validated.reason }),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel order: ${response.statusText}`);
  }

  return await response.json();
}
```

### Step 2: The Transparent Test Execution Harness

Instead of changing `https://api.store.com` inside the function, we intercept outbound HTTP requests using a deterministic mock proxy wrapper during evaluation.

```typescript
// tests/ax-evals/cancelOrder.eval.ts
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { cancelOrderSkill } from "../../src/skills/cancelOrder";

// 1. Setup transparent interception for the production endpoint
const mockHttpServer = setupServer(
  http.post("https://api.store.com/v1/orders/:id/cancel", async ({ request, params }) => {
    const body = (await request.json()) as { reason: string };
    
    // Guard against malformed requests at the network boundaries
    if (params.id === "ord_invalid") {
      return new HttpResponse(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      cancelledOrderId: params.id,
      refundStatus: "initiated",
      reason: body.reason,
    });
  })
);

describe("AX Evaluation: Cancel Order Skill", () => {
  beforeAll(() => mockHttpServer.listen());
  afterEach(() => mockHttpServer.resetHandlers());
  afterAll(() => mockHttpServer.close());

  it("executes tool parameters accurately from natural language intent", async () => {
    // Simulated LLM Tool Call Generation
    const llmGeneratedArguments = {
      orderId: "ord_99481",
      reason: "buyer_requested",
    };

    // Execute skill code against mocked wire
    const result = await cancelOrderSkill(llmGeneratedArguments);

    // Assert structural correctness and API payload response
    expect(result).toEqual({
      success: true,
      cancelledOrderId: "ord_99481",
      refundStatus: "initiated",
      reason: "buyer_requested",
    });
  });
});
```

---

## Separating Structural Assertions from Semantic Assertions

In standard unit testing, a test either passes or fails based on an exact output match. In AX evaluations, you must evaluate **two distinct layers**:

### 1. Structural Validation (Deterministic)
Does the output generated by the LLM match the JSON schema expected by your API? Does the skill handler properly sanitize inputs before pushing them to the network?
* **Tooling**: Zod, JSON Schema validators, MSW network assertions.
* **Metric**: Pass/Fail (Binary).

### 2. Semantic Intent (Probabilistic)
Did the agent pick the *correct tool* for the given context? For instance, if a user states: *"I don't want this shirt anymore, please take it back,"* did the agent invocation pick `cancelOrder` or `createReturn`?
* **Tooling**: Evals harness using deterministic LLM scoring (or small offline models like Llama 3/Mistral running locally).
* **Metric**: Intent Match Accuracy Score (0.0 to 1.0).

When building an AX suite, **never mix semantic intent scoring with network code execution**. First evaluate tool selection semantically; then pass the generated args into your intercepted network harness for structural execution.

---

## Handling Non-Deterministic LLM Flakiness in CI

Because LLM outputs vary across model checkpoints, running live LLM calls during every git push introduces test flakiness. To keep your CI/CD fast and deterministic:

1. **Record Real Call Transcripts**: Record realistic JSON tool-call payloads generated by models (e.g., GPT-4o, Claude 3.5 Sonnet) during initial development.
2. **Replay in CI**: Feed recorded transcript parameters through your intercepted skill harness during standard PR builds.
3. **Run Live LLM Evals Nightly**: Reserve live LLM calls against your transparent mock harness for nightly scheduled runs to catch prompt drift and model performance regressions.

---

## Key Takeaways

- **Decouple Skill Code from Live Endpoints**: Intercept API traffic at the HTTP or transport layer (using tools like MSW) rather than modifying skill URLs or prompt definitions for tests.
- **Separate Structure from Semantics**: Use schema validators (like Zod) to check structural correctness deterministically, and reserve LLM-based evaluation for testing semantic tool choice.
- **Protect Production State**: Your evaluation suite should never alter production databases or trigger billable third-party integrations.
- **Build Local Test Harnesses**: Emulating agent tool execution locally drastically shortens feedback loops when designing new agent interactions or MCP tools.

---

## What You Should Do Today

1. **Audit Your Tool Schemas**: Review your agent skill definitions and verify that every skill parameter uses strict JSON schema or Zod validation with clear descriptive tags.
2. **Set Up MSW or Mock Transport for Skills**: Add an network interceptor layer to your skill testing suite to intercept outgoing HTTP requests transparently.
3. **Create a Synthetic Dataset**: Save 10 to 20 realistic tool-call arguments generated by modern LLMs to serve as deterministic fixture data in CI/CD.
