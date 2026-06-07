import { describe, expect, it } from "vitest";
import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { ConversationRuntime } from "./ConversationRuntime";
import { PluginManager } from "./PluginManager";
import { WorkflowRuntime } from "./WorkflowRuntime";

describe("Plugin permissions", () => {
  it("blocks activation when capability permissions are missing", async () => {
    const workflowRuntime = new WorkflowRuntime();
    workflowRuntime.providers.registerProvider("chat", new MockChatProvider());
    workflowRuntime.providers.registerProvider("image", new MockImageProvider());

    const manager = new PluginManager();
    manager.setContext({
      schema: {
        workspace: "agent",
        provider: "openai",
        chatModel: "gpt-5.5",
        imageModel: "gpt-image-2",
        features: ["plugins"],
        theme: { mode: "auto", tokens: {} },
        providerConfig: {
          provider: "openai",
          apiKey: "",
          baseUrl: "https://api.openai.com/v1",
          chatModel: "gpt-5.5",
          imageModel: "gpt-image-2",
          timeout: 30000,
          maxRetries: 2
        }
      },
      conversationRuntime: new ConversationRuntime(new MockChatProvider()),
      workflowRuntime,
      providerRegistry: workflowRuntime.providers
    });

    await manager.registerPlugin({
      manifest: {
        name: "video",
        version: "1.0.0",
        capabilities: ["video_generate"]
      }
    });

    await expect(manager.enablePlugin("video")).resolves.toBe(false);
    expect(manager.listPlugins()[0]?.lastError).toContain("does not declare permissions");
  });
});
