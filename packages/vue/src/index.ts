import { computed, defineComponent, h, inject, provide, ref, type PropType, type Ref } from "vue";
import {
  ConversationRuntime,
  WorkflowRuntime,
  createDevtoolsSnapshot,
  createRuntimeProviderBundle,
  createAiStudio,
  type AiStudio,
  type AiStudioConfig,
  type AgentRuntimeConfig as CoreAgentRuntimeConfig
} from "@company/ai-composer-core";
import type { Attachment, ComposerTheme, Message, WorkflowStep } from "@company/ai-composer-shared";

export interface VueAdapterOptions {
  componentName?: string;
}

export interface VueAiComposerProps {
  theme?: ComposerTheme;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onSend?: (value: string) => void;
}

export interface VueConversationViewProps {
  messages: Message[];
}

export interface VueWorkflowTimelineProps {
  steps: WorkflowStep[];
}

export type AgentMode = "chat" | "image";

export interface VueAgentConversationWorkspaceProps {
  theme?: ComposerTheme;
  title?: string;
  subtitle?: string;
  initialMode?: AgentMode;
  config?: Partial<CoreAgentRuntimeConfig>;
}

const AI_STUDIO_KEY = Symbol("ai-studio");

function isImageAttachment(attachment: Attachment): boolean {
  return attachment.type === "image" || attachment.mimeType?.startsWith("image/") === true;
}

function renderMessageContent(content: string) {
  return content.split(/\n{2,}/).map((block, index) => {
    const lines = block.split("\n");
    const isList = lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line.trim()));

    if (isList) {
      return h(
        "ul",
        { key: `list-${index}`, class: "list-disc space-y-1 pl-5" },
        lines.map((line, lineIndex) => h("li", { key: `${line}-${lineIndex}` }, line.replace(/^[-*]\s+/, "")))
      );
    }

    return h("p", { key: `paragraph-${index}`, class: "whitespace-pre-wrap" }, block);
  });
}

function renderAttachments(attachments: Attachment[]) {
  const images = attachments.filter(isImageAttachment);
  const files = attachments.filter((attachment) => !isImageAttachment(attachment));

  if (attachments.length === 0) {
    return null;
  }

  return h("div", { class: "mt-4 space-y-3" }, [
    images.length > 0
      ? h(
          "div",
          { class: "grid grid-cols-2 gap-3" },
          images.map((attachment) =>
            h("img", {
              key: attachment.id,
              src: attachment.url,
              alt: attachment.name ?? "Image attachment",
              class: "aspect-square w-full rounded-[18px] border border-composer-softBorder object-cover"
            })
          )
        )
      : null,
    files.length > 0
      ? h(
          "div",
          { class: "flex flex-wrap gap-2" },
          files.map((attachment) =>
            h(
              "div",
              {
                key: attachment.id,
                class: "flex max-w-[220px] items-center gap-2 rounded-xl border border-composer-chipBorder bg-composer-input px-2.5 py-2"
              },
              [
                h(
                  "div",
                  {
                    class: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-composer-chip text-[10px] font-semibold text-composer-muted"
                  },
                  "FILE"
                ),
                h("div", { class: "min-w-0" }, [
                  h("div", { class: "truncate text-xs font-medium text-composer-text" }, attachment.name ?? "Attachment"),
                  attachment.mimeType
                    ? h("div", { class: "truncate text-[11px] text-composer-muted" }, attachment.mimeType)
                    : null
                ])
              ]
            )
          )
        )
      : null
  ]);
}

export const AiComposer = defineComponent({
  name: "AiComposer",
  props: {
    theme: { type: String as PropType<ComposerTheme>, default: "auto" },
    placeholder: { type: String, default: "Ask anything..." },
    disabled: { type: Boolean, default: false },
    value: { type: String, default: "" },
    onSend: { type: Function as PropType<(value: string) => void>, default: undefined }
  },
  emits: ["send", "update:value"],
  setup(props, { emit }) {
    return () =>
      h("div", { class: "rounded-[24px] border border-composer-border bg-composer-input p-4", "data-theme": props.theme }, [
        h("textarea", {
          value: props.value,
          placeholder: props.placeholder,
          disabled: props.disabled,
          rows: 3,
          class: "w-full resize-none bg-transparent text-base leading-7 text-composer-text outline-none placeholder:text-composer-muted",
          onInput: (event: Event) => emit("update:value", (event.target as HTMLTextAreaElement).value),
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              props.onSend?.((event.target as HTMLTextAreaElement).value);
              emit("send", (event.target as HTMLTextAreaElement).value);
            }
          }
        })
      ]);
  }
});

export const ConversationView = defineComponent({
  name: "ConversationView",
  props: {
    messages: { type: Array as PropType<Message[]>, default: () => [] }
  },
  setup(props) {
    return () =>
      h(
        "div",
        { class: "mx-auto flex max-w-[760px] flex-col gap-7" },
        props.messages.map((message) => {
          const isUser = message.role === "user";
          const isSystem = message.role === "system";

          return h(
            "article",
            {
              key: message.id,
              class: ["flex gap-4", isUser ? "justify-end" : isSystem ? "justify-center" : "justify-start"]
            },
            [
              !isUser && !isSystem
                ? h("div", { class: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-composer-elevated text-xs font-semibold text-composer-text" }, "AI")
                : null,
              h(
                "div",
                {
                  class: [
                    "min-w-0",
                    isUser
                      ? "max-w-[76%] rounded-[22px] bg-composer-elevated px-5 py-3 text-composer-text"
                      : isSystem
                        ? "max-w-[82%] rounded-full border border-composer-chipBorder bg-composer-chip px-4 py-2 text-center text-sm text-composer-muted"
                        : "flex-1 text-composer-text"
                  ]
                },
                [
                  !isUser && !isSystem
                    ? h("div", { class: "mb-2 text-xs font-medium text-composer-text" }, "Assistant")
                    : null,
                  h("div", { class: "space-y-3 whitespace-normal text-[15px] leading-7" }, renderMessageContent(message.content)),
                  renderAttachments(message.attachments ?? [])
                ]
              ),
              isUser
                ? h("div", { class: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-composer-brand text-xs font-semibold text-composer-sendText" }, "You")
                : null
            ]
          );
        })
      );
  }
});

const statusGlyph: Record<WorkflowStep["status"], string> = {
  waiting: "○",
  running: "⟳",
  success: "✓",
  error: "!"
};

export const WorkflowTimeline = defineComponent({
  name: "WorkflowTimeline",
  props: {
    steps: { type: Array as PropType<WorkflowStep[]>, default: () => [] }
  },
  setup(props) {
    return () =>
      h(
        "aside",
        {
          "aria-label": "Workflow timeline",
          class: "mx-auto mb-5 flex max-w-[760px] flex-wrap gap-2 rounded-2xl border border-composer-chipBorder bg-composer-input px-3 py-3"
        },
        props.steps.map((step, index) =>
          h(
            "div",
            {
              key: step.id,
              class: "flex min-h-9 items-center gap-2 rounded-full border border-composer-softBorder bg-composer-chip px-3 py-1.5 text-xs"
            },
            [
              h("span", { class: "font-semibold text-composer-text", "aria-hidden": "true" }, statusGlyph[step.status]),
              h("span", { class: "font-medium text-composer-text" }, step.title || `Step${index + 1}`),
              h("span", { class: "text-composer-muted" }, step.status)
            ]
          )
        )
      );
  }
});

function buildRuntimeConfig(config?: Partial<CoreAgentRuntimeConfig>): CoreAgentRuntimeConfig {
  const env = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {});

  return {
    apiKey: config?.apiKey ?? env.VITE_AGENT_API_KEY ?? env.VITE_GPT_API_KEY ?? "",
    baseUrl: config?.baseUrl ?? env.VITE_AGENT_BASE_URL ?? env.VITE_GPT_BASE_URL ?? "https://api.openai.com/v1",
    chatEndpoint: config?.chatEndpoint ?? env.VITE_AGENT_CHAT_ENDPOINT,
    imageEndpoint: config?.imageEndpoint ?? env.VITE_AGENT_IMAGE_ENDPOINT,
    chatModel: config?.chatModel ?? env.VITE_AGENT_CHAT_MODEL ?? env.VITE_GPT_CHAT_MODEL ?? "qwen3.7-plus",
    imageModel: config?.imageModel ?? env.VITE_AGENT_IMAGE_MODEL ?? env.VITE_GPT_IMAGE_MODEL ?? "wan2.7-image-pro"
  };
}

function buildConversationRuntime(config: CoreAgentRuntimeConfig) {
  return new ConversationRuntime(createRuntimeProviderBundle(config).chat);
}

function buildWorkflowRuntime(config: CoreAgentRuntimeConfig) {
  const runtime = new WorkflowRuntime();
  const providers = createRuntimeProviderBundle(config);

  runtime.providers.registerProvider("chat", providers.chat);
  runtime.providers.registerProvider("image", providers.image);
  runtime.providers.registerProvider("workflowAnalyzer", providers.workflowAnalyzer as any);
  runtime.providers.registerProvider("promptOptimizer", providers.promptOptimizer as any);

  return runtime;
}

export const AgentConversationWorkspace = defineComponent({
  name: "AgentConversationWorkspace",
  props: {
    theme: { type: String as PropType<ComposerTheme>, default: "dark" },
    title: { type: String, default: "Agent Conversation" },
    subtitle: { type: String, default: "Use the composer below to chat or execute an image workflow." },
    initialMode: { type: String as PropType<AgentMode>, default: "chat" },
    config: { type: Object as PropType<Partial<CoreAgentRuntimeConfig>>, default: undefined }
  },
  setup(props) {
    const runtimeConfig = buildRuntimeConfig(props.config);
    const mode = ref<AgentMode>(props.initialMode);
    const value = ref("");
    const messages = ref<Message[]>([]);
    const steps = ref<WorkflowStep[]>([]);
    const error = ref("");
    const isBusy = ref(false);
    const conversationRuntime = ref<ConversationRuntime | null>(null);
    const workflowRuntime = ref<WorkflowRuntime | null>(null);
    const activeModel = computed(() => (mode.value === "chat" ? runtimeConfig.chatModel : runtimeConfig.imageModel));

    const resetConversation = () => {
      conversationRuntime.value?.abort();
      workflowRuntime.value?.abort();
      conversationRuntime.value = null;
      workflowRuntime.value = null;
      messages.value = [];
      steps.value = [];
      error.value = "";
      value.value = "";
      isBusy.value = false;
    };

    const stop = () => {
      conversationRuntime.value?.abort();
      workflowRuntime.value?.abort();
    };

    const send = async (nextValue: string) => {
      const trimmed = nextValue.trim();

      if (!trimmed) {
        return;
      }

      error.value = "";
      isBusy.value = true;
      value.value = "";

      try {
        if (mode.value === "chat") {
          const runtime = buildConversationRuntime(runtimeConfig);
          conversationRuntime.value = runtime;
          runtime.onStart(() => {
            messages.value = runtime.getState().messages;
          });
          runtime.onMessage(() => {
            messages.value = runtime.getState().messages;
          });
          runtime.onStreaming(() => {
            messages.value = runtime.getState().messages;
          });
          runtime.onComplete(() => {
            messages.value = runtime.getState().messages;
            steps.value = [];
          });
          runtime.onError(({ error: runtimeError }) => {
            messages.value = runtime.getState().messages;
            error.value = runtimeError.message;
          });
          runtime.onAbort(() => {
            messages.value = runtime.getState().messages;
          });

          await runtime.send(trimmed);
          return;
        }

        const runtime = buildWorkflowRuntime(runtimeConfig);
        workflowRuntime.value = runtime;
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
        runtime.onStepError(({ state, error: runtimeError }) => {
          messages.value = state.messages;
          steps.value = state.steps;
          error.value = runtimeError instanceof Error ? runtimeError.message : "Workflow step failed.";
        });
        runtime.onComplete(({ state }) => {
          messages.value = state.messages;
          steps.value = state.steps;
          error.value = state.error ?? "";
        });
        runtime.onAbort(({ state }) => {
          messages.value = state.messages;
          steps.value = state.steps;
        });

        await runtime.runPrompt(trimmed);
      } finally {
        conversationRuntime.value = null;
        workflowRuntime.value = null;
        isBusy.value = false;
      }
    };

    return () =>
      h("div", { class: "flex min-h-screen w-full flex-col bg-composer-bg text-composer-text", "data-theme": props.theme }, [
        h("header", { class: "sticky top-0 z-20 border-b border-composer-softBorder bg-composer-bg/95 px-4 py-3" }, [
          h("div", { class: "mx-auto flex max-w-[920px] items-center justify-between gap-4" }, [
            h("div", { class: "min-w-0" }, [
              h("h1", { class: "truncate text-base font-semibold text-composer-text" }, props.title),
              h("p", { class: "truncate text-xs text-composer-muted" }, activeModel.value)
            ]),
            h("div", { class: "flex items-center gap-2" }, [
              h(
                "button",
                {
                  type: "button",
                  class: "rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted",
                  onClick: resetConversation
                },
                "Reset"
              ),
              h(
                "button",
                {
                  type: "button",
                  class: "rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted",
                  onClick: stop
                },
                "Stop"
              )
            ])
          ])
        ]),
        h("main", { class: "flex min-h-0 flex-1 flex-col px-4 pb-10 pt-8" }, [
          h("div", { class: "mx-auto mb-3 flex max-w-[760px] items-center justify-between gap-3" }, [
            h("div", { class: "flex rounded-full border border-composer-chipBorder bg-composer-input p-1" }, [
              ...(["chat", "image"] as AgentMode[]).map((item) =>
                h(
                  "button",
                  {
                    type: "button",
                    class: [
                      "rounded-full px-3 py-1.5 text-xs font-medium transition",
                      mode.value === item ? "bg-composer-elevated text-composer-text" : "text-composer-muted"
                    ],
                    onClick: () => {
                      mode.value = item;
                      messages.value = [];
                      steps.value = [];
                      error.value = "";
                    }
                  },
                  item === "chat" ? "Chat" : "Image"
                )
              )
            ]),
            h("p", { class: "truncate text-xs text-composer-muted" }, props.subtitle)
          ]),
          error.value
            ? h("div", { class: "mx-auto mb-3 max-w-[760px] rounded-2xl border border-composer-chipBorder bg-composer-chip px-4 py-3 text-sm text-composer-danger" }, error.value)
            : null,
          h(WorkflowTimeline, { steps: steps.value }),
          h(ConversationView, { messages: messages.value }),
          h("div", { class: "mx-auto mt-6 max-w-[760px] w-full" }, [
            h(AiComposer, {
              theme: props.theme,
              value: value.value,
              disabled: isBusy.value,
              placeholder: mode.value === "chat" ? "Ask anything..." : "Describe the image workflow you want to run...",
              "onUpdate:value": (nextValue: string) => {
                value.value = nextValue;
              },
              onSend: (nextValue: string) => {
                void send(nextValue);
              }
            })
          ])
        ])
      ]);
  }
});

export const AiStudioProvider = defineComponent({
  name: "AiStudioProvider",
  props: {
    studio: { type: Object as PropType<AiStudio>, default: undefined },
    config: { type: Object as PropType<AiStudioConfig>, default: undefined }
  },
  setup(props, { slots }) {
    const studio = ref<AiStudio>(props.studio ?? createAiStudio(props.config));
    provide(AI_STUDIO_KEY, studio);
    return () => slots.default?.() ?? null;
  }
});

export function useAiStudio() {
  const studio = inject<Ref<AiStudio> | null>(AI_STUDIO_KEY, null);

  if (!studio) {
    throw new Error("useAiStudio must be used inside AiStudioProvider.");
  }

  return studio;
}

export const AiStudioWorkspace = defineComponent({
  name: "AiStudioWorkspace",
  props: {
    title: { type: String, default: undefined },
    subtitle: { type: String, default: undefined }
  },
  setup(props) {
    const studio = useAiStudio();

    return () => {
      const runtimeConfig: Partial<CoreAgentRuntimeConfig> = {
        apiKey: studio.value.schema.providerConfig.apiKey,
        baseUrl: studio.value.schema.providerConfig.baseUrl,
        chatModel: studio.value.schema.providerConfig.chatModel,
        imageModel: studio.value.schema.providerConfig.imageModel
      };

      return h(AgentConversationWorkspace, {
        theme: studio.value.schema.theme.mode,
        title: props.title ?? "Agent Conversation",
        subtitle: props.subtitle ?? "Use the composer below to chat or execute an image workflow.",
        initialMode: studio.value.schema.workspace === "image" ? "image" : "chat",
        config: runtimeConfig
      });
    };
  }
});

export const AiStudioDevtools = defineComponent({
  name: "AiStudioDevtools",
  props: {
    enabled: { type: Boolean, default: undefined }
  },
  setup(props) {
    const studio = useAiStudio();
    const isDev = ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false);

    return () => {
      if (!(props.enabled ?? isDev)) {
        return null;
      }

      return h("aside", { class: "fixed bottom-4 right-4 z-50 w-[360px] overflow-hidden rounded-2xl border border-composer-chipBorder bg-composer-input shadow-2xl" }, [
        h("div", { class: "border-b border-composer-chipBorder px-4 py-3 text-sm font-semibold text-composer-text" }, "AI Studio DevTools"),
        h("pre", { class: "max-h-[360px] overflow-auto p-4 text-xs leading-6 text-composer-muted" }, JSON.stringify(createDevtoolsSnapshot(studio.value.workspace), null, 2))
      ]);
    };
  }
});

export function createVueAdapter(options: VueAdapterOptions = {}) {
  return {
    componentName: options.componentName ?? "AiComposer",
    components: {
      AiComposer,
      ConversationView,
      WorkflowTimeline,
      AgentConversationWorkspace,
      AiStudioProvider,
      AiStudioWorkspace,
      AiStudioDevtools
    }
  };
}

export { createAiStudio } from "@company/ai-composer-core";
export type { AiStudio, AiStudioConfig } from "@company/ai-composer-core";
