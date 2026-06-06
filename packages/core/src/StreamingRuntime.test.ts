import { describe, expect, it } from "vitest";
import type { ChatProvider, ChatStreamChunk } from "@company/ai-composer-providers";
import { ConversationRuntime } from "./ConversationRuntime";

async function* streamChunks(): AsyncIterable<ChatStreamChunk> {
  yield { content: "Hello", done: false };
  yield { content: " runtime", done: true };
}

describe("ConversationRuntime streaming", () => {
  it("uses provider stream when available", async () => {
    const streamingMessages: string[] = [];
    const provider: ChatProvider = {
      getCapability: () => ({
        provider: "stream-chat",
        supports: ["chat"],
        inputTypes: ["text"],
        outputTypes: ["text"],
        streaming: true
      }),
      async chat() {
        return { text: "fallback", model: "stream-chat" };
      },
      stream: () => streamChunks()
    };
    const runtime = new ConversationRuntime(provider);

    runtime.onStreaming(({ message }) => streamingMessages.push(message.content));

    const message = await runtime.send("hello");

    expect(message.content).toBe("Hello runtime");
    expect(streamingMessages).toContain("Hello");
    expect(streamingMessages).toContain("Hello runtime");
  });
});
