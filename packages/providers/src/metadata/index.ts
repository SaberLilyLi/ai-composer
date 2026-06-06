import type { ProviderMetadata } from "./types";

export type { ProviderMetadata } from "./types";

export const GPT_PROVIDER_METADATA: ProviderMetadata = {
  id: "gpt",
  name: "GPT",
  description: "OpenAI-compatible chat provider for text generation, prompt optimization, and workflow analysis.",
  category: "chat",
  status: "stable",
  tags: ["chat", "workflow", "openai-compatible"]
};

export const GPT_IMAGE_PROVIDER_METADATA: ProviderMetadata = {
  id: "gpt-image",
  name: "GPT Image",
  description: "OpenAI-compatible image provider for image generation and editing.",
  category: "image",
  status: "stable",
  tags: ["image", "generation", "edit", "openai-compatible"]
};

export const MOCK_CHAT_PROVIDER_METADATA: ProviderMetadata = {
  id: "mock-chat",
  name: "Mock Chat",
  description: "Local mock chat provider for tests and demos.",
  category: "chat",
  status: "stable",
  tags: ["mock", "test"]
};

export const MOCK_IMAGE_PROVIDER_METADATA: ProviderMetadata = {
  id: "mock-image",
  name: "Mock Image",
  description: "Local mock image provider for tests and demos.",
  category: "image",
  status: "stable",
  tags: ["mock", "test"]
};
