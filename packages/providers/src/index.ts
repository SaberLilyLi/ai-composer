import type { Message } from "@company/ai-composer-shared";
import { GPTProvider } from "./chat/GPTProvider";
import { GPTImageProvider } from "./image/GPTImageProvider";
import {
  MOCK_CHAT_PROVIDER_METADATA,
  MOCK_IMAGE_PROVIDER_METADATA
} from "./metadata";
import type { ChatProvider, ImageProvider, ProviderCapability, ProviderMetadata } from "./types";

export { GPTProvider } from "./chat/GPTProvider";
export { GPTImageProvider } from "./image/GPTImageProvider";
export { ProviderError, isProviderError, mapHttpStatusToProviderError } from "./errors";
export { resolveProviderConfig } from "./config";
export {
  GPT_IMAGE_PROVIDER_METADATA,
  GPT_PROVIDER_METADATA,
  MOCK_CHAT_PROVIDER_METADATA,
  MOCK_IMAGE_PROVIDER_METADATA
} from "./metadata";
export type { ProviderConfig, ResolvedProviderConfig } from "./config";
export type {
  AgentProvider,
  AvatarProvider,
  ChatProvider,
  ImageProvider,
  PromptOptimizerProvider,
  ProviderCapability,
  ProviderMetadata,
  VideoProvider,
  WorkflowAnalyzerProvider
} from "./types";

export class MockChatProvider implements ChatProvider {
  getCapability(): ProviderCapability {
    return {
      provider: "mock-chat",
      supports: ["chat"],
      inputTypes: ["text"],
      outputTypes: ["text"],
      streaming: false,
      configurable: false
    };
  }

  getMetadata(): ProviderMetadata {
    return MOCK_CHAT_PROVIDER_METADATA;
  }

  async chat(input: { messages: Message[] }) {
    const lastMessage = [...input.messages].reverse().find((message) => message.role === "user");

    return {
      text: lastMessage ? `Mock response: ${lastMessage.content}` : "Mock response ready.",
      model: "mock-chat"
    };
  }

  async optimizePrompt(input: { prompt: string }) {
    return {
      prompt: `Optimized: ${input.prompt}`,
      model: "mock-chat"
    };
  }

  async analyzeWorkflow(input: { prompt: string }) {
    return {
      steps: input.prompt
        .split(/\r?\n/)
        .map((prompt) => prompt.trim())
        .filter(Boolean)
        .map((prompt) => ({ type: "image_edit" as const, prompt })),
      model: "mock-chat"
    };
  }
}

export class MockImageProvider implements ImageProvider {
  getCapability(): ProviderCapability {
    return {
      provider: "mock-image",
      supports: ["image_generate", "image_edit", "image_replace"],
      inputTypes: ["text", "image"],
      outputTypes: ["image"],
      streaming: false,
      configurable: false,
      maxFiles: 16
    };
  }

  getMetadata(): ProviderMetadata {
    return MOCK_IMAGE_PROVIDER_METADATA;
  }

  async generateImage(input: { prompt: string }) {
    return {
      images: [`mock://image?prompt=${encodeURIComponent(input.prompt)}`],
      model: "mock-image"
    };
  }

  async editImage(input: { prompt: string }) {
    return {
      images: [`mock://edited-image?prompt=${encodeURIComponent(input.prompt)}`],
      model: "mock-image"
    };
  }
}

export function createGPTProvider(config: ConstructorParameters<typeof GPTProvider>[0]): GPTProvider {
  return new GPTProvider(config);
}

export function createGPTImageProvider(config: ConstructorParameters<typeof GPTImageProvider>[0]): GPTImageProvider {
  return new GPTImageProvider(config);
}
