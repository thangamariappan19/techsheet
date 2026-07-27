---
title: "Architecting Agent Experience (AX): Deterministic Skill Mocking and Local State Isolation"
date: "2026-07-27"
description: "Learn how to build local interception layers and mock MCP servers to evaluate AI coding agents safely without production side-effects or token bloat."
tags: ["AI Architecture","Agent Experience","Testing","TypeScript","DevOps"]
headerImage: "https://picsum.photos/seed/architecting-agent-experience-ax-deterministic-skill-mocking-and-local-state-isolation-63704/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

In 2026, the primary bottleneck in software engineering is no longer how fast an LLM can generate code. It is how reliably an AI agent can interact with your tools, scripts, and APIs without breaking your infrastructure. As developers embed agents deeper into workflow automation—from automated refactoring pipelines to pull request remediations—a new discipline has emerged: **Agent Experience (AX)**.

Just as Developer Experience (DX) focuses on clean APIs and human-readable interfaces, AX focuses on how effectively an AI agent can discover, invoke, and recover from tool calls. However, testing these agents creates a massive operational challenge. 

Every time an automated evaluation suite runs an agent against real endpoints, three things happen:
1. API costs explode due to continuous iteration.
2. Staging databases and Git repositories are mutated with dirty, test-generated state.
3. Tests become flaky because external services introduce variable latencies and rate limits.

To build robust AX evaluations, senior architects must treat agent tool execution like hardware isolation. Here is how to construct a deterministic skill mocking layer that isolates state, intercepts tool calls transparently, and accelerates agent evaluation loops.

---

## The Architecture of Agent Tool Calls

Most modern AI coding agents communicate with external environments using standard tool schemas or protocols like the Model Context Protocol (MCP). When an agent determines it needs to read a database, execute a shell command, or patch a remote repository, it yields an execution intent payload back to the harness.

```
+-------------------+          1. Tool Intent          +-------------------+
|                   |  ----------------------------->  |                   |
|     AI Agent      |                                  |   Skill Harness   |
|                   |  <-----------------------------  |                   |
+-------------------+        4. Observation Payload    +-------------------+
                                                                 |
                                                                 | 2. Intercept & Resolve
                                                                 v
                                                       +-------------------+
                                                       |  Mock Mock Engine |
                                                       +-------------------+
```

The goal of deterministic AX testing is to step between step 1 and step 4 without allowing the request to hit real infrastructure or external networks. 

Direct unit testing of the agent's LLM prompt is insufficient because prompt changes produce non-deterministic reasoning paths. Instead, we must evaluate the agent at the **tool interaction boundary**, recording side-effects and measuring accuracy.

---

## Implementing a Transparent Tool Interceptor

To safely evaluate skills without mutating live services, we design a middleware proxy. This interceptor captures outgoing tool call requests, matches arguments against registered declarative mocks, and returns realistic structural responses to the model.

Below is a lightweight, type-safe implementation of an agent tool proxy written in TypeScript.

```typescript interface ToolCallPayload {   toolName: string;   args: Record<string, unknown>; }  interface MockRule {   toolName: string;   matcher?: (args: Record<string, unknown>) => boolean;   response: unknown | ((args: Record<string, unknown>) => unknown); }  export class AgentSkillInterceptor {   private mocks: Map<string, MockRule[]> = new Map();   private executionLog: ToolCallPayload[] = [];    registerMock(toolName: string, mock: MockRule): void {     const list = this.mocks.get(toolName) || [];     list.push(mock);     this.mocks.set(toolName, list);   }    async executeTool(call: ToolCallPayload): Promise<unknown> {     this.executionLog.push(call);     const registeredMocks = this.mocks.get(call.toolName);      if (!registeredMocks || registeredMocks.length === 0) {       throw new Error(         `[AX Interceptor Failure] Unmocked agent tool call detected: ${call.toolName}`       );     }      const matchedRule = registeredMocks.find(       (rule) => !rule.matcher || rule.matcher(call.args)     );      if (!matchedRule) {       throw new Error(         `[AX Interceptor Failure] No matching rule for `call.toolName with arguments:`{JSON.stringify(call.args)}`       );     }      if (typeof matchedRule.response === 'function') {       return matchedRule.response(call.args);     }      return matchedRule.response;   }    getExecutionHistory(): ReadonlyArray<ToolCallPayload> {     return Object.freeze([...this.executionLog]);   }    clearHistory(): void {     this.executionLog = [];   } } ```

This interceptor guarantees two things: no unmocked tool call slips through to an actual API, and every tool call sequence is logged for downstream assertion assertions.

---

## Writing Deterministic AX Evaluation Suites

With an interception layer in place, we can write evaluation suites that verify whether an agent makes the right decisions when faced with edge cases, service failures, or malformed inputs.

In the following test scenario, we evaluate a migration agent that upgrades legacy component syntax. We mock both Git and AST modification tools to ensure the agent executes the correct tool order without writing changes to disk or running remote git commands.

```typescript import { describe, it, expect, beforeEach } from 'vitest'; import { AgentSkillInterceptor } from './interceptor'; import { MigrationAgent } from './migration-agent';  describe('AX Eval: Component Upgrade Agent Tool Orchestration', () => {   let interceptor: AgentSkillInterceptor;   let agent: MigrationAgent;    beforeEach(() => {     interceptor = new AgentSkillInterceptor();     agent = new MigrationAgent({ toolRunner: interceptor });   });    it('should verify git status before applying codemod transformation', async () => {     // 1. Register Mock: Check Git Branch Status     interceptor.registerMock('get_git_status', {       toolName: 'get_git_status',       response: { branch: 'main', isClean: true }     });      // 2. Register Mock: Codemod execution     interceptor.registerMock('apply_codemod', {       toolName: 'apply_codemod',       matcher: (args) => args.targetFile === 'src/components/Modal.tsx',       response: {         status: 'success',         changesApplied: 4,         warnings: []       }     });      // 3. Execute Agent Task     const agentResult = await agent.run({       instruction: 'Upgrade Modal.tsx to modern v2 syntax'     });      const toolHistory = interceptor.getExecutionHistory();      // 4. Assert Execution Mechanics     expect(toolHistory).toHaveLength(2);     expect(toolHistory[0].toolName).toBe('get_git_status');     expect(toolHistory[1].toolName).toBe('apply_codemod');      expect(toolHistory[1].args).toEqual({       targetFile: 'src/components/Modal.tsx',       transform: 'modal-v2-codemod'     });      expect(agentResult.status).toBe('COMPLETED');   });    it('should gracefully handle and recover when a codemod tool fails', async () => {     interceptor.registerMock('get_git_status', {       toolName: 'get_git_status',       response: { branch: 'main', isClean: true }     });      // Simulate tool failure     interceptor.registerMock('apply_codemod', {       toolName: 'apply_codemod',       response: {         status: 'error',         errorReason: 'Syntax error on line 42'       }     });      // Mock secondary fallback logger tool     interceptor.registerMock('log_error_report', {       toolName: 'log_error_report',       response: { reportId: 'R-9901' }     });      await agent.run({       instruction: 'Upgrade Modal.tsx to modern v2 syntax'     });      const toolHistory = interceptor.getExecutionHistory();      // Verify recovery behavior     expect(toolHistory).toHaveLength(3);     expect(toolHistory[2].toolName).toBe('log_error_report');   }); }); ```

---

## Evaluating Trade-offs: Mocking Depth vs. Environment Drift

While local tool mocking makes evaluation loops instant and cheap, it introduces architectural trade-offs that software architects must manage.

### 1. The Risk of Mock Drift
If your API schemas or external services evolve while your mock responses stay fixed, your AX evaluations will yield false positives. Your agent will succeed in the local mock environment but fail when deployed in production.
* **Mitigation**: Generate mock responses directly from your OpenAPI or Model Context Protocol schemas automatically during build steps.

### 2. High Cost of Multi-Turn State Simulation
If an agent relies on complex state transitions across 10 or more sequential tool invocations, stateful mocking logic inside test cases can become fragile.
* **Mitigation**: Use snapshot-based tool record/replay mechanisms. Capture actual tool response streams from a single staging run, sanitize sensitive payload fields, and replay them during CI runs.

---

## Key Takeaways

- **Agent Experience (AX)** requires treating LLMs as consumers of APIs, where deterministic tool execution matters as much as prompt quality.
- Running AX evaluations against live APIs mutates state, inflates token budgets, and introduces test flakiness.
- **Skill Interceptors** decouple model reasoning from network mutations by providing schema-validated responses locally.
- Evaluation suites should assert both the **sequence of tool calls** and the **payload structure** passed by the model.

---

## What You Should Do Today

1. **Audit Agent Tool Boundaries**: Identify all tools, scripts, and MCP handlers exposed to your agents that mutate persistent state (Git, databases, remote APIs).
2. **Implement an Interceptor Pattern**: Wrap your tool resolution runner in an interceptor middleware that throws an explicit error when an unmocked call is attempted.
3. **Build an AX CI Suite**: Create a dedicated evaluation suite in your testing framework (e.g., Vitest or Jest) that exercises failure recovery paths and verifies agent behavior without hitting live endpoints.
