import type { Attachment, Message } from "../core/types";

export interface ConversationViewProps {
  messages: Message[];
}

function isImageAttachment(attachment: Attachment): boolean {
  return attachment.type === "image" || attachment.mimeType?.startsWith("image/") === true;
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${part}-${index}`} className="rounded bg-composer-chip px-1.5 py-0.5 text-[0.92em] text-composer-text">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-composer-text">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function MarkdownBlock({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 whitespace-normal text-[15px] leading-7">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n");
        const listLines = lines.filter((line) => /^[-*]\s+/.test(line.trim()));

        if (listLines.length === lines.length) {
          return (
            <ul key={`list-${blockIndex}`} className="list-disc space-y-1 pl-5">
              {listLines.map((line, lineIndex) => (
                <li key={`${line}-${lineIndex}`}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`paragraph-${blockIndex}`} className="whitespace-pre-wrap">
            {renderInlineMarkdown(block)}
          </p>
        );
      })}
    </div>
  );
}

function AttachmentGrid({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) {
    return null;
  }

  const imageAttachments = attachments.filter(isImageAttachment);
  const fileAttachments = attachments.filter((attachment) => !isImageAttachment(attachment));

  return (
    <div className="mt-4 space-y-3">
      {imageAttachments.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {imageAttachments.map((attachment) => (
            <img
              key={attachment.id}
              src={attachment.url}
              alt={attachment.name ?? "Image attachment"}
              className="aspect-square w-full rounded-[18px] border border-composer-softBorder object-cover"
            />
          ))}
        </div>
      ) : null}

      {fileAttachments.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {fileAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex max-w-[220px] items-center gap-2 rounded-xl border border-composer-chipBorder bg-composer-input px-2.5 py-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-composer-chip text-[10px] font-semibold text-composer-muted">
                FILE
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-composer-text">{attachment.name ?? "Attachment"}</div>
                {attachment.mimeType ? <div className="truncate text-[11px] text-composer-muted">{attachment.mimeType}</div> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ConversationView({ messages }: ConversationViewProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-7">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const isSystem = message.role === "system";

        return (
          <article
            key={message.id}
            className={[
              "flex gap-4",
              isUser ? "justify-end" : isSystem ? "justify-center" : "justify-start"
            ].join(" ")}
          >
            {!isUser && !isSystem ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-composer-elevated text-xs font-semibold text-composer-text">
                AI
              </div>
            ) : null}

            <div
              className={[
                "min-w-0",
                isUser
                  ? "max-w-[76%] rounded-[22px] bg-composer-elevated px-5 py-3 text-composer-text"
                  : isSystem
                    ? "max-w-[82%] rounded-full border border-composer-chipBorder bg-composer-chip px-4 py-2 text-center text-sm text-composer-muted"
                    : "flex-1 text-composer-text"
              ].join(" ")}
            >
              {!isUser && !isSystem ? (
                <div className="mb-2 flex items-center gap-2 text-xs text-composer-muted">
                  <span className="font-medium text-composer-text">Assistant</span>
                  {message.status === "streaming" ? <span>Streaming</span> : null}
                  {message.status === "error" ? <span className="text-composer-danger">Error</span> : null}
                  {message.status === "success" ? <span>Success</span> : null}
                </div>
              ) : null}

              <MarkdownBlock content={message.content} />
              <AttachmentGrid attachments={message.attachments ?? []} />
            </div>

            {isUser ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-composer-brand text-xs font-semibold text-composer-sendText">
                You
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
