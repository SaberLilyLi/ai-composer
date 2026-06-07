import { describe, expect, it } from "vitest";
import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { WorkflowRuntime } from "./WorkflowRuntime";

describe("Runtime closure", () => {
  it("keeps workflow messages and step progress inside WorkflowRuntime state", async () => {
    const runtime = new WorkflowRuntime();
    runtime.providers.registerProvider("chat", new MockChatProvider());
    runtime.providers.registerProvider("image", new MockImageProvider());

    const result = await runtime.runPrompt("make the car blue", {
      attachments: ["data:image/png;base64,ZmFrZQ=="],
      messageAttachments: [
        {
          id: "attachment-1",
          type: "image",
          url: "data:image/png;base64,ZmFrZQ==",
          name: "reference.png",
          mimeType: "image/png"
        }
      ]
    });

    expect(result.steps[0]?.status).toBe("success");
    expect(runtime.getState().messages[0]).toMatchObject({
      role: "user",
      attachments: [
        expect.objectContaining({
          name: "reference.png"
        })
      ]
    });
    expect(runtime.getState().messages[1]).toMatchObject({
      role: "assistant",
      attachments: [
        expect.objectContaining({
          type: "image"
        })
      ]
    });
  });
});
