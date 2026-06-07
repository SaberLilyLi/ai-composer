import "@company/ai-composer/styles.css";

import {
  AiStudioProvider as InternalAiStudioProvider,
  AiComposer as InternalAiComposer,
  ConversationView as InternalConversationView,
  WorkflowTimeline as InternalWorkflowTimeline,
  useAiStudio as internalUseAiStudio
} from "@company/ai-composer";
import type {
  AiComposerProps,
  AiStudio,
  AiStudioProviderProps,
  ConversationViewProps,
  ReactComponent,
  WorkflowTimelineProps
} from "./types";

export const AiStudioProvider: ReactComponent<AiStudioProviderProps> =
  InternalAiStudioProvider as unknown as ReactComponent<AiStudioProviderProps>;
export const AiComposer: ReactComponent<AiComposerProps> =
  InternalAiComposer as unknown as ReactComponent<AiComposerProps>;
export const ConversationView: ReactComponent<ConversationViewProps> =
  InternalConversationView as unknown as ReactComponent<ConversationViewProps>;
export const WorkflowTimeline: ReactComponent<WorkflowTimelineProps> =
  InternalWorkflowTimeline as unknown as ReactComponent<WorkflowTimelineProps>;
export const useAiStudio = internalUseAiStudio as unknown as () => AiStudio;

export type {
  AiStudioProviderProps,
  AiComposerProps,
  ConversationViewProps,
  WorkflowTimelineProps
};
