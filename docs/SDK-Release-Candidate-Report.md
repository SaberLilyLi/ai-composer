# SDK Release Candidate Report

## Scope

This report covers the current SDK package preparation for the used-car creative image validation project.

No new SDK features were developed.

Unchanged areas:

1. Runtime
2. Provider
3. Plugin
4. business project code

## Build Status

Verified command:

```bash
pnpm.cmd --filter @company/ai-studio-sdk build
```

Result:

```text
Passed
```

The SDK builds successfully and emits `dist` files for:

1. root entry
2. `core`
3. `react`
4. `vue`

## Pack Status

Verified command:

```bash
pnpm.cmd --filter @company/ai-studio-sdk pack
```

Result:

```text
Passed
```

Generated package:

```text
F:\ai-composer\company-ai-studio-sdk-0.1.0.tgz
```

Package contents:

```text
dist/core.d.ts
dist/core.js
dist/index.d.ts
dist/index.js
dist/react.d.ts
dist/react.js
dist/styles.css
dist/types.d.ts
dist/vue.d.ts
dist/vue.js
dist/chunks/createAiStudio-*.js
package.json
```

## Publish Readiness

Current judgment:

```text
Conditionally publishable for internal validation.
```

The package can be built and packed as a bundled SDK package.

It does not declare internal workspace package dependencies.

Required peer dependencies:

1. `react`
2. `react-dom`
3. `vue`

## Install Readiness

Current judgment:

```text
Installable as a single SDK package when framework peer dependencies are present.
```

Fast local validation install:

```bash
pnpm add F:\ai-composer\company-ai-studio-sdk-0.1.0.tgz
```

The target project does not need to install `@company/ai-composer`, `@company/ai-composer-core`, or `@company/ai-composer-vue`.

## Used-Car Creative Image Validation Readiness

Current judgment:

```text
Ready for validation with controlled setup.
```

The validation can use:

1. `AiComposer` for input
2. `ConversationView` for message history
3. `ConversationRuntime` for prompt conversation flow
4. `GPTProvider` for prompt refinement
5. `GPTImageProvider` for image generation and edit

Example added:

```text
examples/CarCreativeImageDemo.tsx
```

## Migration Workload

Estimated migration workload for the used-car project:

```text
1 to 2 engineering days for first validation
```

Expected work:

1. install SDK package and required framework peer dependencies
2. replace input area with `AiComposer`
3. map existing messages into `ConversationView`
4. connect `onSend` to existing business submit handler
5. optionally add `ConversationRuntime` for prompt refinement
6. preserve existing image result area and download behavior
7. verify style compatibility

## Risk Points

1. the target used-car project may need message schema mapping
2. `GPTImageProvider` compatibility depends on the target image API behavior
3. existing UI theme may require token or class alignment
4. follow-up image editing requires the previous image URL to be accepted by the image provider endpoint
5. the target project must provide compatible framework peer dependencies

## Final RC Judgment

Final status:

```text
Internal Validation RC
```

The SDK is currently:

1. buildable
2. packable
3. installable as a bundled package
4. suitable for controlled used-car creative image validation

It is not yet a fully public npm release candidate because real target-project installation and business validation still need to be completed.
