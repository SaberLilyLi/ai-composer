import { describe, expect, it } from "vitest";
import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { ProviderRegistry } from "./ProviderRegistry";

describe("Provider metadata", () => {
  it("lists provider metadata for registered providers", () => {
    const registry = new ProviderRegistry();

    registry.registerProvider("chat", new MockChatProvider());
    registry.registerProvider("image", new MockImageProvider());

    expect(registry.getProviderMetadata("chat")).toMatchObject({
      id: "mock-chat",
      category: "chat",
      status: "stable"
    });
    expect(registry.listProviderMetadata()).toEqual([
      expect.objectContaining({ id: "mock-chat" }),
      expect.objectContaining({ id: "mock-image" })
    ]);
  });
});
