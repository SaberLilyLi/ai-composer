import type { ProviderConfig, ResolvedProviderConfig } from "../config";
import { resolveProviderConfig } from "../config";
import { ProviderError } from "../errors";
import { providerRequest } from "../http";
import { GPT_IMAGE_PROVIDER_METADATA } from "../metadata";
import type { ImageProvider, ProviderCapability, ProviderMetadata } from "../types";

interface ImageResponse {
  model?: string;
  data?: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

function extractImages(data: ImageResponse): string[] {
  return (data.data ?? [])
    .map((item) => item.url ?? (item.b64_json ? `data:image/png;base64,${item.b64_json}` : ""))
    .filter((value): value is string => value.length > 0);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [metadata, base64] = dataUrl.split(",");
  const mimeMatch = metadata.match(/^data:([^;]+);base64$/);
  const mimeType = mimeMatch?.[1] ?? "image/png";
  const binary = atob(base64 ?? "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function appendImage(formData: FormData, image: string, index: number): void {
  if (image.startsWith("data:")) {
    formData.append("image", dataUrlToBlob(image), `image-${index}.png`);
    return;
  }

  formData.append("image_url", image);
}

export class GPTImageProvider implements ImageProvider {
  private readonly config: ResolvedProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = resolveProviderConfig(config);
  }

  getCapability(): ProviderCapability {
    return {
      provider: this.config.model,
      supports: ["image_generate", "image_edit", "image_replace"],
      inputTypes: ["text", "image"],
      outputTypes: ["image"],
      streaming: false,
      batch: false,
      configurable: true,
      maxFiles: 16,
      metadata: {
        provider: this.config.provider
      }
    };
  }

  getMetadata(): ProviderMetadata {
    return {
      ...GPT_IMAGE_PROVIDER_METADATA,
      id: this.config.model,
      name: this.config.model
    };
  }

  async generateImage(input: {
    prompt: string;
    attachments?: string[];
    signal?: AbortSignal;
  }): Promise<{ images: string[]; model: string }> {
    const data = await providerRequest<ImageResponse>(this.config, {
      path: "/images/generations",
      signal: input.signal,
      body: {
        model: this.config.model,
        prompt: input.prompt,
        n: 1
      }
    });
    const images = extractImages(data);

    if (images.length === 0) {
      throw new ProviderError("ModelError", "GPTImageProvider returned no generated images.");
    }

    return {
      images,
      model: data.model ?? this.config.model
    };
  }

  async editImage(input: {
    prompt: string;
    attachments: string[];
    signal?: AbortSignal;
  }): Promise<{ images: string[]; model: string }> {
    if (input.attachments.length === 0) {
      return this.generateImage({
        prompt: input.prompt,
        signal: input.signal
      });
    }

    const formData = new FormData();
    formData.append("model", this.config.model);
    formData.append("prompt", input.prompt);
    input.attachments.forEach((image, index) => appendImage(formData, image, index));

    const data = await providerRequest<ImageResponse>(this.config, {
      path: "/images/edits",
      formData,
      signal: input.signal
    });
    const images = extractImages(data);

    if (images.length === 0) {
      throw new ProviderError("ModelError", "GPTImageProvider returned no edited images.");
    }

    return {
      images,
      model: data.model ?? this.config.model
    };
  }
}
