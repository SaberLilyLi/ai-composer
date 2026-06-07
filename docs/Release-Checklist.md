# Release Checklist

## Build

1. Run `pnpm build` from the workspace root.
2. Run `pnpm --filter @company/ai-studio-sdk build`.
3. Confirm `packages/sdk/dist` contains:
   `index.js`, `react.js`, `vue.js`, `core.js`, and matching `.d.ts` files.
4. Confirm React and Vue package builds complete before packing the SDK umbrella package.

## Test

1. Run `pnpm test`.
2. Run `pnpm --filter @company/ai-studio-sdk test`.
3. Confirm export-guard tests pass for root, `react`, `vue`, and `core`.
4. Confirm no new failing tests were introduced in `core`, `react`, or `vue`.

## Docs

1. Review `docs/Public-API-Review.md`.
2. Review `docs/SDK-Integration-Guide.md`.
3. Review `docs/Business-Validation-Plan.md`.
4. Confirm release notes mention Reference Implementation status for workspace outputs.
5. Confirm docs do not recommend `AgentConversationWorkspace` as the primary business integration path.

## Version

1. Bump workspace package versions intentionally.
2. Confirm SDK root version matches dependent package versions.
3. Confirm changelog or release summary reflects packaging-only scope.
4. Confirm no unpublished breaking API changes were introduced silently.

## Publish

1. Run a dry pack for `packages/sdk`.
2. Verify packaged files only include intended dist artifacts and metadata.
3. Publish internal implementation packages required by the umbrella package dependency chain.
4. Publish `@company/ai-studio-sdk` after dependency versions are available.

## Verify

1. Install `@company/ai-studio-sdk` into a clean React app.
2. Import from `@company/ai-studio-sdk/react`.
3. Install into a clean Vue app.
4. Import from `@company/ai-studio-sdk/vue`.
5. Verify root import resolves:
   `createAiStudio`, `SchemaValidator`, `WorkspaceFactory`, `PluginManager`.
6. Verify forbidden root APIs are not available.
