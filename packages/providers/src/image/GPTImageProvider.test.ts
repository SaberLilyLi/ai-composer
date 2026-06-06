import { afterEach, describe, expect, it, vi } from "vitest";
import { GPTImageProvider } from "./GPTImageProvider";

const createProvider = (maxRetries = 0) =>
  new GPTImageProvider({
    apiKey: "test-key",
    baseUrl: "https://api.test/v1",
    model: "gpt-image-2",
    timeout: 25,
    maxRetries
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("GPTImageProvider", () => {
  it("generates images", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [{ url: "https://cdn.test/image.png" }], model: "gpt-image-2" }), {
          status: 200
        })
      )
    );

    const result = await createProvider().generateImage({ prompt: "A blue BMW" });

    expect(result.images).toEqual(["https://cdn.test/image.png"]);
  });

  it("edits images with multipart form data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [{ b64_json: "aGVsbG8=" }], model: "gpt-image-2" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createProvider().editImage({
      prompt: "Change paint to blue",
      attachments: ["data:image/png;base64,aGVsbG8="]
    });

    expect(result.images[0]).toBe("data:image/png;base64,aGVsbG8=");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/v1/images/edits",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData)
      })
    );
  });

  it("falls back to image generation when editing without attachments", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [{ url: "https://cdn.test/generated.png" }] }), { status: 200 })
      )
    );

    const result = await createProvider().editImage({
      prompt: "Create a blue BMW",
      attachments: []
    });

    expect(result.images).toEqual(["https://cdn.test/generated.png"]);
  });

  it("maps rate limit errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Too many requests" } }), { status: 429 })
      )
    );

    await expect(createProvider().generateImage({ prompt: "A car" })).rejects.toMatchObject({
      code: "RateLimitError"
    });
  });

  it("retries retryable failures", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValue(new Response(JSON.stringify({ data: [{ url: "https://cdn.test/retry.png" }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createProvider(1).generateImage({ prompt: "A car" });

    expect(result.images).toEqual(["https://cdn.test/retry.png"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.skipIf(process.env.PHASE03_REAL_PROVIDER_TESTS !== "true" || !process.env.OPENAI_API_KEY)(
    "can call a real compatible image endpoint when explicitly enabled",
    async () => {
      const provider = new GPTImageProvider({
        apiKey: process.env.OPENAI_API_KEY as string,
        baseUrl: process.env.OPENAI_BASE_URL,
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2",
        timeout: 120000,
        maxRetries: 1
      });

      const result = await provider.generateImage({ prompt: "A simple blue square icon." });

      expect(result.images.length).toBeGreaterThan(0);
    }
  );
});
