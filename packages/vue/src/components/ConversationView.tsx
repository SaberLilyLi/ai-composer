import { defineComponent, h, type PropType } from "vue";
import type { Attachment, Message } from "@company/ai-composer-shared";

export interface VueConversationViewProps {
  messages: Message[];
  emptyText?: string;
}

function isImageAttachment(attachment: Attachment): boolean {
  return attachment.type === "image" || attachment.mimeType?.startsWith("image/") === true;
}

function renderInlineMarkdown(text: string) {
  return text
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return h("code", { key: `${part}-${index}`, class: "rounded bg-composer-chip px-1.5 py-0.5 text-[0.92em] text-composer-text" }, part.slice(1, -1));
      }

      if (part.startsWith("**") && part.endsWith("**")) {
        return h("strong", { key: `${part}-${index}`, class: "font-semibold text-composer-text" }, part.slice(2, -2));
      }

      return h("span", { key: `${part}-${index}` }, part);
    });
}

function renderMarkdownBlock(content: string) {
  const blocks = content.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  if (blocks.length === 0) {
    return null;
  }

  return h(
    "div",
    { class: "space-y-3 whitespace-normal text-[15px] leading-7" },
    blocks.map((block, blockIndex) => {
      const lines = block.split("\n");
      const listLines = lines.filter((line) => /^[-*]\s+/.test(line.trim()));

      if (listLines.length === lines.length) {
        return h(
          "ul",
          { key: `list-${blockIndex}`, class: "list-disc space-y-1 pl-5" },
          listLines.map((line, lineIndex) => h("li", { key: `${line}-${lineIndex}` }, renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))))
        );
      }

      return h("p", { key: `paragraph-${blockIndex}`, class: "whitespace-pre-wrap" }, renderInlineMarkdown(block));
    })
  );
}

function renderAttachments(attachments: Attachment[]) {
  const imageAttachments = attachments.filter(isImageAttachment);
  const fileAttachments = attachments.filter((attachment) => !isImageAttachment(attachment));

  if (attachments.length === 0) {
    return null;
  }

  return h("div", { class: "mt-4 space-y-3" }, [
    imageAttachments.length > 0
      ? h(
          "div",
          { class: "grid grid-cols-2 gap-3" },
          imageAttachments.map((attachment) =>
            h("img", {
              key: attachment.id,
              src: attachment.url,
              alt: attachment.name ?? "Image attachment",
              title: attachment.name ?? "Image attachment",
              class: "aspect-square w-full rounded-[18px] border border-composer-softBorder object-cover"
            })
          )
        )
      : null,
    fileAttachments.length > 0
      ? h(
          "div",
          { class: "flex flex-wrap gap-2" },
          fileAttachments.map((attachment) =>
            h(
              "div",
              {
                key: attachment.id,
                class: "flex max-w-[220px] items-center gap-2 rounded-xl border border-composer-chipBorder bg-composer-input px-2.5 py-2"
              },
              [
                h("div", { class: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-composer-chip text-[10px] font-semibold text-composer-muted" }, "FILE"),
                h("div", { class: "min-w-0" }, [
                  h("div", { class: "truncate text-xs font-medium text-composer-text" }, attachment.name ?? "Attachment"),
                  attachment.mimeType ? h("div", { class: "truncate text-[11px] text-composer-muted" }, attachment.mimeType) : null
                ])
              ]
            )
          )
        )
      : null
  ]);
}

export const ConversationView = defineComponent({
  name: "ConversationView",
  props: {
    messages: { type: Array as PropType<Message[]>, default: () => [] },
    emptyText: { type: String, default: "No messages yet." }
  },
  setup(props) {
    return () => {
      if (props.messages.length === 0) {
        return h("div", { class: "mx-auto max-w-[760px] rounded-2xl border border-composer-chipBorder bg-composer-chip px-4 py-3 text-center text-sm text-composer-muted" }, props.emptyText);
      }

      return h(
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
                  ].join(" ")
                },
                [
                  !isUser && !isSystem
                    ? h("div", { class: "mb-2 flex items-center gap-2 text-xs text-composer-muted" }, [
                        h("span", { class: "font-medium text-composer-text" }, "Assistant"),
                        message.status === "streaming" ? h("span", "Streaming") : null,
                        message.status === "error" ? h("span", { class: "text-composer-danger" }, "Error") : null,
                        message.status === "success" ? h("span", "Success") : null
                      ])
                    : null,
                  renderMarkdownBlock(message.content),
                  renderAttachments(message.attachments ?? [])
                ]
              ),
              isUser ? h("div", { class: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-composer-brand text-xs font-semibold text-composer-sendText" }, "You") : null
            ]
          );
        })
      );
    };
  }
});
