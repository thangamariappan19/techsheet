---
title: "The Cost of Saying Yes Has Changed: Architecting for Code Deletion in the AI Era"
date: "2026-07-20"
description: "AI made writing code virtually free, but maintaining it is more expensive than ever. Learn how to architect your codebase for aggressive code deletion."
tags: ["Software Architecture","AI Coding Agents","Clean Code","Developer Productivity"]
headerImage: "https://picsum.photos/seed/the-cost-of-saying-yes-has-changed-architecting-for-code-deletion-in-the-ai-era-34942/1200/800"
author: "Thanga Mariappan"
isPublished: true
---

The global software industry is undergoing a massive shift. As highlighted in a recent GitHub perspective, the economic calculus of software development has fundamentally inverted. The cost of writing code has plummeted to near zero, driven by LLMs, agentic workflows, and highly optimized code-generation systems. 

However, the cost of *owning* code has not changed. If anything, it has exponentially increased.

As Senior Front-End Architects and Tech Leads, our primary job used to be helping teams write code faster. Today, our primary job is preventing our codebases from drowning in a sea of cheap, AI-generated technical debt. Every line of code added is a liability. It must be read, tested, refactored, secured, and navigated by both human developers and future AI agents. 

If we want to survive this transition, we must stop architecting for code creation and start architecting for **code deletion**.

---

## The New Math of Software Engineering

Historically, the lifecycle of a feature looked something like this:
* **Ideation & Design:** 20%
* **Writing Code:** 40%
* **Maintenance & Refactoring:** 40%

In 2026, with advanced developer agents, the lifecycle looks more like this:
* **Ideation & Design:** 20%
* **Writing Code:** 1%
* **Maintenance, Security, and Code Ownership:** 79%

When writing code is expensive, we say "no" to features by default. We filter ideas through strict ROI calculations because we know engineering hours are scarce. Now that AI can generate a fully functional React component, its corresponding state machine, and unit tests in under 10 seconds, the pressure to say "yes" is immense. 

But "yes" has a hidden cost. More code means larger RAG (Retrieval-Augmented Generation) index sizes, higher token usage for agentic context windows, slower build times, and increased cognitive overhead. 

To combat this, we must build systems that assume code is temporary, disposable, and easily purged.

---

## Pattern 1: The Discardable Feature Module

Traditional architectures encourage shared abstractions. We write a helper, put it in a `shared/utils` directory, and encourage every developer (and agent) to import it. 

In the AI era, this is a recipe for disaster. An agent looking for a utility will happily import your shared helper, creating deep, implicit dependency graphs that make it impossible to delete the original feature later without a cascading refactor.

Instead, we must adopt a **Share-Nothing, Colocate-Everything** philosophy. Features should be packaged as self-contained micro-applications within your monorepo.

### Example: The Self-Contained Feature Boundary

Instead of spreading state, types, and styles across the app, bundle them into a single, isolated directory with a strict public API exposed via an `index.ts` file.

```typescript
// src/features/ai-search-widget/index.ts

// We only export the entry-point component. 
// Internal helper functions, sub-components, and hooks are strictly private.
export { AISearchWidget } from "./components/AISearchWidget";
export type { AISearchWidgetProps } from "./types";
```

Inside this directory, the AI is free to generate as many helper functions as it wants. If the business decides to deprecate the AI Search Widget three months from now, deleting it is as simple as running:

```bash
rm -rf src/features/ai-search-widget
```

No dangling utility imports, no broken tests in other parts of the system, and no dead code left behind.

---

## Pattern 2: Telemetry-Driven Self-Deprecation

If we cannot stop agents and developers from adding features, we must automate the discovery of dead code. We can achieve this by embedding telemetry directly into our architectural boundaries.

By wrapping experimental or low-confidence features in a telemetry-aware wrapper, we can gather real-world usage metrics. If a feature goes unused for a specified period, our CI/CD pipeline flags it for deletion.

Here is a TypeScript implementation of a self-monitoring feature wrapper:

```typescript
import React, { useEffect } from "react";

interface FeatureFlagProps {
  featureId: string;
  owner: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureBoundary: React.FC<FeatureFlagProps> = ({
  featureId,
  owner,
  fallback = null,
  children,
}) => {
  useEffect(() => {
    // Log usage telemetry to our monitoring system
    sendTelemetry("feature_impression", {
      featureId,
      owner,
      timestamp: Date.now(),
    });
  }, [featureId, owner]);

  const isFeatureEnabled = useFeatureLookup(featureId);

  return isFeatureEnabled ? <>{children}</> : <>{fallback}</>;
};

function sendTelemetry(event: string, payload: Record<string, unknown>) {
  // Telemetry endpoint implementation
  console.log(`[Telemetry - ${event}]:`, payload);
}

function useFeatureLookup(featureId: string): boolean {
  // Fetch runtime flag status
  return true;
}
```

With this pattern established, we can run a nightly script that queries our telemetry database (e.g., Datadog, LogRocket, or Mixpanel) for any `featureId` that has had zero impressions in the last 30 days. The script automatically opens a GitHub issue assigned to the specified `owner` with a clear mandate: **Remove this dead code or justify its existence.**

---

## Establishing an AI-Era Code Quality Gate

AI agents are notorious for inventing "hallucinated utilities"—creating duplicate helper functions (like `formatDateISO`, `formatISODate`, and `toISODateString`) because they don't have perfect global context of your codebase.

To prevent this helper sprawl, we can write custom static analysis rules to enforce architectural boundaries. Below is an ESLint rule configuration (using AST checking) that prevents modules inside a feature folder from importing internal modules of *other* features.

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["src/features/*/*"],
            "message": "Do not import internal files from other features. Use the public entry-point (src/features/[feature-name]) instead."
          }
        ]
      }
    ]
  }
} 
```

By enforcing this single constraint, we ensure that every feature remains highly modular and, more importantly, easily deletable.

---

## The "Cost of Saying Yes" Decision Matrix

When a developer or an AI agent submits a Pull Request, the reviewer should evaluate it not by how much value the code adds today, but by how hard it will be to maintain tomorrow. 

Use this architectural scorecard to evaluate incoming PRs:

| Criteria | High Risk (Red Flag) | Low Risk (Green Flag) |
| :--- | :--- | :--- |
| **Coupling** | Modifies shared utility files or extends global state. | Self-contained within a dedicated feature directory. |
| **Dependencies** | Installs new npm packages to solve minor problems. | Uses standard runtime APIs or existing, verified libraries. |
| **Testability** | Requires complex mocking of global routers or stores. | Isolated unit tests with clear input and output boundaries. |
| **Ownership** | Placed in a general-purpose directory with no clear owner. | Bound to a validated team or system owner via `CODEOWNERS`. |
| **Lifecycle** | Intended to live indefinitely without a review timeline. | Wrapped in a feature flag with a planned deprecation date. |

---

## Key Takeaways

* **Code is a Liability:** The cost of writing code is near zero; the cost of maintaining it remains high. We must treat every new line of code as an ongoing expense.
* **Design for Deletion:** Structure your software architecture using isolated, self-contained feature folders. Avoid global shared abstractions unless absolutely necessary.
* **Automate Garbage Collection:** Implement telemetry on your features and use static analysis tools to flag and delete unused code paths systematically.
* **Guard Your Boundaries:** Use strict linting and module resolution rules to prevent AI agents from weaving complex dependency webs across your codebase.

---

## What You Should Do Today

1. **Identify the Bloat:** Scan your repository for directories that have not been modified or accessed by users in the last six months. Archive them.
2. **Set Up `CODEOWNERS`:** Ensure every single folder in your repository has a designated human or team owner responsible for its lifecycle.
3. **Refactor One Shared Utility:** Take a heavily shared utility function and colocate its logic directly into the features that use it. Experience how much easier it becomes to reason about those features in isolation.
