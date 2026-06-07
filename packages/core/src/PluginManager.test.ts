import { describe, expect, it } from "vitest";
import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { ConversationRuntime } from "./ConversationRuntime";
import { PluginManager } from "./PluginManager";
import { WorkflowRuntime } from "./WorkflowRuntime";

describe("PluginManager", () => {
  it("manages enterprise plugin lifecycle", async () => {
    const workflowRuntime = new WorkflowRuntime();
    workflowRuntime.providers.registerProvider("chat", new MockChatProvider());
    workflowRuntime.providers.registerProvider("image", new MockImageProvider());

    const conversationRuntime = new ConversationRuntime(new MockChatProvider());
    const manager = new PluginManager();
    const lifecycle: string[] = [];

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
      conversationRuntime,
      workflowRuntime,
      providerRegistry: workflowRuntime.providers
    });

    await manager.registerPlugin({
      manifest: {
        name: "video",
        version: "1.0.0",
        capabilities: ["video_generate"],
        permissions: [{ capability: "video_generate" }]
      },
      install: () => {
        lifecycle.push("install");
      },
      activate: () => {
        lifecycle.push("activate");
      },
      deactivate: () => {
        lifecycle.push("deactivate");
      },
      uninstall: () => {
        lifecycle.push("uninstall");
      }
    });

    expect(manager.listPlugins()).toEqual([
      expect.objectContaining({
        manifest: expect.objectContaining({ name: "video" }),
        enabled: false,
        installed: true
      })
    ]);

    await manager.enablePlugin("video");
    await manager.disablePlugin("video");
    await manager.removePlugin("video");

    expect(lifecycle).toEqual(["install", "activate", "deactivate", "uninstall"]);
  });
});
