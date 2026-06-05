import { useEffect, useState } from "react";
import type { ComposerAttachment } from "../core/types";
import { AttachButton } from "./AttachButton";

interface ComposerImageTrayProps {
  accept?: string[];
  attachments: ComposerAttachment[];
  disabled?: boolean;
  onAttach: (files: File[]) => void;
  onRemove: (id: string) => void;
}

const THUMB_WIDTH = 48;
const COLLAPSED_STEP = 3;
const EXPANDED_STEP = 42;

function isImageAttachment(attachment: ComposerAttachment): boolean {
  return attachment.type.startsWith("image/") || Boolean(attachment.previewUrl);
}

function renderFallbackLabel(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 2).toUpperCase() : "AI";
}

function getCollapsedTransform(index: number, isHovered: boolean): string {
  const y = [0, 3, -2, 2, -3][index % 5];
  const rotate = [-8, -3, 4, -5, 6][index % 5];
  return `translateX(${index * COLLAPSED_STEP}px) translateY(${y}px) rotate(${rotate}deg) scale(${isHovered ? 1.2 : 1})`;
}

function getExpandedTransform(index: number, isHovered: boolean): string {
  const y = index % 2 === 0 ? 0 : 3;
  const rotate = [-4, -2, 2, -2, 3][index % 5];
  return `translateX(${index * EXPANDED_STEP}px) translateY(${y}px) rotate(${rotate}deg) scale(${isHovered ? 1.2 : 1})`;
}

export function ComposerImageTray({
  accept,
  attachments,
  disabled = false,
  onAttach,
  onRemove
}: ComposerImageTrayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredAttachmentId, setHoveredAttachmentId] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<ComposerAttachment | null>(null);
  const imageAttachments = attachments.filter(isImageAttachment);
  const hasImages = imageAttachments.length > 0;
  const collapsedWidth = hasImages
    ? THUMB_WIDTH + Math.max(0, imageAttachments.length - 1) * COLLAPSED_STEP + 26
    : 38;
  const expandedWidth = hasImages
    ? THUMB_WIDTH + Math.max(0, imageAttachments.length - 1) * EXPANDED_STEP + 8
    : 38;
  const trayWidth = isExpanded ? expandedWidth : collapsedWidth;
  const stackWidth = hasImages
    ? THUMB_WIDTH + Math.max(0, imageAttachments.length - 1) * COLLAPSED_STEP
    : 0;
  const addButtonLeft = hasImages ? Math.max(24, stackWidth - 14) : 0;

  useEffect(() => {
    if (!previewAttachment) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewAttachment(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewAttachment]);

  return (
    <>
      <div
        className="relative min-h-[66px] shrink-0 pt-1 transition-[width] duration-200 ease-out"
        style={{
          width: trayWidth
        }}
      >
        <div className="relative h-[64px]">
          {hasImages ? (
            <div
              className="absolute left-0 top-0 h-[64px]"
              onMouseEnter={() => setIsExpanded(true)}
              onMouseLeave={() => {
                setIsExpanded(false);
                setHoveredAttachmentId(null);
              }}
              style={{
                width: trayWidth
              }}
            >
              {imageAttachments.map((attachment, index) => {
                const isHovered = hoveredAttachmentId === attachment.id;

                return (
                  <div
                    key={attachment.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Preview ${attachment.name}`}
                    className="group/image-thumb absolute left-0 top-0 h-14 w-12 cursor-zoom-in overflow-visible rounded-lg transition-transform duration-200 ease-out"
                    style={{
                      transform: isExpanded
                        ? getExpandedTransform(index, isHovered)
                        : getCollapsedTransform(index, isHovered),
                      zIndex: isHovered ? imageAttachments.length + 2 : isExpanded ? index + 1 : imageAttachments.length - index
                    }}
                    onMouseEnter={() => setHoveredAttachmentId(attachment.id)}
                    onMouseLeave={() => setHoveredAttachmentId(null)}
                    onClick={() => setPreviewAttachment(attachment)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setPreviewAttachment(attachment);
                      }
                    }}
                  >
                    <div className="absolute -top-7 left-1/2 max-w-[160px] -translate-x-1/2 whitespace-nowrap rounded-md border border-composer-border bg-composer-input px-2 py-1 text-[11px] font-medium text-composer-text opacity-0 shadow-tile transition-opacity duration-150 group-hover/image-thumb:opacity-100">
                      {attachment.name}
                    </div>

                    <div className="h-full w-full overflow-hidden rounded-lg border border-composer-border bg-composer-elevated shadow-tile">
                      {attachment.previewUrl ? (
                        <img
                          src={attachment.previewUrl}
                          alt={attachment.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-composer-chip text-[11px] font-semibold text-composer-text">
                          {renderFallbackLabel(attachment.name)}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${attachment.name}`}
                      className="absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-composer-shell text-[10px] font-semibold text-composer-text opacity-0 shadow-tile transition hover:scale-105 group-hover/image-thumb:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(attachment.id);
                      }}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          <AttachButton
            accept={accept}
            disabled={disabled}
            label="Add image"
            className="absolute flex h-7 w-7 items-center justify-center rounded-full border border-composer-uploadActionBorder bg-composer-uploadAction text-lg font-light leading-none text-composer-muted shadow-tile transition-[filter,color,transform,left] duration-200 hover:brightness-110 hover:text-composer-text disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              left: addButtonLeft,
              top: hasImages ? 34 : 12
            }}
            onFilesSelected={onAttach}
          >
            +
          </AttachButton>
        </div>
      </div>

      {previewAttachment ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/62 px-6 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${previewAttachment.name}`}
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="relative max-h-full max-w-4xl rounded-[18px] border border-composer-border bg-composer-input p-3 shadow-composer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="min-w-0 truncate text-sm font-medium text-composer-text">
                {previewAttachment.name}
              </div>
              <button
                type="button"
                aria-label="Close preview"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-composer-uploadActionBorder bg-composer-uploadAction text-sm font-semibold text-composer-text transition hover:brightness-110"
                onClick={() => setPreviewAttachment(null)}
              >
                x
              </button>
            </div>

            {previewAttachment.previewUrl ? (
              <img
                src={previewAttachment.previewUrl}
                alt={previewAttachment.name}
                className="max-h-[72vh] max-w-[82vw] rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-[320px] w-[480px] max-w-[82vw] items-center justify-center rounded-xl bg-composer-chip text-4xl font-semibold text-composer-text">
                {renderFallbackLabel(previewAttachment.name)}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
