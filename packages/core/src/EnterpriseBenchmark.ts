import { MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";
import { ConversationRuntime } from "./ConversationRuntime";
import { PluginManager } from "./PluginManager";
import { WorkspaceFactory } from "./WorkspaceFactory";
import { WorkflowRuntime } from "./WorkflowRuntime";

export interface BenchmarkMetric {
  name: string;
  durationMs: number;
}

export interface BenchmarkReport {
  generatedAt: string;
  metrics: BenchmarkMetric[];
}

export async function runEnterpriseBenchmark(): Promise<BenchmarkReport> {
  const metrics: BenchmarkMetric[] = [];

  metrics.push(await measure("Workspace Creation", async () => {
    new WorkspaceFactory().createWorkspace({
      workspace: "agent",
      provider: "openai",
      features: ["upload", "workflow", "plugins"]
    });
  }));

  metrics.push(await measure("Provider Registration", async () => {
    const runtime = new WorkflowRuntime();
    runtime.providers.registerProvider("chat", new MockChatProvider());
    runtime.providers.registerProvider("image", new MockImageProvider());
  }));

  metrics.push(await measure("Workflow Execution", async () => {
    const runtime = new WorkflowRuntime();
    runtime.providers.registerProvider("chat", new MockChatProvider());
    runtime.providers.registerProvider("image", new MockImageProvider());
    await runtime.runPrompt("generate a product poster");
  }));

  metrics.push(await measure("Plugin Activation", async () => {
    const manager = new PluginManager();
    const workflowRuntime = new WorkflowRuntime();
    workflowRuntime.providers.registerProvider("chat", new MockChatProvider());
    workflowRuntime.providers.registerProvider("image", new MockImageProvider());
    manager.setContext({
      schema: new WorkspaceFactory().createWorkspace().schema,
      conversationRuntime: new ConversationRuntime(new MockChatProvider()),
      workflowRuntime,
      providerRegistry: workflowRuntime.providers
    });
    await manager.registerPlugin({
      manifest: {
        name: "video",
        version: "1.0.0",
        capabilities: ["video_generate"],
        permissions: [{ capability: "video_generate", scope: "workspace", resource: "workflow" }]
      }
    });
    await manager.enablePlugin("video");
  }));

  return {
    generatedAt: new Date().toISOString(),
    metrics
  };
}

async function measure(name: string, task: () => void | Promise<void>): Promise<BenchmarkMetric> {
  const start = performance.now();
  await task();
  return {
    name,
    durationMs: Number((performance.now() - start).toFixed(2))
  };
}
