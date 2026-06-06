import { defineComponent, h, type PropType } from "vue";
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

export function createVueAdapter(options: VueAdapterOptions = {}) {
  return {
    componentName: options.componentName ?? "AiComposer",
    components: {
      AiComposer,
      ConversationView,
      WorkflowTimeline
    }
  };
}
