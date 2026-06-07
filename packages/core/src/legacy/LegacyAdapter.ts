import type {
  ChatProvider,
  ImageProvider,
  ProviderCapability
} from "@company/ai-composer-providers";
import type { Attachment, Message } from "@company/ai-composer-shared";
import {
  requestAgentChat,
  requestAgentImage,
  type AgentImageGenerationOptions,
  type AgentRuntimeConfig
} from "../agentRuntime";

export interface LegacyAdapterConfig extends AgentRuntimeConfig {
  timeout?: number;
  maxRetries?: number;
}

export interface LegacyImageRequestOptions extends AgentImageGenerationOptions {
  signal?: AbortSignal;
}

export class LegacyChatProvider implements ChatProvider {
  constructor(private readonly config: LegacyAdapterConfig) {}

  getCapability(): ProviderCapability {
    return {
      provider: this.config.chatModel,
      providerName: "legacy-agent-chat",
      model: this.config.chatModel,
      supports: ["chat"],
      supportedSteps: ["chat"],
      inputTypes: ["text", "image"],
      outputTypes: ["text"],
      attachments: true,
      streaming: false,
      configurable: true
    };
  }

  async chat(input: { messages: Message[]; signal?: AbortSignal }): Promise<{ text: string; model: string }> {
    return requestAgentChat({
      config: this.config,
      history: input.messages.map(toAgentMessage),
      signal: input.signal
    });
  }
}

export class LegacyImageProvider implements ImageProvider {
  constructor(private readonly config: LegacyAdapterConfig) {}

  getCapability(): ProviderCapability {
    return {
      provider: this.config.imageModel,
      providerName: "legacy-agent-image",
      model: this.config.imageModel,
      supports: ["image_generate", "image_edit", "image_replace"],
      supportedSteps: ["image_generate", "image_edit", "image_replace"],
      inputTypes: ["text", "image"],
      outputTypes: ["image"],
      attachments: true,
      streaming: false,
      configurable: true,
      maxFiles: 9,
      maxImages: 4
    };
  }

  async generateImage(input: {
    prompt: string;
    attachments?: string[];
    signal?: AbortSignal;
  }): Promise<{ images: string[]; model: string }> {
    const result = await requestAgentImage({
      config: this.config,
      prompt: input.prompt,
      attachments: input.attachments ?? [],
      signal: input.signal
    });

    return {
      images: result.images,
      model: result.model
    };
  }

  async editImage(input: {
    prompt: string;
    attachments: string[];
    signal?: AbortSignal;
  }): Promise<{ images: string[]; model: string }> {
    return this.generateImage(input);
  }

  async generateWithOptions(
    input: {
      prompt: string;
      attachments?: string[];
    } & LegacyImageRequestOptions
  ): Promise<{ images: string[]; model: string }> {
    const result = await requestAgentImage({
      config: this.config,
      prompt: input.prompt,
      attachments: input.attachments ?? [],
      options: {
        count: input.count,
        resolution: input.resolution,
        size: input.size
      },
      signal: input.signal
    });

    return {
      images: result.images,
      model: result.model
    };
  }
}

function toAgentMessage(message: Message) {
  return {
    id: message.id,
    role: message.role,
    text: message.content,
    attachments: (message.attachments ?? [])
      .filter((attachment) => attachment.mimeType || attachment.url)
      .map((attachment) => ({
        id: attachment.id,
        name: attachment.name ?? "Attachment",
        mimeType: attachment.mimeType ?? inferMimeType(attachment),
        previewUrl: attachment.url
      }))
  } as const;
}

function inferMimeType(attachment: Attachment): string {
  if (attachment.type === "image") {
    return "image/png";
  }

  return "application/octet-stream";
}
