import { describe, expect, it } from "vitest";
import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { WorkflowRuntime } from "./WorkflowRuntime";

describe("Runtime integration", () => {
  it("routes analyzed workflow steps through ProviderRegistry capabilities", async () => {
    const runtime = new WorkflowRuntime();
    runtime.providers.registerProvider("chat", new MockChatProvider());
    runtime.providers.registerProvider("image", new MockImageProvider());

    const result = await runtime.runPrompt("make the car blue\nchange background to rainy overpass\ncrop to 9:16");

    expect(runtime.providers.listCapabilities()).toEqual([
      expect.objectContaining({ provider: "mock-chat", supports: ["chat"], inputTypes: ["text"], outputTypes: ["text"] }),
      expect.objectContaining({
        provider: "mock-image",
        supports: ["image_generate", "image_edit", "image_replace"],
        inputTypes: ["text", "image"],
        outputTypes: ["image"]
      })
    ]);
    expect(result.steps).toHaveLength(3);
    expect(result.steps.every((step) => step.status === "success")).toBe(true);
    expect(result.steps.every((step) => step.provider === "mock-image")).toBe(true);
    expect(runtime.getState().status).toBe("success");
    expect(runtime.getState().messages).toHaveLength(2);
  });
});
