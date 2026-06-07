import { SchemaValidator } from "@company/ai-composer-core";

const validator = new SchemaValidator();

export const schema = validator.normalize("workspace", {
  workspace: "image",
  provider: "openai",
  chatModel: "gpt-5.5",
  imageModel: "gpt-image-2",
  features: ["upload", "workflow", "history"]
});

export const validation = validator.validate("workspace", schema);
