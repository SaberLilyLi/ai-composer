import type { ComposerAttachment } from "./types";

export type AgentMode = "chat" | "image";
export type AgentRole = "assistant" | "user" | "system";
export type AgentImageResolution = "1K" | "2K" | "4K";
export type AgentImageSize = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export interface AgentMessage {
  id: string;
  role: AgentRole;
  text: string;
  attachments?: AgentAttachmentPreview[];
  generatedImages?: string[];
  model?: string;
}

export interface AgentAttachmentPreview {
  id: string;
  name: string;
  mimeType: string;
  previewUrl?: string;
}

export interface AgentRuntimeConfig {
  apiKey: string;
  baseUrl: string;
  chatEndpoint?: string;
  imageEndpoint?: string;
  chatModel: string;
  imageModel: string;
}

export interface AgentImageGenerationOptions {
  count?: number;
  resolution?: AgentImageResolution;
  size?: AgentImageSize;
}

interface ChatRequestOptions {
  config: AgentRuntimeConfig;
  history: AgentMessage[];
  signal?: AbortSignal;
}

interface ImageRequestOptions {
  config: AgentRuntimeConfig;
  prompt: string;
  attachments: ComposerAttachment[];
  options?: AgentImageGenerationOptions;
  signal?: AbortSignal;
}

interface WanContentImage {
  image: string;
}

interface WanContentText {
  text: string;
}

const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DEFAULT_IMAGE_ENDPOINT = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

export function getAgentRuntimeConfig(): AgentRuntimeConfig {
  const env = import.meta.env as Record<string, string | undefined>;

  return {
    apiKey: env.VITE_AGENT_API_KEY ?? "",
    baseUrl: env.VITE_AGENT_BASE_URL ?? DEFAULT_BASE_URL,
    chatEndpoint: env.VITE_AGENT_CHAT_ENDPOINT,
    imageEndpoint: env.VITE_AGENT_IMAGE_ENDPOINT,
    chatModel: env.VITE_AGENT_CHAT_MODEL ?? "qwen3.7-plus",
    imageModel: env.VITE_AGENT_IMAGE_MODEL ?? "wan2.7-image-pro"
  };
}

export function toAttachmentPreviews(attachments: ComposerAttachment[]): AgentAttachmentPreview[] {
  return attachments.map((attachment) => ({
    id: attachment.id,
    name: attachment.name,
    mimeType: attachment.type,
    previewUrl: attachment.previewUrl
  }));
}

export async function requestAgentChat({
  config,
  history,
  signal
}: ChatRequestOptions): Promise<{ text: string; model: string }> {
  const endpoint = config.chatEndpoint || `${config.baseUrl}/chat/completions`;
  const payload = {
    model: config.chatModel,
    temperature: 0.7,
    messages: await buildChatMessages(history)
  };

  const data = await postJson(endpoint, config.apiKey, payload, signal);
  const text = extractChatText(data);

  if (!text) {
    throw new Error("The chat model returned an empty response.");
  }

  return {
    text,
    model: data?.model || config.chatModel
  };
}

export async function requestAgentImage({
  config,
  prompt,
  attachments,
  options,
  signal
}: ImageRequestOptions): Promise<{ images: string[]; text: string; model: string }> {
  const endpoint = config.imageEndpoint || DEFAULT_IMAGE_ENDPOINT;
  const imageContents: WanContentImage[] = await Promise.all(
    attachments
      .filter((attachment) => attachment.type.startsWith("image/"))
      .slice(0, 9)
      .map(async (attachment) => ({
        image: await fileToDataUrl(attachment.file)
      }))
  );
  const content: Array<WanContentImage | WanContentText> = [...imageContents, { text: prompt }];
  const payload = {
    model: config.imageModel,
    input: {
      messages: [
        {
          role: "user",
          content
        }
      ]
    },
    parameters: {
      n: normalizeImageCount(options?.count),
      size: options?.resolution ?? (imageContents.length > 0 ? "2K" : "4K"),
      ...(options?.size ? { aspect_ratio: options.size } : {}),
      watermark: false
    }
  };

  const data = await postJson(endpoint, config.apiKey, payload, signal);
  const images = extractImageUrls(data);

  if (images.length === 0) {
    throw new Error("The image model did not return any images.");
  }

  return {
    images,
    text: "Image generation completed.",
    model: data?.model || config.imageModel
  };
}

function normalizeImageCount(count?: number): number {
  if (typeof count !== "number" || Number.isNaN(count)) {
    return 1;
  }

  return Math.max(1, Math.min(4, Math.floor(count)));
}

async function buildChatMessages(history: AgentMessage[]) {
  const historyMessages = history
    .filter((message) => message.role === "assistant" || message.role === "user")
    .flatMap(async (message) => {
      if (!message.text.trim() && (!message.attachments || message.attachments.length === 0)) {
        return [];
      }

      return [await buildChatMessage(message)];
    });

  return [
    {
      role: "system",
      content:
        "You are a practical AI collaborator. Keep responses helpful, grounded, and concise, and call out tradeoffs when they matter."
    },
    ...(await Promise.all(historyMessages)).flat()
  ];
}

async function buildChatMessage(message: AgentMessage) {
  const imageAttachments = (message.attachments ?? [])
    .filter((attachment) => attachment.mimeType.startsWith("image/") && typeof attachment.previewUrl === "string")
    .slice(0, 9);

  if (imageAttachments.length === 0) {
    return {
      role: message.role,
      content: message.text
    };
  }

  const images = imageAttachments.map((attachment) => ({
    type: "image_url" as const,
    image_url: {
      url: attachment.previewUrl as string
    }
  }));

  return {
    role: message.role,
    content: [
      {
        type: "text",
        text: message.text
      },
      ...images
    ]
  };
}

async function postJson(url: string, apiKey: string, body: unknown, signal?: AbortSignal) {
  if (!apiKey) {
    throw new Error("Missing API key. Add VITE_AGENT_API_KEY to your .env file.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body),
    signal
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data;
}

function extractChatText(data: any): string {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.type === "text" && typeof item.text === "string") {
          return item.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

function extractImageUrls(data: any): string[] {
  const output = data?.output?.choices;

  if (!Array.isArray(output)) {
    return [];
  }

  return output
    .flatMap((item) => {
      const content = item?.message?.content;

      if (!Array.isArray(content)) {
        return [];
      }

      return content
        .map((entry) => {
          if (typeof entry?.image === "string" && entry.image.length > 0) {
            return entry.image;
          }

          return "";
        })
        .filter((value): value is string => value.length > 0);
    })
    .filter((value, index, list) => list.indexOf(value) === index);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error(`Failed to read "${file.name}" as a data URL.`));
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read "${file.name}".`));
    };

    reader.readAsDataURL(file);
  });
}
