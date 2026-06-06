# AI Composer Migration Guide

## Package split

The SDK now ships as a workspace with these package boundaries:

1. `@company/ai-composer-shared`
2. `@company/ai-composer-providers`
3. `@company/ai-composer-core`
4. `@company/ai-composer`
5. `@company/ai-composer-vue`

## React consumers

Existing React imports stay on `@company/ai-composer`:

```ts
import { AiComposer, AgentConversationWorkspace } from "@company/ai-composer";
```

## New extension points

Use the new packages when you need lower-level integration:

```ts
import { WorkflowRuntime, ComposerCore } from "@company/ai-composer-core";
import { GPTProvider, GPTImageProvider } from "@company/ai-composer-providers";
```

## Compatibility notes

1. `AiComposer` remains the main React package export.
2. `AgentConversationWorkspace` remains available.
3. Existing plugin classes are preserved and now come from the core package.
4. Vue support is introduced as a package boundary and adapter contract, ready for a full renderer implementation.
