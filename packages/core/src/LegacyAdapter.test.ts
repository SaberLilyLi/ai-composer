import { afterEach, describe, expect, it, vi } from "vitest";
import { LegacyChatProvider, LegacyImageProvider } from "./legacy/LegacyAdapter";

describe("LegacyAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes chat requests through the legacy chat helper contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "qwen3.7-plus",
        choices: [{ message: { content: "legacy chat reply" } }]
      })
    });

    vi.stubGlobal("fetch", fetchMock);

    const provider = new LegacyChatProvider({
      apiKey: "test-key",
      baseUrl: "https://example.com",
      chatModel: "qwen3.7-plus",
      imageModel: "wan2.7-image-pro"
    });
    const result = await provider.chat({
      messages: [{ id: "m1", role: "user", content: "hello", createdAt: Date.now() }]
    });

    expect(result).toEqual({ text: "legacy chat reply", model: "qwen3.7-plus" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("routes image requests through the legacy image helper contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "wan2.7-image-pro",
        output: {
          choices: [
            {
              message: {
                content: [{ image: "mock://legacy-image" }]
              }
            }
          ]
        }
      })
    });

    vi.stubGlobal("fetch", fetchMock);

    const provider = new LegacyImageProvider({
      apiKey: "test-key",
      baseUrl: "https://example.com",
      imageEndpoint: "https://example.com/image",
      chatModel: "qwen3.7-plus",
      imageModel: "wan2.7-image-pro"
    });
    const result = await provider.generateWithOptions({
      prompt: "make the car black",
      attachments: ["data:image/png;base64,ZmFrZQ=="],
      count: 2,
      resolution: "2K",
      size: "16:9"
    });

    expect(result).toEqual({ images: ["mock://legacy-image"], model: "wan2.7-image-pro" });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload.parameters.n).toBe(2);
    expect(payload.parameters.size).toBe("2K");
    expect(payload.parameters.aspect_ratio).toBe("16:9");
  });
});
