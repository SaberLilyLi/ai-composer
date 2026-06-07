import { describe, expect, it } from "vitest";
import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { ConversationRuntime } from "./ConversationRuntime";
import { PluginManager } from "./PluginManager";
import { WorkflowRuntime } from "./WorkflowRuntime";

describe("Plugin sandbox", () => {
  it("captures plugin lifecycle failures without crashing the runtime", async () => {
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
        name: "broken",
        version: "1.0.0",
        capabilities: ["video_generate"],
        permissions: [{ capability: "video_generate" }]
      },
      activate: () => {
        throw new Error("sandbox failure");
      }
    });

    await expect(manager.enablePlugin("broken")).resolves.toBe(false);
    expect(manager.listPlugins()[0]?.lastError).toContain("sandbox failure");
    expect(workflowRuntime.getState().status).toBe("idle");
  });
});
