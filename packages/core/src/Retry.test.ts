import { describe, expect, it } from "vitest";
import type { ImageProvider, ProviderCapability } from "@company/ai-composer-providers";
import { MockChatProvider } from "@company/ai-composer-providers";
import { WorkflowRuntime } from "./WorkflowRuntime";

class FlakyImageProvider implements ImageProvider {
  private attempts = 0;

  getCapability(): ProviderCapability {
    return {
      provider: "flaky-image",
      supports: ["image_generate", "image_edit", "image_replace"]
    };
  }

  async generateImage() {
    return this.editImage();
  }

  async editImage() {
    this.attempts += 1;

    if (this.attempts === 1) {
      throw new Error("temporary image failure");
    }

    return {
      images: ["mock://retried-image"],
      model: "flaky-image"
    };
  }
}

describe("WorkflowRuntime retry", () => {
  it("retries a failed workflow step", async () => {
    const runtime = new WorkflowRuntime();
    runtime.providers.registerProvider("chat", new MockChatProvider());
    runtime.providers.registerProvider("image", new FlakyImageProvider());

    const firstRun = await runtime.runPrompt("make the car blue");

    expect(firstRun.steps[0]?.status).toBe("error");
    expect(runtime.getState().status).toBe("error");

    const retriedStep = await runtime.retryStep("step-1");

    expect(retriedStep.status).toBe("success");
    expect(retriedStep.output).toMatchObject({ model: "flaky-image" });
    expect(runtime.getState().status).toBe("success");
  });

  it("retries the previous workflow input", async () => {
    const runtime = new WorkflowRuntime();
    runtime.providers.registerProvider("chat", new MockChatProvider());
    runtime.providers.registerProvider("image", new FlakyImageProvider());

    await runtime.runPrompt("make the car blue");
    const secondRun = await runtime.retryWorkflow();

    expect(secondRun.steps[0]?.status).toBe("success");
  });
});
