import type { ComposerAttachment } from "../core/types";

interface AttachmentItemProps {
  attachment: ComposerAttachment;
  onRemove: (id: string) => void;
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentItem({ attachment, onRemove }: AttachmentItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-tile border border-composer-chipBorder bg-composer-chip px-3 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-composer-text">{attachment.name}</div>
        <div className="mt-1 text-xs text-composer-muted">
          {formatFileSize(attachment.size)}
          {attachment.type ? ` / ${attachment.type}` : ""}
        </div>
        {attachment.error ? <div className="mt-1 text-xs text-composer-danger">{attachment.error}</div> : null}
      </div>
      <button
        type="button"
        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-composer-danger transition hover:bg-composer-elevated"
        onClick={() => onRemove(attachment.id)}
      >
        Remove
      </button>
    </div>
  );
}
