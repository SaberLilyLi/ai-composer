import type { Message, WorkflowStep } from "../workflow";

export type RuntimeEventName =
  | "workflow:start"
  | "workflow:complete"
  | "workflow:error"
  | "step:start"
  | "step:success"
  | "step:error"
  | "conversation:start"
  | "conversation:message"
  | "conversation:complete";

export interface RuntimeEventPayloadMap {
  "workflow:start": { state: unknown };
  "workflow:complete": { state: unknown };
  "workflow:error": { error: unknown; state?: unknown };
  "step:start": { step: WorkflowStep; state?: unknown };
  "step:success": { step: WorkflowStep; state?: unknown };
  "step:error": { step: WorkflowStep; error: unknown; state?: unknown };
  "conversation:start": { message: Message };
  "conversation:message": { message: Message };
  "conversation:complete": { message: Message };
}
