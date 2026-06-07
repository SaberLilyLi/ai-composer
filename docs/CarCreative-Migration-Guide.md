# Car Creative Migration Guide

## Goal

Use the AI Studio SDK to validate the used-car creative image module while keeping the existing business project stable.

The migration should keep:

1. existing UI shell
2. existing business layout
3. existing request endpoints
4. existing auth and tracking
5. existing image result business rules

Only replace:

1. `AiComposer`
2. `ConversationView`
3. `ConversationRuntime`

## Recommended Migration Shape

Keep the existing page component, route, and data model.

Replace the current input area with:

```tsx
import { AiComposer } from "@company/ai-studio-sdk/react";
```

Replace the current message list with:

```tsx
import { ConversationView } from "@company/ai-studio-sdk/react";
```

Replace the current conversation orchestration with:

```ts
import { ConversationRuntime } from "@company/ai-studio-sdk/core";
```

If the existing project already has image generation endpoints, keep them. The SDK does not require replacing business APIs.

## Input Area

Before:

```tsx
<ExistingInput onSubmit={handleSubmit} />
```

After:

```tsx
<AiComposer
  placeholder="Describe the used-car creative image..."
  onSend={handleSubmit}
/>
```

The host project still owns:

1. validation
2. loading state
3. submit permission
4. business parameters
5. API payload mapping

## Message Area

Before:

```tsx
<ExistingMessageList messages={messages} />
```

After:

```tsx
<ConversationView messages={messages} />
```

The host project should map existing business messages into the SDK `Message` shape.

Image results should be attached as message attachments:

```ts
{
  id: imageId,
  type: "image",
  url: imageUrl,
  name: "car-creative-image.png",
  mimeType: "image/png"
}
```

## Runtime

If the business project keeps its current API:

1. use `AiComposer` only for input
2. use `ConversationView` only for display
3. keep current API calls unchanged

If the business project wants SDK runtime validation:

```ts
import {
  ConversationRuntime,
  GPTProvider
} from "@company/ai-studio-sdk/core";

const runtime = new ConversationRuntime(
  new GPTProvider({
    provider: "openai",
    apiKey,
    baseUrl,
    model: chatModel
  })
);
```

Use runtime output to create or refine the image prompt, then pass the prompt to the existing image API or `GPTImageProvider`.

## Image Generation

For validation with SDK provider:

```ts
import { GPTImageProvider } from "@company/ai-studio-sdk/core";

const imageProvider = new GPTImageProvider({
  provider: "openai",
  apiKey,
  baseUrl,
  model: imageModel
});

const result = await imageProvider.generateImage({ prompt });
```

For follow-up edits:

```ts
await imageProvider.editImage({
  prompt,
  attachments: [previousImageUrl]
});
```

## Migration Steps

1. Install the SDK package into the used-car project.
2. Add `AiComposer` to the existing creative image page.
3. Map current chat history into `ConversationView`.
4. Keep the existing image result area and download behavior.
5. Connect `AiComposer.onSend` to the existing submit handler.
6. Optionally introduce `ConversationRuntime` to generate or refine image prompts.
7. Optionally introduce `GPTImageProvider` for SDK-level image generation validation.
8. Compare generated image result flow against the existing module.

## Acceptance Criteria

1. one sentence can generate a creative image
2. follow-up requests can modify the previous image
3. message history remains visible
4. generated images can be previewed
5. generated images can be downloaded
6. existing UI shell does not need to be rewritten
7. existing business API can remain unchanged

## Risk Points

1. the target project must install compatible framework peer dependencies
2. business message schema may need mapping into SDK `Message`
3. image provider endpoint compatibility depends on the target service API
4. style tokens may need alignment with the existing used-car project UI
5. Vue or non-React hosts should use their matching SDK entry or a host adapter
