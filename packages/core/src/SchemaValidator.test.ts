import { describe, expect, it } from "vitest";
import { SchemaValidator } from "./SchemaValidator";

describe("SchemaValidator", () => {
  it("normalizes workspace defaults", () => {
    const validator = new SchemaValidator();
    const schema = validator.normalize("workspace", {
      workspace: "image",
      features: ["upload", "workflow"]
    });

    expect(schema.workspace).toBe("image");
    expect(schema.provider).toBe("openai");
    expect(schema.chatModel).toBe("gpt-5.5");
    expect(schema.imageModel).toBe("gpt-image-2");
    expect(schema.features).toEqual(["upload", "workflow"]);
    expect(schema.providerConfig.baseUrl).toBe("https://api.openai.com/v1");
  });

  it("supports feature object normalization", () => {
    const validator = new SchemaValidator();
    const features = validator.normalize("feature", {
      upload: true,
      workflow: false,
      history: true
    });

    expect(features).toEqual({
      upload: true,
      workflow: false,
      history: true,
      streaming: true,
      plugins: false
    });
  });

  it("validates provider schema", () => {
    const validator = new SchemaValidator();
    const result = validator.validate("provider", {
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      chatModel: "gpt-5.5",
      imageModel: "gpt-image-2",
      timeout: 30000,
      maxRetries: 1
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
