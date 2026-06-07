# SDK Publish Guide

## Build

Run from the workspace root:

```bash
pnpm.cmd --filter @company/ai-studio-sdk build
```

Expected output:

```text
packages/sdk/dist/index.js
packages/sdk/dist/index.d.ts
packages/sdk/dist/core.js
packages/sdk/dist/core.d.ts
packages/sdk/dist/react.js
packages/sdk/dist/react.d.ts
packages/sdk/dist/vue.js
packages/sdk/dist/vue.d.ts
packages/sdk/dist/styles.css
packages/sdk/dist/chunks/*.js
```

## Pack

Run from the workspace root:

```bash
pnpm.cmd --filter @company/ai-studio-sdk pack
```

Current verified output:

```text
F:\ai-composer\company-ai-studio-sdk-0.1.0.tgz
```

The package contains only:

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

## Install

For local validation in another project:

```bash
pnpm add F:\ai-composer\company-ai-studio-sdk-0.1.0.tgz
```

If the target project uses npm:

```bash
npm install F:\ai-composer\company-ai-studio-sdk-0.1.0.tgz
```

The current SDK package is a bundled package. It does not require installing internal workspace packages such as `@company/ai-composer`, `@company/ai-composer-core`, or `@company/ai-composer-vue`.

The target project only needs the framework peer dependencies it actually uses:

```text
react
react-dom
vue
```

## Reference

React:

```tsx
import {
  AiComposer,
  ConversationView,
  WorkflowTimeline
} from "@company/ai-studio-sdk/react";
import "@company/ai-studio-sdk/styles.css";
```

Core:

```ts
import {
  createAiStudio,
  SchemaValidator,
  WorkspaceFactory,
  PluginManager
} from "@company/ai-studio-sdk";
```

Vue:

```ts
import {
  AiComposer,
  ConversationView,
  WorkflowTimeline
} from "@company/ai-studio-sdk/vue";
```

For the car creative image validation, use the React entry when the host page is React-compatible:

```tsx
import { AiComposer, ConversationView } from "@company/ai-studio-sdk/react";
import {
  ConversationRuntime,
  GPTImageProvider,
  GPTProvider
} from "@company/ai-studio-sdk/core";
```
