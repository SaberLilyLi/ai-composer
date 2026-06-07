import { describe, expect, it } from "vitest";
import { createAiStudio } from "./createAiStudio";

describe("createAiStudio", () => {
  it("creates a complete enterprise workspace runtime", () => {
    const studio = createAiStudio({
      workspace: "image",
      provider: "openai",
      chatModel: "gpt-5.5",
      imageModel: "gpt-image-2",
      features: ["upload", "workflow", "history"]
    });

    expect(studio.schema.workspace).toBe("image");
    expect(studio.workspace.kind).toBe("image");
    expect(studio.workspace.providerRegistry.listProviders()).toContain("image");
  });

  it("generates documentation artifacts from schema", () => {
    const studio = createAiStudio({
      workspace: "chat",
      features: ["upload", "streaming"]
    });
    const docs = studio.documentation.generate(studio.schema);

    expect(docs.react).toContain("AiStudioProvider");
    expect(docs.schema).toContain("\"workspace\": \"chat\"");
    expect(docs.plugin).toContain("\"video_generate\"");
  });
});
