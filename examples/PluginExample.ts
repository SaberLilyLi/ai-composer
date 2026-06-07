import { createAiStudio, type AiStudioPlugin } from "@company/ai-composer-core";

const videoPlugin: AiStudioPlugin = {
  manifest: {
    name: "video",
    version: "1.0.0",
    capabilities: ["video_generate"]
  }
};

export const studio = createAiStudio({
  workspace: "agent",
  provider: "openai",
  features: ["plugins", "workflow"],
  plugins: [videoPlugin]
});
