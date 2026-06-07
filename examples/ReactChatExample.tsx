import { AiStudioProvider, AiStudioWorkspace } from "@company/ai-studio-sdk/react";
import { createAiStudio } from "@company/ai-studio-sdk/core";

const studio = createAiStudio({
  workspace: "chat",
  provider: "openai",
  features: ["upload", "streaming"]
});

export function ReactChatExample() {
  return (
    <AiStudioProvider studio={studio}>
      <AiStudioWorkspace title="React Chat Example" />
    </AiStudioProvider>
  );
}
