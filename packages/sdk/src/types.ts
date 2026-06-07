import type { ComponentType } from "react";
import type { DefineComponent } from "vue";

export type ComposerTheme = "light" | "dark" | "auto";
export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MessageStatus = "pending" | "streaming" | "success" | "error";
export type WorkflowStepStatus = "waiting" | "running" | "success" | "error";

export interface Attachment {
  id: string;
  type: "image" | "video" | "audio" | "file" | "avatar";
  url: string;
  name?: string;
  mimeType?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  status?: MessageStatus;
  attachments?: Attachment[];
}

export interface WorkflowStep {
  id: string;
  type: string;
  title: string;
  status: WorkflowStepStatus;
  prompt?: string;
  result?: unknown;
  error?: string;
}

export interface ComposerAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  status: "ready" | "invalid";
  error?: string;
}

export interface UploadPluginOptions {
  accept?: string[];
  maxFiles?: number;
  maxFileSize?: number;
}

export interface MentionItem {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface CommandItem {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface ComposerActionOptionChoice {
  label: string;
  value: string;
}

export interface ComposerActionOption {
  id: string;
  label: string;
  value: string;
  options: ComposerActionOptionChoice[];
}

export interface AiComposerProps {
  value?: string;
  defaultValue?: string;
  defaultAttachments?: ComposerAttachment[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  minRows?: number;
  maxRows?: number;
  theme?: ComposerTheme;
  uploadOptions?: UploadPluginOptions;
  mentions?: MentionItem[];
  commands?: CommandItem[];
  showActionOptions?: boolean;
  actionOptions?: ComposerActionOption[];
  onChange?: (value: string) => void;
  onActionOptionChange?: (id: string, value: string) => void;
  onSend?: (value: string, context: { attachments: ComposerAttachment[] }) => void | Promise<void>;
  onStop?: () => void;
  onAttachmentsChange?: (attachments: ComposerAttachment[]) => void;
  onAttachmentError?: (message: string, file?: File) => void;
  onMentionSelect?: (item: MentionItem) => void;
  onCommandSelect?: (item: CommandItem) => void;
}

export interface ConversationViewProps {
  messages: Message[];
}

export interface WorkflowTimelineProps {
  steps: WorkflowStep[];
}

export interface AiStudioProviderProps {
  studio?: AiStudio;
  config?: AiStudioConfig;
  children?: unknown;
}

export interface VueAiComposerProps {
  value?: string;
  defaultValue?: string;
  defaultAttachments?: ComposerAttachment[];
  theme?: ComposerTheme;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  minRows?: number;
  maxRows?: number;
  uploadOptions?: UploadPluginOptions;
  mentions?: MentionItem[];
  commands?: CommandItem[];
  showActionOptions?: boolean;
  actionOptions?: ComposerActionOption[];
  onSend?: (value: string, context: { attachments: ComposerAttachment[] }) => void | Promise<void>;
  onStop?: () => void;
  onChange?: (value: string) => void;
  onActionOptionChange?: (id: string, value: string) => void;
}

export interface VueConversationViewProps {
  messages: Message[];
}

export interface VueWorkflowTimelineProps {
  steps: WorkflowStep[];
}

export type ReactComponent<Props> = ComponentType<Props>;
export type VueComponent<Props> = DefineComponent<Props>;

export interface ProviderConfig {
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  chatModel?: string;
  imageModel?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ThemeConfig {
  mode?: ComposerTheme;
  tokens?: Record<string, string>;
}

export interface AiStudioConfig {
  workspace?: "chat" | "image" | "agent";
  provider?: string;
  chatModel?: string;
  imageModel?: string;
  features?: string[];
  theme?: ThemeConfig;
  providerConfig?: ProviderConfig;
}

export interface AiStudio {
  schema: Record<string, any>;
  workspace: WorkspaceInstance;
  validator: SchemaValidator;
  documentation: unknown;
}

export interface WorkspaceFactoryOptions {
  plugins?: unknown[];
}

export interface WorkspaceHandle {
  kind: string;
  runtime?: unknown;
  providers?: unknown;
  plugins?: PluginManager;
}

export type ChatWorkspace = WorkspaceHandle & { kind: "chat" };
export type ImageWorkspace = WorkspaceHandle & { kind: "image" };
export type AgentWorkspace = WorkspaceHandle & { kind: "agent" };
export type WorkspaceInstance = ChatWorkspace | ImageWorkspace | AgentWorkspace | WorkspaceHandle;

export interface PluginPermission {
  capability: string;
  scope?: string;
  resource?: string;
}

export interface PluginManifest {
  name: string;
  version?: string;
  capabilities?: string[];
  permissions?: PluginPermission[];
}

export interface PluginRecord {
  manifest: PluginManifest;
  enabled: boolean;
  error?: string;
}

export interface SchemaValidator {
  defaults(kind: string, input?: unknown): unknown;
  normalize(kind: string, input?: unknown): unknown;
  validate(kind: string, input?: unknown): { valid: boolean; errors: string[] };
}

export interface WorkspaceFactory {
  createWorkspace(config?: AiStudioConfig, options?: WorkspaceFactoryOptions): WorkspaceInstance;
}

export interface PluginManager {
  registerPlugin(plugin: unknown): void;
  removePlugin(name: string): void;
  enablePlugin(name: string): void;
  disablePlugin(name: string): void;
  listPlugins(): PluginRecord[];
}

export interface ChatProvider {
  chat(input: { messages: Message[]; signal?: AbortSignal }): Promise<{ text: string; model: string }>;
}

export interface ImageProvider {
  generateImage(input: {
    prompt: string;
    attachments?: string[];
    signal?: AbortSignal;
  }): Promise<{ images: string[]; model: string }>;
  editImage(input: {
    prompt: string;
    attachments: string[];
    signal?: AbortSignal;
  }): Promise<{ images: string[]; model: string }>;
}

export interface ConversationRuntime {
  getState(): { status: string; messages: Message[]; error?: string; lastInput?: string };
  send(content: string): Promise<Message>;
  abort(): void;
  retry(): Promise<Message>;
}
