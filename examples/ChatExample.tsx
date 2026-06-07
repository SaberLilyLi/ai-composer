import { AiStudioProvider, AiStudioWorkspace, createAiStudio } from "@company/ai-composer";

const studio = createAiStudio({
  workspace: "chat",
  provider: "openai",
  chatModel: "gpt-5.5",
  imageModel: "gpt-image-2",
  features: ["upload", "streaming", "history"]
});

export function ChatExample() {
  return (
    <AiStudioProvider studio={studio}>
      <AiStudioWorkspace title="Chat Example" subtitle="Chat-only enterprise workspace" />
    </AiStudioProvider>
  );
}
