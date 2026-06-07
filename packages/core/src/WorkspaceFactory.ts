import { ConversationRuntime } from "./ConversationRuntime";
import { PluginManager, type AiStudioPlugin } from "./PluginManager";
import { SchemaValidator } from "./SchemaValidator";
import type { ProviderRegistry } from "./ProviderRegistry";
import { WorkflowRuntime } from "./WorkflowRuntime";
import { createRuntimeProviderBundle } from "./runtimeProviders";
import type { WorkspaceKind, WorkspaceSchema, WorkspaceSchemaInput } from "./schema";

export interface WorkspaceFactoryOptions {
  plugins?: AiStudioPlugin[];
}

export interface WorkspaceHandle {
  kind: WorkspaceKind;
  schema: WorkspaceSchema;
  pluginManager: PluginManager;
  conversationRuntime: ConversationRuntime;
  workflowRuntime: WorkflowRuntime;
  providerRegistry: ProviderRegistry;
}

export interface ChatWorkspace extends WorkspaceHandle {
  kind: "chat";
}

export interface ImageWorkspace extends WorkspaceHandle {
  kind: "image";
}

export interface AgentWorkspace extends WorkspaceHandle {
  kind: "agent";
}

export type WorkspaceInstance = ChatWorkspace | ImageWorkspace | AgentWorkspace;

export class WorkspaceFactory {
  constructor(private readonly validator = new SchemaValidator()) {}

  createWorkspace(input?: WorkspaceSchemaInput, options: WorkspaceFactoryOptions = {}): WorkspaceInstance {
    const schema = this.validator.normalize("workspace", input);
    const providers = createRuntimeProviderBundle(schema.providerConfig);
    const conversationRuntime = new ConversationRuntime(providers.chat);
    const workflowRuntime = new WorkflowRuntime();

    workflowRuntime.providers.registerProvider("chat", providers.chat);
    workflowRuntime.providers.registerProvider("image", providers.image);
    workflowRuntime.providers.registerProvider("workflowAnalyzer", providers.workflowAnalyzer);
    workflowRuntime.providers.registerProvider("promptOptimizer", providers.promptOptimizer);

    const pluginManager = new PluginManager();
    const workspace: WorkspaceHandle = {
      kind: schema.workspace,
      schema,
      pluginManager,
      conversationRuntime,
      workflowRuntime,
      providerRegistry: workflowRuntime.providers
    };

    pluginManager.setContext({
      schema,
      conversationRuntime,
      workflowRuntime,
      providerRegistry: workflowRuntime.providers
    });

    for (const plugin of options.plugins ?? []) {
      void pluginManager.registerPlugin(plugin).catch(() => undefined);
    }

    return workspace as WorkspaceInstance;
  }
}
