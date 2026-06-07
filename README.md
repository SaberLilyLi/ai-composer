# AI Composer SDK

This repository now follows the architecture doc as a workspace SDK instead of a single React-only package.

## Primary entry

For multi-project reuse, treat `AiComposer` as the primary public module.

`AiComposer` is a reusable composer input component, not a full chat workspace. It should own input interaction, uploads, command and mention UX, and action options. Host applications should own conversation history, API calls, runtime orchestration, and page layout.

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

```tsx
<AiComposer
  placeholder="Ask or instruct..."
  commands={commands}
  mentions={mentions}
  actionOptions={actionOptions}
  uploadOptions={{ accept: ["image/*"], maxFiles: 3 }}
  onSend={async (value, { attachments }) => {
    await sendToMyService({ value, attachments });
  }}
/>
```

See [docs/AiComposer Reuse Guide.md](/F:/ai-composer/docs/AiComposer%20Reuse%20Guide.md) for module boundaries and integration rules.

## Lower-level usage

```ts
import { WorkflowRuntime } from "@company/ai-composer-core";
import { GPTProvider, GPTImageProvider } from "@company/ai-composer-providers";
```

## Migration

See [docs/Migration Guide.md](/F:/ai-composer/docs/Migration%20Guide.md) for the package split and compatibility notes.
