import "./styles/index.css";

export { AiComposer } from "./components/AiComposer";
export type { AiComposerProps } from "./components/AiComposer";
export { ConversationView } from "./components/ConversationView";
export type { ConversationViewProps } from "./components/ConversationView";
export { WorkflowTimeline } from "./components/WorkflowTimeline";
export type { WorkflowTimelineProps } from "./components/WorkflowTimeline";
export { AgentConversationWorkspace } from "./components/AgentConversationWorkspace";
export type { AgentConversationWorkspaceProps } from "./components/AgentConversationWorkspace";
export type {
  AgentChatUIConfig,
  AgentConversationConfig,
  AgentConversationUIConfig,
  AgentImageGenerationUIConfig,
  AgentImageUIConfig,
  AgentMode,
  AgentModeSwitchConfig,
  AgentRuntimeConfig,
  AgentSelectOption
} from "./controllers/useAgentConversationController";
export { createReactAdapter } from "./adapters/react";
export {
  ComposerCore,
  ContextManager,
  UploadManager,
  getAgentRuntimeConfig,
  requestAgentChat,
  requestAgentImage,
  toAttachmentPreviews,
  CommandPlugin,
  MentionPlugin,
  UploadPlugin
} from "@company/ai-composer-core";
export type * from "@company/ai-composer-core";
