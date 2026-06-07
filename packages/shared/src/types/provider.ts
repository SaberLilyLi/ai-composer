import type { Message, WorkflowExecutionResult, WorkflowStep, WorkflowStepType } from "../workflow";

export type ProviderIOType = "text" | "image" | "video" | "audio";

export interface ProviderCapability {
  provider: string;
  supports: WorkflowStepType[];
  providerName?: string;
  model?: string;
  supportedSteps?: WorkflowStepType[];
  inputTypes?: ProviderIOType[];
  outputTypes?: ProviderIOType[];
  attachments?: boolean;
  streaming?: boolean;
  batch?: boolean;
  configurable?: boolean;
  maxFiles?: number;
  maxImages?: number;
  metadata?: Record<string, unknown>;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  website?: string;
  category: "chat" | "image" | "video" | "audio" | "avatar";
  status: "stable" | "beta" | "experimental";
  pricing?: string;
  tags?: string[];
}

export interface ChatStreamChunk {
  content: string;
  done: boolean;
}

export interface ChatProvider {
  chat(input: { messages: Message[]; signal?: AbortSignal }): Promise<{ text: string; model: string }>;
  stream?(input: { messages: Message[]; signal?: AbortSignal }): AsyncIterable<ChatStreamChunk>;
  optimizePrompt?(input: { prompt: string; signal?: AbortSignal }): Promise<{ prompt: string; model: string }>;
  analyzeWorkflow?(input: { prompt: string; signal?: AbortSignal }): Promise<{ steps: Array<{ type: WorkflowStepType; prompt: string }>; model: string }>;
  getCapability?(): ProviderCapability;
  getMetadata?(): ProviderMetadata;
}

export interface ImageProvider {
  generateImage(input: { prompt: string; attachments?: string[]; signal?: AbortSignal }): Promise<{ images: string[]; model: string }>;
  editImage?(input: { prompt: string; attachments: string[]; signal?: AbortSignal }): Promise<{ images: string[]; model: string }>;
  getCapability?(): ProviderCapability;
  getMetadata?(): ProviderMetadata;
}

export interface VideoProvider {
  generateVideo(input: { prompt: string; signal?: AbortSignal }): Promise<{ videos: string[]; model: string }>;
  imageToVideo?(input: { prompt: string; image: string; signal?: AbortSignal }): Promise<{ videos: string[]; model: string }>;
  getCapability?(): ProviderCapability;
  getMetadata?(): ProviderMetadata;
}

export interface AvatarProvider {
  createAvatar(input: { prompt: string; signal?: AbortSignal }): Promise<{ avatarId: string; model: string }>;
  generateTalkingVideo(input: { avatarId: string; script: string; signal?: AbortSignal }): Promise<{ videoUrl: string; model: string }>;
  getCapability?(): ProviderCapability;
  getMetadata?(): ProviderMetadata;
}

export interface AgentProvider {
  plan(input: { goal: string; signal?: AbortSignal }): Promise<{ steps: WorkflowStep[]; model: string }>;
  execute(input: { steps: WorkflowStep[]; signal?: AbortSignal }): Promise<WorkflowExecutionResult>;
  getCapability?(): ProviderCapability;
  getMetadata?(): ProviderMetadata;
}

export interface WorkflowAnalyzerProvider {
  analyzeWorkflow(input: { prompt: string; signal?: AbortSignal }): Promise<{ steps: Array<{ type: WorkflowStepType; prompt: string }>; model: string }>;
}

export interface PromptOptimizerProvider {
  optimizePrompt(input: { prompt: string; signal?: AbortSignal }): Promise<{ prompt: string; model: string }>;
}
