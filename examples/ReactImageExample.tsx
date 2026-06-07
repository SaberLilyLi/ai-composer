import { AiStudioProvider, AiStudioWorkspace } from "@company/ai-studio-sdk/react";
import { createAiStudio } from "@company/ai-studio-sdk/core";

const studio = createAiStudio({
  workspace: "image",
  provider: "openai",
  features: ["upload", "workflow", "history"]
});

export function ReactImageExample() {
  return (
    <AiStudioProvider studio={studio}>
      <AiStudioWorkspace title="React Image Example" />
    </AiStudioProvider>
  );
}
