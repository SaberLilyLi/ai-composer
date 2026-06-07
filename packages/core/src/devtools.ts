import type { PluginRecord } from "./PluginManager";
import type { WorkspaceInstance } from "./WorkspaceFactory";

export interface RuntimeStateViewer {
  conversation: ReturnType<WorkspaceInstance["conversationRuntime"]["getState"]>;
  workflow: ReturnType<WorkspaceInstance["workflowRuntime"]["getState"]>;
}

export interface ProviderViewer {
  providers: string[];
  capabilities: ReturnType<WorkspaceInstance["providerRegistry"]["listCapabilities"]>;
}

export interface PluginViewer {
  plugins: PluginRecord[];
}

export interface WorkflowViewer {
  steps: ReturnType<WorkspaceInstance["workflowRuntime"]["getState"]>["steps"];
}

export interface DevtoolsSnapshot {
  runtime: RuntimeStateViewer;
  providers: ProviderViewer;
  plugins: PluginViewer;
  workflow: WorkflowViewer;
}

export function createDevtoolsSnapshot(workspace: WorkspaceInstance): DevtoolsSnapshot {
  return {
    runtime: {
      conversation: workspace.conversationRuntime.getState(),
      workflow: workspace.workflowRuntime.getState()
    },
    providers: {
      providers: workspace.providerRegistry.listProviders(),
      capabilities: workspace.providerRegistry.listCapabilities()
    },
    plugins: {
      plugins: workspace.pluginManager.listPlugins()
    },
    workflow: {
      steps: workspace.workflowRuntime.getState().steps
    }
  };
}
