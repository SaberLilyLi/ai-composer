import type { ComposerAttachment } from "../core/types";
import { AttachmentItem } from "./AttachmentItem";

interface AttachmentListProps {
  attachments: ComposerAttachment[];
  onRemove: (id: string) => void;
}

export function AttachmentList({ attachments, onRemove }: AttachmentListProps) {
  const nonImageAttachments = attachments.filter((attachment) => {
    return !(attachment.type.startsWith("image/") || attachment.previewUrl);
  });

  if (nonImageAttachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-2">
      {nonImageAttachments.map((attachment) => (
        <AttachmentItem key={attachment.id} attachment={attachment} onRemove={onRemove} />
      ))}
    </div>
  );
}
