import { describe, expect, it } from "vitest";
import { ProviderConfigManager } from "./provider-config";

describe("ProviderConfigManager", () => {
  it("registers, updates, reads, and removes provider configs", () => {
    const manager = new ProviderConfigManager();

    manager.registerConfig({
      provider: "gpt",
      apiKey: "key",
      baseUrl: "https://example.com",
      model: "gpt-test",
      options: { timeout: 1000 }
    });

    expect(manager.getConfig("gpt")).toEqual({
      provider: "gpt",
      apiKey: "key",
      baseUrl: "https://example.com",
      model: "gpt-test",
      options: { timeout: 1000 }
    });

    manager.setConfig("gpt", { model: "gpt-next" });
    expect(manager.getConfig("gpt")?.model).toBe("gpt-next");
    expect(manager.removeConfig("gpt")).toBe(true);
    expect(manager.getConfig("gpt")).toBeUndefined();
  });
});
