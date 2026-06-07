import {
  createAiStudio as internalCreateAiStudio,
  ConversationRuntime as InternalConversationRuntime,
  SchemaValidator as InternalSchemaValidator,
  WorkspaceFactory as InternalWorkspaceFactory,
  PluginManager as InternalPluginManager
} from "@company/ai-composer-core";
import {
  GPTImageProvider as InternalGPTImageProvider,
  GPTProvider as InternalGPTProvider
} from "@company/ai-composer-providers";
import type {
  AiStudio,
  AiStudioConfig,
  AgentWorkspace,
  ChatProvider,
  ChatWorkspace,
  ConversationRuntime as ConversationRuntimeType,
  ImageProvider,
  ImageWorkspace,
  PluginManager as PluginManagerType,
  PluginManifest,
  PluginPermission,
  PluginRecord,
  ProviderConfig,
  SchemaValidator as SchemaValidatorType,
  WorkspaceFactory as WorkspaceFactoryType,
  WorkspaceFactoryOptions,
  WorkspaceHandle,
  WorkspaceInstance
} from "./types";

export const createAiStudio = internalCreateAiStudio as (config?: AiStudioConfig) => AiStudio;

export const SchemaValidator = InternalSchemaValidator as unknown as {
  new (): SchemaValidatorType;
};

export const WorkspaceFactory = InternalWorkspaceFactory as unknown as {
  new (): WorkspaceFactoryType;
};

export const PluginManager = InternalPluginManager as unknown as {
  new (): PluginManagerType;
};

export const ConversationRuntime = InternalConversationRuntime as unknown as {
  new (chatProvider: ChatProvider): ConversationRuntimeType;
};

export const GPTProvider = InternalGPTProvider as unknown as {
  new (config: ProviderConfig): ChatProvider;
};

export const GPTImageProvider = InternalGPTImageProvider as unknown as {
  new (config: ProviderConfig): ImageProvider;
};

export type {
  AiStudio,
  AiStudioConfig,
  ChatProvider,
  ConversationRuntimeType as ConversationRuntimeInstance,
  ImageProvider,
  PluginManifest,
  PluginPermission,
  PluginRecord,
  ProviderConfig,
  WorkspaceFactoryOptions,
  WorkspaceHandle,
  WorkspaceInstance
};

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
};
