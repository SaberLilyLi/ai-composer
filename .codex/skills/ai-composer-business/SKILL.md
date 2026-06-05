---
name: ai-composer-business
description: Business configuration and execution workflow for the AI Composer workspace. Use when Codex needs to analyze, design, implement, review, or extend this project under its local product rules, phased delivery process, enterprise AI UI constraints, and single-source multi-framework architecture.
---

# AI Composer Business

## Overview

Use this skill as the local business baseline for the `ai-composer` project.
Treat it as the source of truth for product thinking, phased execution, architecture boundaries, and design consistency before writing code.

## Operating Rules

Follow this order for every feature or page:

1. Requirement clarification
2. Product analysis
3. Wireframe or page structure
4. UI design review
5. Technical solution
6. Development

Do not jump directly into coding.
Default to MVP-first delivery and validate core value before expanding scope.

## Hard Constraints

Treat these as non-negotiable:

1. Maintain one core component implementation, not separate business implementations for Vue and React.
2. Keep framework adaptation inside `src/adapters`; do not place business logic there.
3. Put business logic in `src/core`; components only render, bind events, and handle interaction.
4. Use `TypeScript`, `TSX`, `TailwindCSS`, `Vite`, `pnpm`, `Vitest`, and `Storybook`.
5. Do not introduce UI frameworks such as `Element Plus`, `Naive UI`, `Ant Design`, `Arco Design`, or `Bootstrap`.
6. Do not introduce state libraries such as `Redux`, `Mobx`, `Pinia`, `Vuex`, or `Zustand`; use `ComposerCore` as the unified state owner.
7. Phase 1 input must use `textarea`, not `contenteditable`.
8. Every new capability must be plugin-oriented; do not directly expand core behavior without a clear plugin boundary.
9. Use semantic theme tokens and support light and dark themes from the first implementation pass.
10. Follow the existing project and workspace instructions as hard constraints. As of `2026-06-05`, `ai-composer-rules.md` is empty, so the effective hard constraints are the workspace `AGENTS.md`, this skill, `ai-composer-skill.md`, and the technical plan.

## Product and UX Baseline

Design for an enterprise AI product with these qualities:

1. Professional, modern, trustworthy, premium, technology-oriented.
2. Prioritize task flow, execution status, result display, and history.
3. Prefer efficient, calm interfaces inspired by OpenAI, Cursor, Claude, Notion, Linear, and Perplexity.
4. Avoid flashy visuals, meaningless gradients, cyberpunk styling, heavy glassmorphism, and decorative complexity.
5. Prioritize usability over visual gimmicks.

## Required Design Review Sequence

Use the minimum relevant subset below before implementation, and do not skip the analysis stage:

1. `product-manager`
2. `startup-product-mode`
3. `wireframe-generator`
4. `ui-auditor`
5. `ui-designer` or `ai-product-ui`
6. `ux-reviewer`
7. Development

When the task is specifically a page or surface review, prefer:

1. `figma-thinking`
2. `product-manager`
3. `wireframe-generator`
4. `ui-auditor`
5. `ai-product-ui`
6. `ux-reviewer`
7. Development

## Architecture Baseline

Use this structure unless there is a strong reason to extend it:

```text
src/
  core/
  components/
  plugins/
  styles/
  adapters/
  presets/
```

Core responsibilities:

1. `ComposerCore`: state, send flow, upload flow, event system, plugin management
2. `Store`: state storage
3. `EventBus`: event communication
4. `HistoryManager`: history records
5. `UploadManager`: file upload lifecycle
6. `PluginManager`: plugin registration and orchestration

Component responsibilities:

1. Render UI
2. Handle interaction
3. Bind events

Never place API requests, state orchestration, or business workflows inside presentational components.

## Plugin Contract

Use this contract for pluggable capabilities:

```ts
interface ComposerPlugin {
  name: string
  install(composer: ComposerCore): void
}
```

Default planned plugins:

1. `MentionPlugin` for `@`
2. `CommandPlugin` for `/`
3. `UploadPlugin` for attachments
4. `PromptPlugin` for prompt templates

## Theme and Design Tokens

Do not hardcode raw page colors as the default approach.
Define semantic variables such as:

```text
--color-bg-primary
--color-bg-secondary
--color-text-primary
--color-text-secondary
--color-border-primary
--color-brand-primary
```

Plan light theme and dark theme in the first implementation pass.

## Delivery Phases

Implement in controlled phases:

### Phase 1

Deliver:

```text
AiComposer
SendButton
StopButton
```

MVP behaviors:

1. Multi-line input
2. Auto height
3. Enter to send
4. Shift+Enter for newline
5. Stop generation

### Phase 2

Deliver:

```text
AttachmentList
UploadPlugin
```

### Phase 3

Deliver:

```text
MentionPanel
CommandPanel
```

### Phase 4

Deliver:

```text
SSE
WebSocket
```

### Phase 5

Deliver:

```text
Storybook
Vitest
NPM Package
CI/CD
```

## Execution Pattern for This Workspace

For every substantial step:

1. Read the local docs first.
2. Produce product analysis and MVP scope.
3. Clarify component tree, page structure, state plan, and API plan before development.
4. Implement only the agreed current phase or sub-step.
5. Stop and wait for user confirmation before moving to the next phase or major step.
6. After each module, run tests when available, fix lint issues, and update Storybook coverage when present.

## References

Read these local sources when the task needs the original wording or more detail:

1. `F:\复用性对话框\ai-composer\ai-composer-skill.md`
2. `F:\复用性对话框\ai-composer\AI-Composer-完整版技术方案.md`
3. `F:\复用性对话框\ai-composer\ai-composer-rules.md`
