# AI Composer SDK

This repository now follows the architecture doc as a workspace SDK instead of a single React-only package.

## Packages

1. `packages/shared`: shared types, workflow contracts, theme tokens
2. `packages/providers`: provider interfaces plus GPT/mock provider implementations
3. `packages/core`: composer state, engines, parser, workflow runtime, plugins
4. `packages/react`: React components and adapter package published as `@company/ai-composer`
5. `packages/vue`: Vue package boundary and adapter contract
6. `packages/playground`: runnable demo app

## Core principles

1. Business logic lives in `core`
2. Framework adaptation lives in `react` and `vue`
3. AI capability flows through provider interfaces
4. Workflow is the unifying execution model

## Commands

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

`pnpm dev` starts the local playground on port `4173`.

## React usage

```tsx
import { AiComposer } from "@company/ai-composer";
import "@company/ai-composer/styles.css";
```

## Lower-level usage

```ts
import { WorkflowRuntime } from "@company/ai-composer-core";
import { GPTProvider, GPTImageProvider } from "@company/ai-composer-providers";
```

## Migration

See [docs/Migration Guide.md](/F:/ai-composer/docs/Migration%20Guide.md) for the package split and compatibility notes.
