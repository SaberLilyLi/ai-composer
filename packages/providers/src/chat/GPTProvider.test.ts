import { afterEach, describe, expect, it, vi } from "vitest";
import { ProviderError } from "../errors";
import { GPTProvider } from "./GPTProvider";

const createProvider = (maxRetries = 0) =>
  new GPTProvider({
    apiKey: "test-key",
    baseUrl: "https://api.test/v1",
    model: "gpt-5.5",
    timeout: 25,
    maxRetries
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("GPTProvider", () => {
  it("calls chat completions and extracts text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          model: "gpt-5.5",
          choices: [{ message: { content: "Hello" } }]
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createProvider().chat({
      messages: [{ id: "message-1", role: "user", content: "Hi", createdAt: 1 }]
    });

    expect(result).toEqual({ text: "Hello", model: "gpt-5.5" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" })
      })
    );
  });

  it("optimizes prompts through chat", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "Keep the car unchanged and change paint to deep ocean blue." } }]
          }),
          { status: 200 }
        )
      )
    );

    const result = await createProvider().optimizePrompt({ prompt: "Change it blue" });

    expect(result.prompt).toContain("deep ocean blue");
  });

  it("analyzes workflow JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    steps: [
                      { type: "image_edit", prompt: "Change the BMW to blue" },
                      { type: "image_edit", prompt: "Change background to rainy overpass" }
                    ]
                  })
                }
              }
            ]
          }),
          { status: 200 }
        )
      )
    );

    const result = await createProvider().analyzeWorkflow({ prompt: "Change BMW blue, then rainy overpass" });

    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]?.type).toBe("image_edit");
  });

  it("maps auth errors to ProviderError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Invalid API key" } }), { status: 401 })
      )
    );

    await expect(
      createProvider().chat({
        messages: [{ id: "message-1", role: "user", content: "Hi", createdAt: 1 }]
      })
    ).rejects.toMatchObject({ code: "AuthError" });
  });

  it("retries retryable network failures", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValue(
        new Response(JSON.stringify({ choices: [{ message: { content: "Recovered" } }] }), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createProvider(1).chat({
      messages: [{ id: "message-1", role: "user", content: "Hi", createdAt: 1 }]
    });

    expect(result.text).toBe("Recovered");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("raises timeout errors", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        });
      })
    );

    const promise = createProvider().chat({
      messages: [{ id: "message-1", role: "user", content: "Hi", createdAt: 1 }]
    });
    const errorPromise = promise.catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(30);
    const error = await errorPromise;

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toMatchObject({ code: "TimeoutError" });
  });

  it.skipIf(process.env.PHASE03_REAL_PROVIDER_TESTS !== "true" || !process.env.OPENAI_API_KEY)(
    "can call a real compatible chat endpoint when explicitly enabled",
    async () => {
      const provider = new GPTProvider({
        apiKey: process.env.OPENAI_API_KEY as string,
        baseUrl: process.env.OPENAI_BASE_URL,
        model: process.env.OPENAI_CHAT_MODEL ?? "gpt-5.5",
        timeout: 60000,
        maxRetries: 1
      });

      const result = await provider.chat({
        messages: [{ id: "message-1", role: "user", content: "Reply with ok.", createdAt: Date.now() }]
      });

      expect(result.text.length).toBeGreaterThan(0);
    }
  );
});
