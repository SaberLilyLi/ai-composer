# Public API Review

## Scope

This review covers the enterprise SDK release surface for:

1. `@company/ai-studio-sdk`
2. `@company/ai-studio-sdk/react`
3. `@company/ai-studio-sdk/vue`
4. `@company/ai-studio-sdk/core`

The goal is to keep the external API stable, installable, and business-safe without exposing internal runtime helpers or legacy compatibility paths.

## Public API Decision

### `@company/ai-studio-sdk`

Expose:

1. `createAiStudio`
2. `SchemaValidator`
3. `WorkspaceFactory`
4. `PluginManager`

Reason:

- These are the enterprise composition and governance entry points.
- They are stable enough to represent the SDK root contract.

### `@company/ai-studio-sdk/react`

Expose:

1. `AiStudioProvider`
2. `AiComposer`
3. `ConversationView`
4. `WorkflowTimeline`
5. `useAiStudio`

Reason:

- These represent the recommended reusable React integration surface.
- They support host-controlled page composition without forcing a built-in workspace shell.

### `@company/ai-studio-sdk/vue`

Expose:

1. `AiStudioProvider`
2. `AiComposer`
3. `ConversationView`
4. `WorkflowTimeline`
5. `useAiStudio`

Reason:

- This mirrors the React surface at the SDK contract level.
- It keeps the cross-framework entry model aligned.

### `@company/ai-studio-sdk/core`

Expose:

1. `createAiStudio`
2. `SchemaValidator`
3. `WorkspaceFactory`
4. `PluginManager`
5. reference workspace types:
   `ChatWorkspace`, `ImageWorkspace`, `AgentWorkspace`

Reason:

- `core` should remain the lower-level enterprise entry.
- Workspace output types are retained for advanced consumers, but not promoted as the primary UI integration path.

## Reference Implementation Audit

The following should remain available only as reference-level contracts:

1. `ChatWorkspace`
2. `ImageWorkspace`
3. `AgentWorkspace`

Required guidance:

- Business projects should compose `AiComposer`, `ConversationView`, and `WorkflowTimeline`.
- Business projects should not bind their UI architecture to the internal workspace shell.

## Internal-Only Audit

The following should not be exported from the SDK root entry:

1. `ConversationRuntime`
2. `WorkflowRuntime`
3. `ProviderRegistry`
4. `createRuntimeProviderBundle`
5. `getAgentRuntimeConfig`
6. `requestAgentChat`
7. `requestAgentImage`
8. `toAttachmentPreviews`
9. `LegacyChatProvider`
10. `LegacyImageProvider`
11. internal helper modules and legacy adapters

Reason:

- They are implementation detail APIs.
- They weaken the SDK boundary and increase support burden.
- They encourage business code to couple to runtime internals.

## React Surface Audit

The following React exports should stay internal or non-SDK-primary:

1. `AgentConversationWorkspace`
2. `AiStudioWorkspace`
3. `AiStudioDevtools`
4. `createReactAdapter`
5. controller-level agent runtime config types

Reason:

- These are either reference implementations, dev-only tools, or adapter internals.
- They are not part of the stable external composition contract.

## Vue Surface Audit

The following Vue exports should stay internal or non-SDK-primary:

1. `AgentConversationWorkspace`
2. `AiStudioWorkspace`
3. `AiStudioDevtools`
4. `createVueAdapter`
5. runtime-building helpers embedded in the current Vue file

Reason:

- These are not the intended stable SDK surface.
- They keep implementation concerns mixed with the public entry if exported broadly.

## Release Judgment

Recommended public surface is now:

1. enterprise root composition APIs
2. reusable framework UI surfaces
3. reference workspace types only on `core`

Anything below runtime, helper, or legacy level should remain internal for the RC release.
