import { describe, expect, it } from "vitest";
import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { ProviderRegistry } from "./ProviderRegistry";

describe("ProviderCapability 2.0", () => {
  it("normalizes capability fields without breaking existing providers", () => {
    const registry = new ProviderRegistry();

    registry.registerProvider("chat", new MockChatProvider());
    registry.registerProvider("image", new MockImageProvider());

    expect(registry.listCapabilities()).toEqual([
      {
        provider: "mock-chat",
        providerName: "mock-chat",
        model: "mock-chat",
        supports: ["chat"],
        supportedSteps: ["chat"],
        inputTypes: ["text"],
        outputTypes: ["text"],
        attachments: true,
        streaming: false,
        batch: false,
        configurable: false,
        maxImages: undefined
      },
      {
        provider: "mock-image",
        providerName: "mock-image",
        model: "mock-image",
        supports: ["image_generate", "image_edit", "image_replace"],
        supportedSteps: ["image_generate", "image_edit", "image_replace"],
        inputTypes: ["text", "image"],
        outputTypes: ["image"],
        attachments: true,
        streaming: false,
        batch: false,
        configurable: false,
        maxFiles: 16,
        maxImages: 4
      }
    ]);
  });
});
