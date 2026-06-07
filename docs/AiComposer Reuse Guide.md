# AiComposer Reuse Guide

## Positioning

For multi-project reuse, `AiComposer` is the primary public React module.

`AiComposer` is a reusable input surface. It is not responsible for chat history, model runtime orchestration, workflow timelines, or page-level workspace layout.

## Module boundary

`AiComposer` should be treated as two stable capability modules inside one public component:

1. `Base input module`
2. `Enhanced interaction module`

### Base input module

This module owns:

1. Text input
2. Auto-resize textarea
3. Enter to send
4. Shift+Enter for newline
5. Send and stop actions
6. Controlled and uncontrolled value handling
7. Disabled state, placeholder, and theme

Primary implementation:

1. `packages/react/src/components/AiComposer.tsx`
2. `packages/react/src/components/ComposerTextarea.tsx`
3. `packages/react/src/components/ComposerActions.tsx`
4. `packages/react/src/components/ComposerStatusSlot.tsx`

### Enhanced interaction module

This module owns:

1. Attachment upload
2. Attachment preview and removal
3. `@mention`
4. `/command`
5. `actionOptions`
6. Context overlay selection
7. Plugin-style interaction extension points

Primary implementation:

1. `packages/react/src/components/ComposerImageTray.tsx`
2. `packages/react/src/components/AttachmentList.tsx`
3. `packages/react/src/components/ComposerOverlayLayer.tsx`
4. `packages/react/src/plugins/UploadPlugin.ts`
5. `packages/react/src/plugins/MentionPlugin.ts`
6. `packages/react/src/plugins/CommandPlugin.ts`

## What stays outside AiComposer

The following capabilities should not be part of `AiComposer` itself:

1. Conversation message list
2. Session history
3. Chat or image mode switching
4. Model selection strategy
5. API calls and runtime execution
6. Local storage persistence
7. Workflow steps and timelines
8. Workspace header, shell, and page layout

Current higher-level examples live in:

1. `packages/react/src/components/AgentConversationWorkspace.tsx`
2. `packages/react/src/controllers/useAgentConversationController.ts`

Those files should be treated as workspace composition examples, not the primary reuse entry for other projects.

## Host application responsibilities

When another project consumes `AiComposer`, the host application should own:

1. `onSend` request handling
2. Conversation and message rendering
3. Attachment persistence strategy
4. Command and mention data sources
5. Analytics, auth, and permission checks
6. Runtime provider selection
7. Retry, caching, and error recovery policies

## Public integration contract

The most important props for external consumers are:

1. `value` and `onChange`
2. `onSend`
3. `uploadOptions`
4. `mentions`
5. `commands`
6. `actionOptions`
7. `onAttachmentsChange`
8. `onAttachmentError`
9. `onMentionSelect`
10. `onCommandSelect`

## Recommended usage

```tsx
import { AiComposer } from "@company/ai-composer";
import "@company/ai-composer/styles.css";

export function MyComposer() {
  return (
    <AiComposer
      placeholder="Ask or instruct..."
      commands={[
        { id: "rewrite", label: "Rewrite", value: "rewrite", description: "Rewrite the current draft" }
      ]}
      mentions={[
        { id: "planner", label: "Planner", value: "planner", description: "Break work into steps" }
      ]}
      actionOptions={[
        {
          id: "model",
          label: "Model",
          value: "gpt-5.5",
          options: [{ label: "gpt-5.5", value: "gpt-5.5" }]
        }
      ]}
      uploadOptions={{ accept: ["image/*"], maxFiles: 3 }}
      onSend={async (value, { attachments }) => {
        await sendToMyService({ value, attachments });
      }}
    />
  );
}
```

## Rule of thumb

If a feature changes with business domain, product workflow, or backend provider policy, it should stay outside `AiComposer`.

If a feature is part of the input experience itself, it belongs inside `AiComposer`.
