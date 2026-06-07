# SDK Integration Guide

## Positioning

The recommended enterprise integration model is:

1. use `createAiStudio()` for schema-driven studio creation
2. use `AiStudioProvider` to inject the studio
3. compose `AiComposer`, `ConversationView`, and `WorkflowTimeline`
4. keep business-specific workspace layout inside the host application

`ChatWorkspace`, `ImageWorkspace`, and `AgentWorkspace` remain available as Reference Implementation contracts, not as the primary business UI recommendation.

## React Integration

Install and import:

```tsx
import {
  AiComposer,
  AiStudioProvider,
  ConversationView,
  WorkflowTimeline,
  useAiStudio
} from "@company/ai-studio-sdk/react";
import { createAiStudio } from "@company/ai-studio-sdk";
```

Recommended composition:

```tsx
import { useState } from "react";
import type { Message, WorkflowStep } from "@company/ai-composer-core";
import {
  AiComposer,
  AiStudioProvider,
  ConversationView,
  WorkflowTimeline
} from "@company/ai-studio-sdk/react";
import { createAiStudio } from "@company/ai-studio-sdk";

const studio = createAiStudio({
  provider: "openai",
  workspace: "image",
  features: ["workflow", "upload"]
});

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  return (
    <AiStudioProvider studio={studio}>
      <ConversationView messages={messages} />
      <WorkflowTimeline steps={steps} />
      <AiComposer
        onSend={async (value) => {
          void value;
          void setMessages;
          void setSteps;
        }}
      />
    </AiStudioProvider>
  );
}
```

## Vue Integration

Install and import:

```ts
import {
  AiComposer,
  AiStudioProvider,
  ConversationView,
  WorkflowTimeline,
  useAiStudio
} from "@company/ai-studio-sdk/vue";
import { createAiStudio } from "@company/ai-studio-sdk";
```

Recommended composition:

```ts
import { defineComponent, h, ref } from "vue";
import {
  AiComposer,
  AiStudioProvider,
  ConversationView,
  WorkflowTimeline
} from "@company/ai-studio-sdk/vue";
import { createAiStudio } from "@company/ai-studio-sdk";

const studio = createAiStudio({
  provider: "openai",
  workspace: "chat",
  features: ["history"]
});

export default defineComponent({
  setup() {
    const messages = ref([]);
    const steps = ref([]);

    return () =>
      h(AiStudioProvider, { studio }, () => [
        h(ConversationView, { messages: messages.value }),
        h(WorkflowTimeline, { steps: steps.value }),
        h(AiComposer, {
          onSend: (value: string) => {
            void value;
          }
        })
      ]);
  }
});
```

## `createAiStudio`

Purpose:

1. normalize enterprise schema
2. centralize provider configuration
3. create workspace-level runtime composition

Recommended usage:

```ts
import { createAiStudio } from "@company/ai-studio-sdk";

const studio = createAiStudio({
  provider: "openai",
  chatModel: "gpt-5.5",
  imageModel: "gpt-image-2",
  workspace: "image",
  features: ["workflow", "upload"]
});
```

## `AiStudioProvider`

Purpose:

1. inject the `AiStudio` instance into React or Vue UI
2. keep configuration ownership outside leaf components

Recommended usage:

- initialize `AiStudio` once at application or page-shell level
- pass `studio` explicitly when possible

## `AiComposer`

Purpose:

1. reusable input surface
2. upload entry
3. command and mention interaction
4. send and stop action entry

Recommended usage:

- treat `AiComposer` as the primary reusable business integration point
- keep message history and request orchestration in host code

## `ConversationView`

Purpose:

1. render chat history
2. render structured message attachments
3. provide a reusable conversation presentation surface

Recommended usage:

- host projects own message state
- component only renders supplied messages

## `WorkflowTimeline`

Purpose:

1. render workflow step progression
2. expose image or agent workflow status without forcing a full workspace shell

Recommended usage:

- host projects own workflow state
- pair with `AiComposer` and `ConversationView` instead of binding to a built-in workspace

## Reference Implementation Note

If a project needs a prebuilt workspace quickly, workspace outputs from `WorkspaceFactory` remain available as Reference Implementation contracts.

For business systems, the recommended path is still:

1. `AiComposer`
2. `ConversationView`
3. `WorkflowTimeline`
4. host-defined workspace layout and orchestration
