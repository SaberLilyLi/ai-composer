import { describe, expect, it } from "vitest";
import type { ChatProvider } from "@company/ai-composer-providers";
import { ConversationRuntime } from "./ConversationRuntime";

describe("ConversationRuntime", () => {
  it("sends messages through the chat provider and emits runtime events", async () => {
    const events: string[] = [];
    const provider: ChatProvider = {
      getCapability: () => ({ provider: "test-chat", supports: ["chat"] }),
      async chat(input) {
        return {
          text: `Echo: ${input.messages.at(-1)?.content ?? ""}`,
          model: "test-chat"
        };
      }
    };
    const runtime = new ConversationRuntime(provider);

    runtime.onStart(() => events.push("start"));
    runtime.onStreaming(() => events.push("streaming"));
    runtime.onMessage(() => events.push("message"));
    runtime.onComplete(() => events.push("complete"));

    const message = await runtime.send("hello runtime");

    expect(message.content).toBe("Echo: hello runtime");
    expect(runtime.getState().status).toBe("success");
    expect(runtime.getState().messages).toHaveLength(2);
    expect(events).toEqual(["start", "message", "streaming", "complete", "message"]);
  });
});
