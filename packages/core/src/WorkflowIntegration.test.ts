import { describe, expect, it } from "vitest";
import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { WorkflowRuntime } from "./WorkflowRuntime";

describe("Workflow integration", () => {
  it("runs prompt analysis through provider and executes image edit steps", async () => {
    const runtime = new WorkflowRuntime();
    runtime.providers.registerProvider("chat", new MockChatProvider());
    runtime.providers.registerProvider("image", new MockImageProvider());

    const result = await runtime.runPrompt("把宝马改成蓝色\n然后背景改成雨夜高架\n最后改成9:16");

    expect(result.steps).toHaveLength(3);
    expect(result.steps.every((step) => step.status === "success")).toBe(true);
    expect(result.steps[0]?.output).toMatchObject({ model: "mock-image" });
    expect(result.messages).toHaveLength(2);
  });

  it("supports provider registry lifecycle", () => {
    const runtime = new WorkflowRuntime();
    const chatProvider = new MockChatProvider();

    runtime.providers.registerProvider("chat", chatProvider);

    expect(runtime.providers.getProvider("chat")).toBe(chatProvider);
    expect(runtime.providers.listProviders()).toContain("chat");
    expect(runtime.providers.listProviders()).toContain("workflowAnalyzer");
    expect(runtime.providers.removeProvider("chat")).toBe(true);
    expect(runtime.providers.getProvider("chat")).toBeUndefined();
  });
});
