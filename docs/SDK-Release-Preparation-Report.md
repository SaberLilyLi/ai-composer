# SDK Release Preparation Report

## Scope

This report covers SDK release preparation work for:

1. Public API
2. Export Structure
3. Package Structure
4. Release Checklist
5. Migration Guide
6. Business Validation Plan
7. Technical Debt
8. Release Risk

No new business features or new media plugins were added in this pass.

## Public API

Final root public API:

1. `createAiStudio`
2. `SchemaValidator`
3. `WorkspaceFactory`
4. `PluginManager`

Final React public API:

1. `AiStudioProvider`
2. `AiComposer`
3. `ConversationView`
4. `WorkflowTimeline`
5. `useAiStudio`

Final Vue public API:

1. `AiStudioProvider`
2. `AiComposer`
3. `ConversationView`
4. `WorkflowTimeline`
5. `useAiStudio`

Reference-only `core` exports retained:

1. `ChatWorkspace`
2. `ImageWorkspace`
3. `AgentWorkspace`

These workspace types are preserved as Reference Implementation outputs, not the primary recommended business integration model.

## Export Structure

Current export cleanup completed in `packages/sdk/src`:

1. root entry no longer blanket-reexports internal package surfaces
2. `react` entry only exports supported UI surfaces
3. `vue` entry only exports supported UI surfaces
4. `core` entry retains enterprise core APIs and reference workspace types

Forbidden from SDK root and `core` entry:

1. `requestAgentChat`
2. `requestAgentImage`
3. `getAgentRuntimeConfig`
4. legacy adapters
5. runtime helper internals

## Package Structure

Target package family remains:

1. `@company/ai-studio-sdk`
2. `@company/ai-studio-sdk/react`
3. `@company/ai-studio-sdk/vue`
4. `@company/ai-studio-sdk/core`

Current state:

- package subpath structure exists and is buildable
- explicit `exports` exist in `packages/sdk/package.json`
- SDK-level export tests now verify surface restrictions

## Release Checklist

Added:

- [Release-Checklist.md](/F:/ai-composer/docs/Release-Checklist.md)

Checklist covers:

1. Build
2. Test
3. Docs
4. Version
5. Publish
6. Verify

## Migration Guide

Added:

- [SDK-Integration-Guide.md](/F:/ai-composer/docs/SDK-Integration-Guide.md)

Guide covers:

1. React integration
2. Vue integration
3. `createAiStudio`
4. `AiStudioProvider`
5. `AiComposer`
6. `ConversationView`
7. `WorkflowTimeline`

## Business Validation Plan

Added:

- [Business-Validation-Plan.md](/F:/ai-composer/docs/Business-Validation-Plan.md)

First validation project:

`二手车创意生图`

Planned migration range:

1. input area
2. message area
3. image result area

## Tree Shaking Audit

Audit result:

1. `packages/sdk/package.json` uses explicit `exports`
2. `packages/sdk/package.json` keeps `sideEffects: false`
3. public entries are now explicit named re-exports instead of blanket `export *`
4. root import no longer drags framework surfaces by default

Residual note:

- the SDK umbrella package still resolves through internal implementation packages, so final bundle shape also depends on those downstream package side-effect policies

## Technical Debt

1. `@company/ai-studio-sdk` still depends on older internal package names:
   `@company/ai-composer`, `@company/ai-composer-core`, `@company/ai-composer-vue`
2. Vue implementation remains concentrated in a large single file and is less maintainable than the React surface
3. Workspace-level reference implementations still exist in framework packages and may be misused if consumers bypass the SDK umbrella entry
4. style packaging is still inherited from the underlying React package rather than being owned directly by the umbrella package
5. release automation for versioning and publishing is still manual

## Release Risk

1. Public API ambiguity is reduced at the SDK umbrella level, but older internal packages still expose broader surfaces
2. Single-package publish readiness is incomplete until the dependency publication story is finalized
3. Vue parity exists at the contract level, but maintainability risk remains higher than React
4. business validation against a real migration target is still pending

## RC Judgment

Judgment:

`@company/ai-studio-sdk` is close to an Internal Release Candidate, but it does not yet fully meet Internal RC standard for broad internal release.

Current status:

- API boundary: acceptable
- export structure: acceptable
- package subpaths: acceptable
- docs set: acceptable
- migration guidance: acceptable
- single-package release readiness: not yet fully acceptable
- business migration validation: not yet completed

Final conclusion:

The SDK is a **conditional Internal RC candidate**.

It should proceed to:

1. package publish dry-run verification
2. dependency publication alignment
3. first business migration validation

before being treated as a full Internal RC.
