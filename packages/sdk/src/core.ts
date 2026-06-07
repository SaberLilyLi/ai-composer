export {
  createAiStudio,
  SchemaValidator,
  WorkspaceFactory,
  PluginManager
} from "@company/ai-composer-core";

export type {
  AiStudio,
  AiStudioConfig,
  PluginManifest,
  PluginPermission,
  PluginRecord,
  WorkspaceFactoryOptions,
  WorkspaceHandle,
  WorkspaceInstance
} from "@company/ai-composer-core";

/**
 * Reference Implementation.
 *
 * Business projects should prefer composing `AiComposer`, `ConversationView`,
 * and `WorkflowTimeline` to build their own workspace surface instead of
 * binding directly to these workspace shapes.
 */
export type {
  AgentWorkspace,
  ChatWorkspace,
  ImageWorkspace
} from "@company/ai-composer-core";
