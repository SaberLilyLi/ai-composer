import { describe, expect, it } from "vitest";
import type { ChatProvider, ChatStreamChunk } from "@company/ai-composer-providers";
import { ConversationRuntime } from "./ConversationRuntime";

async function* chunks(): AsyncIterable<ChatStreamChunk> {
  yield { content: "Hello", done: false };
  yield { content: " runtime", done: true };
}

describe("Streaming integration", () => {
  it("reflects streaming state in runtime messages", async () => {
    const provider: ChatProvider = {
      getCapability: () => ({
        provider: "stream-chat",
        supports: ["chat"],
        streaming: true
      }),
      async chat() {
        return { text: "fallback", model: "stream-chat" };
      },
      stream: () => chunks()
    };
    const runtime = new ConversationRuntime(provider);
    const snapshots: string[][] = [];

    runtime.onStreaming(() => {
      snapshots.push(runtime.getState().messages.map((message) => message.content));
    });

    await runtime.send("hello");

    expect(snapshots.some((messages) => messages.includes("Hello"))).toBe(true);
    expect(runtime.getState().messages.at(-1)?.content).toBe("Hello runtime");
  });
});
