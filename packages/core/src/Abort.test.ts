import { describe, expect, it } from "vitest";
import type { ImageProvider, ProviderCapability } from "@company/ai-composer-providers";
import { MockChatProvider } from "@company/ai-composer-providers";
import { WorkflowRuntime } from "./WorkflowRuntime";

class SlowImageProvider implements ImageProvider {
  getCapability(): ProviderCapability {
    return {
      provider: "slow-image",
      supports: ["image_generate", "image_edit", "image_replace"]
    };
  }

  editImage(input: { signal?: AbortSignal }): Promise<{ images: string[]; model: string }> {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => resolve({ images: ["mock://slow-image"], model: "slow-image" }), 100);

      input.signal?.addEventListener("abort", () => {
        window.clearTimeout(timer);
        const error = new Error("Workflow execution aborted.");
        error.name = "AbortError";
        reject(error);
      });
    });
  }

  generateImage(input: { signal?: AbortSignal }): Promise<{ images: string[]; model: string }> {
    return this.editImage(input);
  }
}

describe("WorkflowRuntime abort", () => {
  it("keeps the runtime in aborted state when execution is cancelled", async () => {
    const runtime = new WorkflowRuntime();
    const events: string[] = [];
    runtime.providers.registerProvider("chat", new MockChatProvider());
    runtime.providers.registerProvider("image", new SlowImageProvider());
    runtime.onAbort(() => events.push("abort"));

    const run = runtime.runPrompt("make the car blue");
    runtime.abort();

    await expect(run).rejects.toThrow("Workflow execution aborted.");
    expect(runtime.getState().status).toBe("aborted");
    expect(events).toContain("abort");
  });
});
