# Vue SDK

```ts
import { createAiStudio } from "@company/ai-studio-sdk/core";
import { AiStudioProvider, AiStudioWorkspace } from "@company/ai-studio-sdk/vue";

const studio = createAiStudio({"workspace":"agent","provider":"openai","chatModel":"gpt-5.5","imageModel":"gpt-image-2","features":["upload","workflow","history","plugins"]});
```
