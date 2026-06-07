import {
  AiStudioProvider as InternalAiStudioProvider,
  AiComposer as InternalAiComposer,
  ConversationView as InternalConversationView,
  WorkflowTimeline as InternalWorkflowTimeline,
  useAiStudio as internalUseAiStudio
} from "@company/ai-composer-vue";
import type {
  AiStudio,
  VueAiComposerProps,
  VueComponent,
  VueConversationViewProps,
  VueWorkflowTimelineProps
} from "./types";

export const AiStudioProvider: VueComponent<Record<string, unknown>> =
  InternalAiStudioProvider as unknown as VueComponent<Record<string, unknown>>;
export const AiComposer: VueComponent<VueAiComposerProps> =
  InternalAiComposer as unknown as VueComponent<VueAiComposerProps>;
export const ConversationView: VueComponent<VueConversationViewProps> =
  InternalConversationView as unknown as VueComponent<VueConversationViewProps>;
export const WorkflowTimeline: VueComponent<VueWorkflowTimelineProps> =
  InternalWorkflowTimeline as unknown as VueComponent<VueWorkflowTimelineProps>;
export const useAiStudio = internalUseAiStudio as unknown as () => AiStudio;

export type {
  VueAiComposerProps,
  VueConversationViewProps,
  VueWorkflowTimelineProps
};
