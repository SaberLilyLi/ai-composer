import { computed, defineComponent, h, ref, type PropType } from "vue";
import type { Message, WorkflowStep } from "@company/ai-composer-shared";
import type { ComposerTheme } from "@company/ai-composer-core";
import { AiComposer } from "../components/AiComposer";
import { ConversationView } from "../components/ConversationView";
import { WorkflowTimeline } from "../components/WorkflowTimeline";
import { useAiStudio } from "../composables/useAiStudio";

export interface AiStudioWorkspaceProps {
  title?: string;
  subtitle?: string;
  theme?: ComposerTheme;
}

function getMessages(runtime: { getState(): { messages: Message[] } }): Message[] {
  return runtime.getState().messages;
}

export const AiStudioWorkspace = defineComponent({
  name: "AiStudioWorkspace",
  props: {
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined },
    theme: { type: String as PropType<ComposerTheme>, default: undefined }
  },
  setup(props) {
    const studio = useAiStudio();
    const value = ref("");
    const messages = ref<Message[]>([]);
    const steps = ref<WorkflowStep[]>([]);
    const error = ref("");
    const isBusy = ref(false);
    const activeTheme = computed(() => props.theme ?? studio.value.schema.theme.mode);
    const activeTitle = computed(() => props.title ?? "AI Studio Workspace");
    const activeSubtitle = computed(() => props.subtitle ?? "Compose a message and run the configured workspace runtime.");

    const stop = () => {
      studio.value.workspace.conversationRuntime.abort();
      studio.value.workspace.workflowRuntime.abort();
      isBusy.value = false;
    };

    const send = async (nextValue: string) => {
      const trimmed = nextValue.trim();
      if (!trimmed || isBusy.value) {
        return;
      }

      error.value = "";
      isBusy.value = true;
      value.value = "";

      try {
        if (studio.value.schema.workspace === "image") {
          const runtime = studio.value.workspace.workflowRuntime;

          runtime.onStart(({ state }) => {
            messages.value = state.messages;
            steps.value = state.steps;
          });
          runtime.onStepStart(({ state }) => {
            messages.value = state.messages;
            steps.value = state.steps;
          });
          runtime.onStepSuccess(({ state }) => {
            messages.value = state.messages;
            steps.value = state.steps;
          });
          runtime.onStepError(({ state, error: stepError }) => {
            messages.value = state.messages;
            steps.value = state.steps;
            error.value = stepError instanceof Error ? stepError.message : "Workflow step failed.";
          });
          runtime.onComplete(({ state }) => {
            messages.value = state.messages;
            steps.value = state.steps;
            error.value = state.error ?? "";
          });

          await runtime.runPrompt(trimmed);
          return;
        }

        const runtime = studio.value.workspace.conversationRuntime;

        runtime.onStart(() => {
          messages.value = getMessages(runtime);
        });
        runtime.onMessage(() => {
          messages.value = getMessages(runtime);
        });
        runtime.onStreaming(() => {
          messages.value = getMessages(runtime);
        });
        runtime.onComplete(() => {
          messages.value = getMessages(runtime);
        });
        runtime.onError(({ error: runtimeError }) => {
          messages.value = getMessages(runtime);
          error.value = runtimeError.message;
        });

        await runtime.send(trimmed);
      } finally {
        isBusy.value = false;
      }
    };

    return () =>
      h("div", { class: "flex min-h-screen w-full flex-col bg-composer-bg text-composer-text", "data-theme": activeTheme.value }, [
        h("header", { class: "sticky top-0 z-20 border-b border-composer-softBorder bg-composer-bg/95 px-4 py-3" }, [
          h("div", { class: "mx-auto flex max-w-[920px] items-center justify-between gap-4" }, [
            h("div", { class: "min-w-0" }, [
              h("h1", { class: "truncate text-base font-semibold text-composer-text" }, activeTitle.value),
              h("p", { class: "truncate text-xs text-composer-muted" }, activeSubtitle.value)
            ]),
            h("button", { type: "button", class: "rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted hover:bg-composer-chip", onClick: stop }, "Stop")
          ])
        ]),
        h("main", { class: "flex min-h-0 flex-1 flex-col px-4 pb-10 pt-8" }, [
          error.value
            ? h("div", { class: "mx-auto mb-3 max-w-[760px] rounded-2xl border border-composer-chipBorder bg-composer-chip px-4 py-3 text-sm text-composer-danger" }, error.value)
            : null,
          h(WorkflowTimeline, { steps: steps.value }),
          h(ConversationView, { messages: messages.value }),
          h("div", { class: "mx-auto mt-6 w-full max-w-[760px]" }, [
            h(AiComposer, {
              theme: activeTheme.value,
              value: value.value,
              loading: isBusy.value,
              uploadOptions: { accept: ["image/*"], maxFiles: 4 },
              placeholder: studio.value.schema.workspace === "image" ? "Describe the image workflow..." : "Ask anything...",
              "onUpdate:value": (nextValue: string) => {
                value.value = nextValue;
              },
              onSend: (nextValue: string) => {
                void send(nextValue);
              },
              onStop: stop
            })
          ])
        ])
      ]);
  }
});
