import "./styles/index.css";

export { AiComposer } from "./components/AiComposer";
export type { AiComposerProps } from "./components/AiComposer";
export { AgentConversationWorkspace } from "./components/AgentConversationWorkspace";
export type { AgentConversationWorkspaceProps } from "./components/AgentConversationWorkspace";
export { ComposerCore } from "./core/ComposerCore";
export { ContextManager } from "./core/ContextManager";
export { UploadManager } from "./core/UploadManager";
export {
  getAgentRuntimeConfig,
  requestAgentChat,
  requestAgentImage,
  toAttachmentPreviews
} from "./core/agentRuntime";
export { CommandPlugin } from "./plugins/CommandPlugin";
export { MentionPlugin } from "./plugins/MentionPlugin";
export { UploadPlugin } from "./plugins/UploadPlugin";
export type {
  CommandItem,
  ComposerActionOption,
  ComposerActionOptionChoice,
  ComposerAttachment,
  ComposerContextItem,
  ComposerContextMode,
  ComposerPhase,
  ComposerPlugin,
  ComposerState,
  MentionItem,
  UploadPluginOptions
} from "./core/types";
export type {
  AgentAttachmentPreview,
  AgentMessage,
  AgentMode,
  AgentRole,
  AgentRuntimeConfig
} from "./core/agentRuntime";
export { createReactAdapter } from "./adapters/react";
export { createVueAdapter } from "./adapters/vue";
