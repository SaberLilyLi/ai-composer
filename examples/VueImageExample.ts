import { createAiStudio } from "@company/ai-studio-sdk/core";
import { AiStudioProvider, AiStudioWorkspace } from "@company/ai-studio-sdk/vue";

export const vueImageStudio = createAiStudio({
  workspace: "image",
  provider: "openai",
  features: ["upload", "workflow", "history"]
});

export const VueImageExample = {
  components: {
    AiStudioProvider,
    AiStudioWorkspace
  }
};
