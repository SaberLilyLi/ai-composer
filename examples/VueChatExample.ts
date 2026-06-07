import { createAiStudio } from "@company/ai-studio-sdk/core";
import { AiStudioProvider, AiStudioWorkspace } from "@company/ai-studio-sdk/vue";

export const vueChatStudio = createAiStudio({
  workspace: "chat",
  provider: "openai",
  features: ["upload", "streaming"]
});

export const VueChatExample = {
  components: {
    AiStudioProvider,
    AiStudioWorkspace
  }
};
