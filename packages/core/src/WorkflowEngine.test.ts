import { describe, expect, it } from "vitest";
import { MockChatProvider } from "@company/ai-composer-providers";
import { WorkflowEngine } from "./WorkflowEngine";

describe("WorkflowEngine", () => {
  it("runs a chat workflow with a provider", async () => {
    const engine = new WorkflowEngine({
      chat: new MockChatProvider()
    });

    const result = await engine.execute([
      {
        id: "step-1",
        type: "chat",
        title: "Step 1",
        prompt: "hello",
        status: "waiting"
      }
    ]);

    expect(result.steps[0]?.status).toBe("success");
    expect(result.finalOutput).toMatchObject({ model: "mock-chat" });
  });
});
