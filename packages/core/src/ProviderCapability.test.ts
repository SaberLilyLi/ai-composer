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
        supports: ["chat"],
        inputTypes: ["text"],
        outputTypes: ["text"],
        streaming: false,
        batch: false,
        configurable: false
      },
      {
        provider: "mock-image",
        supports: ["image_generate", "image_edit", "image_replace"],
        inputTypes: ["text", "image"],
        outputTypes: ["image"],
        streaming: false,
        batch: false,
        configurable: false,
        maxFiles: 16
      }
    ]);
  });
});
