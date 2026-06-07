import { AiStudioProvider, AiStudioWorkspace, createAiStudio } from "@company/ai-composer";

const studio = createAiStudio({
  workspace: "agent",
  provider: "openai",
  chatModel: "gpt-5.5",
  imageModel: "gpt-image-2",
  features: ["upload", "workflow", "history", "streaming", "plugins"]
});

export function AgentExample() {
  return (
    <AiStudioProvider studio={studio}>
      <AiStudioWorkspace title="Agent Example" subtitle="Agent workspace with chat and image modes" />
    </AiStudioProvider>
  );
}
