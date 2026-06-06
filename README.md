# `@company/ai-composer`

A reusable AI composer component library for React applications.

It currently ships two main exports:

- `AiComposer`: the standalone composer component
- `AgentConversationWorkspace`: a ready-to-use chat and image generation workspace built on top of the composer

## Install

From a local workspace package:

```bash
npm install ../ai-composer
```

Or from a packed tarball:

```bash
npm pack
npm install ../ai-composer/company-ai-composer-0.1.0.tgz
```

## Build

```bash
npm run build
```

## Usage

Import the component and its stylesheet:

```tsx
import { AiComposer } from "@company/ai-composer";
import "@company/ai-composer/styles.css";

export function Demo() {
  return (
    <AiComposer
      placeholder="Ask, write, or upload an image..."
      uploadOptions={{
        accept: ["image/*"],
        maxFiles: 9,
        maxFileSize: 10 * 1024 * 1024
      }}
      onSend={async (value, context) => {
        console.log(value, context.attachments);
      }}
    />
  );
}
```

## Agent Workspace

```tsx
import { AgentConversationWorkspace } from "@company/ai-composer";
import "@company/ai-composer/styles.css";

export function AgentDemo() {
  return (
    <AgentConversationWorkspace
      theme="dark"
      config={{
        apiKey: import.meta.env.VITE_AGENT_API_KEY,
        chatModel: import.meta.env.VITE_AGENT_CHAT_MODEL ?? "qwen3.7-plus",
        imageModel: import.meta.env.VITE_AGENT_IMAGE_MODEL ?? "wan2.7-image-pro"
      }}
    />
  );
}
```

## Environment Variables

If you use `AgentConversationWorkspace`, these environment variables are supported:

```env
VITE_AGENT_API_KEY=your_api_key
VITE_AGENT_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_AGENT_CHAT_MODEL=qwen3.7-plus
VITE_AGENT_IMAGE_MODEL=wan2.7-image-pro
```

## Exports

Main exports from the package entry:

- `AiComposer`
- `AgentConversationWorkspace`
- `ComposerCore`
- `CommandPlugin`
- `MentionPlugin`
- `UploadPlugin`
- related TypeScript types

## Notes

- Remember to import `@company/ai-composer/styles.css` in the consuming project.
- `react` and `react-dom` are peer dependencies.
- The package build output is written to `dist/`.
