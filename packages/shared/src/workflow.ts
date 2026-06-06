export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: import("./composer").Attachment[];
  status?: "pending" | "streaming" | "success" | "error";
  createdAt: number;
}

export type WorkflowStepType =
  | "chat"
  | "image_generate"
  | "image_edit"
  | "image_replace"
  | "video_generate"
  | "image_to_video"
  | "avatar_generate"
  | "avatar_talking_video"
  | "agent_task";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  title: string;
  prompt?: string;
  status: "waiting" | "running" | "success" | "error";
  output?: unknown;
  provider?: string;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface WorkflowExecutionResult {
  steps: WorkflowStep[];
  finalOutput?: unknown;
}
