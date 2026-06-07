import { AiComposer } from "../components/AiComposer";
import { ConversationView } from "../components/ConversationView";
import { WorkflowTimeline } from "../components/WorkflowTimeline";
import { AiStudioProvider } from "./AiStudioProvider";
import { AiStudioWorkspace } from "./AiStudioWorkspace";

export interface VueAdapterOptions {
  componentName?: string;
}

export function createVueAdapter(options: VueAdapterOptions = {}) {
  return {
    componentName: options.componentName ?? "AiComposer",
    components: {
      AiComposer,
      ConversationView,
      WorkflowTimeline,
      AiStudioProvider,
      AiStudioWorkspace
    }
  };
}
