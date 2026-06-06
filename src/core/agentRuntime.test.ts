import { afterEach, describe, expect, it, vi } from "vitest";
import { requestAgentChat, toAttachmentPreviews } from "./agentRuntime";
import type { ComposerAttachment } from "./types";

function createImageAttachment(id: string, name: string): ComposerAttachment {
  return {
    id,
    file: new File(["image"], name, { type: "image/png" }),
    name,
    size: 5,
    type: "image/png",
    status: "ready"
  };
}

describe("agentRuntime", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("includes uploaded images in chat mode requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "qwen3.7-plus",
        choices: [
          {
            message: {
              content: "done"
            }
          }
        ]
      })
    });

    const readerResult = "data:image/png;base64,ZmFrZQ==";
    class MockFileReader {
      result: string | ArrayBuffer | null = null;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;

      readAsDataURL() {
        this.result = readerResult;
        this.onload?.();
      }
    }

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("FileReader", MockFileReader as unknown as typeof FileReader);

    await requestAgentChat({
      config: {
        apiKey: "test-key",
        baseUrl: "https://example.com",
        chatModel: "qwen3.7-plus",
        imageModel: "wan2.7-image-pro"
      },
      history: [
        {
          id: "msg-1",
          role: "user",
          text: "Describe this image",
          attachments: toAttachmentPreviews([createImageAttachment("img-1", "reference.png")]).map((attachment) => ({
            ...attachment,
            previewUrl: readerResult
          }))
        }
      ]
    });

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload.messages[1].content[0]).toEqual({
      type: "text",
      text: "Describe this image"
    });
    expect(payload.messages[1].content[1]).toEqual({
      type: "image_url",
      image_url: {
        url: readerResult
      }
    });
  });

  it("does not duplicate the latest user chat message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "qwen3.7-plus",
        choices: [
          {
            message: {
              content: "done"
            }
          }
        ]
      })
    });

    vi.stubGlobal("fetch", fetchMock);

    await requestAgentChat({
      config: {
        apiKey: "test-key",
        baseUrl: "https://example.com",
        chatModel: "qwen3.7-plus",
        imageModel: "wan2.7-image-pro"
      },
      history: [
        {
          id: "msg-1",
          role: "user",
          text: "Only once"
        }
      ]
    });

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload.messages).toHaveLength(2);
    expect(payload.messages[1]).toEqual({
      role: "user",
      content: "Only once"
    });
  });
});
