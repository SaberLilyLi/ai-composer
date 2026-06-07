# Phase-05 Enterprise SDK Foundation Report

## Phase Information

- Phase: Phase-05 Enterprise SDK Foundation
- Goal: Build the enterprise SDK foundation on top of the Phase-04 unified runtime chain
- Scope:
  - Schema
  - Factory
  - Plugin
  - Config
  - Documentation
  - React / Vue SDK provider layer
- Explicitly not developed:
  - Video generation runtime
  - Avatar runtime
  - Audio runtime
  - Multi-agent
  - Complex business features

## Enterprise SDK Readiness Review

### Current Core

Current `core` already had the right foundation after Phase-04:

- `ConversationRuntime`
- `WorkflowRuntime`
- `ProviderRegistry`
- `RuntimeEventBus`
- `createRuntimeProviderBundle()`

This means Phase-05 did not need a new runtime chain. It only needed a configuration and composition layer above the existing runtime.

### Current Runtime

The main runtime chain remains:

```text
AiStudio / Workspace
  -> ConversationRuntime / WorkflowRuntime
  -> ProviderRegistry
  -> Provider
```

Phase-05 keeps this chain intact and does not reintroduce legacy direct calls.

### Current Provider

Provider access remains centralized in:

- `ProviderRegistry`
- `createRuntimeProviderBundle()`
- provider implementations in `packages/providers`

Phase-05 only adds schema/config selection on top of this provider layer.

### Current Workspace

Workspace capability before this phase:

- React workspace was usable
- Vue workspace had runtime parity but no enterprise configuration entry
- External consumers still needed to understand internal config details

Phase-05 closes this gap by adding schema-driven studio creation and framework-level providers.

## New Files

- `packages/core/src/schema/types.ts`
- `packages/core/src/schema/index.ts`
- `packages/core/src/SchemaValidator.ts`
- `packages/core/src/WorkspaceFactory.ts`
- `packages/core/src/DocumentationGenerator.ts`
- `packages/core/src/createAiStudio.ts`
- `packages/core/src/Schema.test.ts`
- `packages/core/src/SchemaValidator.test.ts`
- `packages/core/src/WorkspaceFactory.test.ts`
- `packages/core/src/PluginManager.test.ts`
- `packages/core/src/EnterpriseConfig.test.ts`
- `packages/react/src/studio/AiStudioProvider.tsx`
- `packages/react/src/studio/AiStudioWorkspace.tsx`
- `examples/README.md`
- `examples/ChatExample.tsx`
- `examples/ImageExample.tsx`
- `examples/AgentExample.tsx`
- `examples/SchemaExample.ts`
- `examples/PluginExample.ts`
- `docs/Phase-05-Enterprise-SDK-Foundation-Report.md`

## Modified Files

- `packages/core/src/PluginManager.ts`
- `packages/core/src/index.ts`
- `packages/react/src/index.ts`
- `packages/vue/src/index.ts`

## Schema Structure

Added `packages/core/src/schema` and built a unified schema contract:

- `WorkspaceSchema`
- `ProviderSchema`
- `FeatureSchema`
- `ThemeSchema`

Supported normalized workspace structure:

```json
{
  "workspace": "image",
  "provider": "openai",
  "chatModel": "gpt-5.5",
  "imageModel": "gpt-image-2",
  "features": ["upload", "workflow", "history"],
  "theme": {
    "mode": "auto",
    "tokens": {}
  },
  "providerConfig": {
    "provider": "openai",
    "apiKey": "",
    "baseUrl": "https://api.openai.com/v1",
    "chatModel": "gpt-5.5",
    "imageModel": "gpt-image-2",
    "timeout": 30000,
    "maxRetries": 2
  }
}
```

## Schema Validator

Added `SchemaValidator` with:

- `defaults(kind, input)`
- `normalize(kind, input)`
- `validate(kind, input)`

Supported schema kinds:

- `workspace`
- `provider`
- `feature`
- `theme`

This closes the previous gap where the project had runtime objects but no unified enterprise configuration contract.

## Factory Structure

Added `WorkspaceFactory` with:

- `createWorkspace()`

Output types:

- `ChatWorkspace`
- `ImageWorkspace`
- `AgentWorkspace`

Factory responsibilities:

- normalize schema
- create `ConversationRuntime`
- create `WorkflowRuntime`
- register providers into `ProviderRegistry`
- bind enterprise plugin context

Main structure:

```text
WorkspaceFactory
  -> SchemaValidator
  -> createRuntimeProviderBundle
  -> ConversationRuntime
  -> WorkflowRuntime
  -> ProviderRegistry
  -> PluginManager
```

## Plugin Framework

`PluginManager` was upgraded into a backward-compatible V2-style enterprise plugin manager.

Added:

- `PluginManifest`
- `AiStudioPluginContext`
- `AiStudioPlugin`
- `PluginRecord`

Supported APIs:

- `registerPlugin()`
- `removePlugin()`
- `enablePlugin()`
- `disablePlugin()`
- `listPlugins()`

Supported lifecycle:

- `install()`
- `activate()`
- `deactivate()`
- `uninstall()`

Reserved plugin capability examples remain interface-only:

- `video_generate`
- `avatar_generate`
- `audio_generate`

No corresponding runtime was implemented in this phase.

## Enterprise Config

Added:

- `createAiStudio()`

This is now the top-level enterprise configuration entry:

```ts
createAiStudio({
  provider: "openai",
  chatModel: "gpt-5.5",
  imageModel: "gpt-image-2",
  workspace: "image",
  features: ["workflow", "upload"]
});
```

Returned object includes:

- normalized `schema`
- `workspace`
- `validator`
- `documentation`

This closes the main enterprise SDK gap identified in the current assessment report.

## React SDK

Added React enterprise SDK layer:

- `AiStudioProvider`
- `useAiStudio()`
- `AiStudioWorkspace`

React capability delivered:

- schema injection
- studio injection
- workspace bootstrap from `createAiStudio()`
- direct mapping from enterprise schema to existing `AgentConversationWorkspace`

Consumer path:

```text
npm install
  -> createAiStudio()
  -> <AiStudioProvider>
  -> <AiStudioWorkspace />
```

## Vue SDK

Added Vue enterprise SDK layer:

- `AiStudioProvider`
- `useAiStudio()`
- `AiStudioWorkspace`

Vue capability now aligns with React at the entry-contract level:

- studio injection
- schema-driven workspace bootstrap
- enterprise config consumption

This is capability parity, not full implementation parity of internal surface richness.

## Documentation Generator

Added:

- `DocumentationGenerator`

Current output:

- React usage docs
- Vue usage docs
- props summary docs
- schema docs
- plugin docs

This is a generator-level foundation, not yet a docs-site pipeline.

## Examples

Added `examples/` with the required minimum set:

- `ChatExample.tsx`
- `ImageExample.tsx`
- `AgentExample.tsx`
- `SchemaExample.ts`
- `PluginExample.ts`

These demonstrate the enterprise entry model rather than introducing new business features.

## Runtime Main Chain After Phase-05

```text
createAiStudio
  -> WorkspaceFactory
  -> ConversationRuntime / WorkflowRuntime
  -> ProviderRegistry
  -> Provider
```

React / Vue providers sit above this chain and do not bypass it.

## Test Results

Executed successfully:

- `pnpm.cmd --filter @company/ai-composer-core build`
- `pnpm.cmd --filter @company/ai-composer build`
- `pnpm.cmd --filter @company/ai-composer-vue build`
- `pnpm.cmd --filter @company/ai-composer-core test`
- `pnpm.cmd --filter @company/ai-composer test`
- `pnpm.cmd build`
- `pnpm.cmd test`

New test coverage added:

- `Schema.test.ts`
- `SchemaValidator.test.ts`
- `WorkspaceFactory.test.ts`
- `PluginManager.test.ts`
- `EnterpriseConfig.test.ts`

## Technical Debt

Remaining main technical debt:

1. Vue package is still implemented as a single-file surface and has lower maintainability than React.
2. `AiStudioWorkspace` currently maps enterprise schema into existing workspace props rather than fully driving the UI from a shared runtime injection contract.
3. Documentation generation exists as code-level output only; it is not yet connected to a publishable docs pipeline.
4. Plugin isolation is lifecycle-based but not yet sandboxed or capability-guarded.
5. `SchemaValidator` is hand-rolled; there is no external schema DSL or JSON-schema export yet.

## Phase-05 Completion Judgment

Judgment:

> Phase-05 Enterprise SDK Foundation target is completed within the requested scope.

Completed foundation:

- unified schema contract
- validator
- workspace factory
- plugin framework
- enterprise config entry
- React SDK provider layer
- Vue SDK provider layer
- examples
- tests
- acceptance report

Not included by design:

- video/avatar/audio implementation
- plugin marketplace
- schema DSL expansion
- workspace business expansion

## Recommendation For Next Phase

Recommended next step is not to add more runtime features immediately.

Recommended follow-up:

1. Refactor Vue package into multiple files while preserving current contract.
2. Move `AiStudioWorkspace` toward true external runtime injection, reducing duplicate runtime creation inside UI wrappers.
3. Promote `DocumentationGenerator` output into published React/Vue/API docs.
4. Add capability guards and permission metadata for enterprise plugins.
5. Add JSON-schema export or schema introspection for platform-side config tooling.
