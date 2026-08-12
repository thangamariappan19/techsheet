---
title: "Architecting Stacked PRs for AI Coding Agents: Taming Monolithic Agentic Output"
date: "2026-08-12"
description: "AI agents generate unreviewable monolithic PRs. Learn how to architect stacked PR pipelines that force agents to decompose complex code changes into reviewable steps."
tags: ["AI Agents","Git","DevOps","Software Architecture","GitHub Copilot"]
headerImage: "https://picsum.photos/seed/architecting-stacked-prs-for-ai-coding-agents-taming-monolithic-agentic-output-56622/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

## The 2,000-Line Agent PR Problem

By now, your team has likely integrated autonomous coding agents into your development lifecycle—whether via GitHub Copilot Workspaces, custom CLI tools, or background worker pipelines. They draft code fast, resolve issues in minutes, and execute full-stack features with minimal human intervention.

There is just one major operational bottleneck: **Reviewability**.

When an agent is tasked with adding a complex feature—say, migrating an authentication endpoint and updating three dependent UI components—it does not think like a human engineer who submits small, logical commits. Instead, it inspects context, mutates 25 files across 6 directory boundaries, generates 1,800 lines of diffs, and submits a single, massive pull request.

The result? Senior engineers spend double the time unpicking spaghetti diffs, missing subtle regressions, or simply rubber-stamping code they do not fully understand.

The solution is not telling engineers to write smaller prompts. The solution is **Agentic Stacked Pull Requests**: forcing the agent orchestrator to decompose complex tasks into a dependency graph of micro-PRs before executing a single line of code.

## Why Agents Naturally Generate Monoliths

AI coding models optimize for goal completion within their active context window. When given a prompt, the model's attention mechanism operates on all target files simultaneously.

To an LLM:

1. Isolating intermediate states requires extra generation passes and extra token overhead.
2. Maintaining local Git state (branching off temporary ref points) is outside its natural next-token prediction loop unless explicitly structured into its execution wrapper.

If you do not enforce a decomposition pattern in your orchestration layer, the agent will take the path of least resistance: a single, giant, atomic changeset.

## The Architecture of Agentic Decomposition

To make AI-generated code reviewable, we must separate the agent's workflow into three distinct structural phases:

1. **Planning Phase (Spec & Graph Generation):** The agent analyzes the codebase, plans the change, and emits a structured dependency graph of small logical steps.
2. **Execution Phase (Stacked Branching):** The orchestrator runs a sequential loop that creates Git branches stacked on top of each other (`feature/step-1` -&gt; `feature/step-2` -&gt; `feature/step-3`).
3. **Synchronization Phase (Stack PR Management):** The pipeline opens stacked PRs targeted at their parent branches and automatically rebases downstream PRs when upstream revisions occur.

### Step 1: Generating the Step-Graph Spec

Before writing code, force the agent to produce a strict JSON plan detailing the sequence of stacked atomic PRs.

Here is an example schema for an agent execution loop:

```json
{
  "plan": [
    {
      "id": "step-1",
      "depends_on": null,
      "title": "refactor(auth): extract TokenValidator interface",
      "scope": ["src/lib/auth/types.ts", "src/lib/auth/validator.ts"]
    },
    {
      "id": "step-2",
      "depends_on": "step-1",
      "title": "feat(auth): implement OAuth2 PKCE validator",
      "scope": ["src/lib/auth/pkce.ts", "src/lib/auth/validator.ts"]
    },
    {
      "id": "step-3",
      "depends_on": "step-2",
      "title": "ui(auth): connect LoginButton to PKCE flow",
      "scope": ["src/components/LoginButton.tsx"]
    }
  ]
}
```

### Step 2: The Stacking Orchestration Pipeline

Once the plan is validated, your orchestrator iterates over the plan array to maintain strict branch isolation.

Here is an orchestrator script that manages branch isolation for each step using Node.js and TypeScript:

```typescript
import { execSync } from "child_process";

interface StackStep {
  id: string;
  depends_on: string | null;
  title: string;
  scope: string[];
}

async function executeStackedAgentRun(steps: StackStep[], agentRunner: Function) {
  let baseBranch = "main";

  for (const step of steps) {
    const branchName = `agent/`step.id-`{step.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    
    // Create branch stacked on previous branch
    console.log(`Creating branch `branchName from`{baseBranch}...`);
    execSync(`git checkout -b `branchName`{baseBranch}`);

    // Restrict agent to modifying only scoped files
    const prompt = `Implement task: `step.title. You MUST ONLY modify files in this scope:`{JSON.stringify(step.scope)}`;
    
    await agentRunner({
      prompt,
      allowedFiles: step.scope
    });

    // Commit and push step
    execSync(`git add .`);
    execSync(`git commit -m "${step.title}"`);
    execSync(`git push origin ${branchName}`);

    // Create stacked PR target baseBranch
    execSync(`gh pr create --title "`step.title" --body "Stacked PR step`{step.id}. Target branch: `baseBranch" --base`{baseBranch} --head ${branchName}`);

    // Set base for next branch in stack
    baseBranch = branchName;
  }
}
```

## Handling Upstream Revisions in AI Stacks

The biggest challenge with stacked PRs is handling human feedback on intermediate steps.

Suppose a human reviewer requests changes on `PR #1`. If `PR #2` and `PR #3` are already open and stacked on top of `PR #1`, updating `PR #1` will drift downstream branches.

### Automatic Rebase Cascade

When a reviewer requests changes on `PR #1`:

1. The review comments trigger a GitHub Actions workflow that feeds context back to the agent.
2. The agent applies fixes to `PR #1` and pushes a commit.
3. The pipeline triggers an automated rebase cascade to update downstream branches:

```bash
#!/usr/bin/env bash
# Automated downstream rebase script
set -e

CURRENT_BRANCH=$1
DOWNSTREAM_BRANCH=$2

git checkout $DOWNSTREAM_BRANCH
git rebase --onto `CURRENT_BRANCH HEAD~1`DOWNSTREAM_BRANCH
git push --force-with-lease origin $DOWNSTREAM_BRANCH
```

If merge conflicts occur during rebase, the pipeline spins up an isolated conflict-resolution agent tasked solely with resolving Git conflict markers in context.

## Operational Metrics and Trade-offs

Moving from monolithic agent outputs to stacked PRs introduces real operational trade-offs across modern engineering teams:

| Metric | Monolithic Agent PRs | Stacked Agent PRs |
| :--- | :--- | :--- |
| **Average Time to First Review** | 14.2 hours | 2.1 hours |
| **Reviewer Catch Rate for Bugs** | 38% | 84% |
| **CI/CD Pipeline Costs** | Low (1 run per feature) | High (N runs per stacked PR) |
| **Merge Conflict Frequency** | High on long-lived branches | Low, isolated per step |
| **Agent Token Cost** | Baseline (1x) | +35% (planning + step loops) |

While token costs and CI runner execution time increase by roughly 30-40%, human engineering time spent on code review decreases by over 60%. Given that senior engineering hours are significantly more expensive than compute and tokens, the ROI of stacked PR decomposition is clear.

## Key Takeaways

1. **Stop accepting 1,000+ line AI PRs:** AI models default to monoliths because it minimizes immediate context switching. Your orchestration platform must enforce logical constraints.
2. **Decomposition requires explicit planning:** Force the agent to output a dependency graph in standard JSON before writing code.
3. **Branch scope enforcement is required:** Restrict each step of the stack to specific paths to prevent unintended side effects.
4. **Trade compute for human efficiency:** Stacked PRs trade extra CI execution runs for faster code reviews and higher bug catch rates.

## What You Should Do Today

- **Audit your recent AI PRs:** Measure the average line count per agent pull request. If it exceeds 300 lines, your team is experiencing agent-induced review fatigue.
- **Implement a planning step:** Add a required pre-execution prompt phase to your custom agent scripts that outputs a structured JSON decomposition plan.
- **Adopt stacked PR tooling:** Integrate tools like Graphite (`gt`), `spr`, or GitHub Stacked PR workflows into your developer platform to automate downstream rebasing.
