# React SDK

```tsx
import { AiStudioProvider, AiStudioWorkspace } from "@company/ai-studio-sdk/react";
import { createAiStudio } from "@company/ai-studio-sdk/core";

const studio = createAiStudio(
{
  "workspace": "agent",
  "provider": "openai",
  "chatModel": "gpt-5.5",
  "imageModel": "gpt-image-2",
  "features": [
    "upload",
    "workflow",
    "history",
    "plugins"
  ]
}
);

export function App() {
  return (
    <AiStudioProvider studio={studio}>
      <AiStudioWorkspace />
    </AiStudioProvider>
  );
}
```
