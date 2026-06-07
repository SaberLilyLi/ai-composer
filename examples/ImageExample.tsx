import { AiStudioProvider, AiStudioWorkspace, createAiStudio } from "@company/ai-composer";

const studio = createAiStudio({
  workspace: "image",
  provider: "openai",
  chatModel: "gpt-5.5",
  imageModel: "gpt-image-2",
  features: ["upload", "workflow", "history"]
});

export function ImageExample() {
  return (
    <AiStudioProvider studio={studio}>
      <AiStudioWorkspace title="Image Example" subtitle="Image workflow enterprise workspace" />
    </AiStudioProvider>
  );
}
