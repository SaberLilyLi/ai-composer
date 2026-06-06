import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComposerAttachment } from "../core/types";
import { AttachButton } from "./AttachButton";

interface ComposerImageTrayProps {
  accept?: string[];
  attachments: ComposerAttachment[];
  disabled?: boolean;
  onAttach: (files: File[]) => void;
  onRemove: (id: string) => void;
}

const ANGLE_LIST = [10, -8, 6, -5, 4, -3];
const COLLAPSED_LEFT = 24;
const COLLAPSED_TOP = 18;
const GAP = 68;
const CARD_WIDTH = 62;
const CARD_HEIGHT = 76;
const UPLOAD_BUTTON_SIZE = 41;

function isImageAttachment(attachment: ComposerAttachment): boolean {
  return attachment.type.startsWith("image/") || Boolean(attachment.previewUrl);
}

function renderFallbackLabel(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 2).toUpperCase() : "AI";
}

function getExpandLeft(index: number): number {
  return COLLAPSED_LEFT + index * GAP;
}

function getAngle(index: number): number {
  return ANGLE_LIST[index] ?? (index % 2 === 0 ? 4 : -4);
}

function getCardStyle(index: number, count: number, isExpanded: boolean): CSSProperties {
  const angle = getAngle(index);

  return {
    position: "absolute",
    left: isExpanded ? getExpandLeft(index) : COLLAPSED_LEFT,
    top: COLLAPSED_TOP,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 4,
    overflow: "hidden",
    background: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.86)",
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.24), 0 2px 6px rgba(0, 0, 0, 0.16)",
    transformOrigin: "center center",
    transform: isExpanded ? `translateY(-3px) rotate(${angle}deg)` : `translateY(0) rotate(${angle}deg)`,
    transition:
      "left 0.45s cubic-bezier(.22, 1, .36, 1), top 0.45s cubic-bezier(.22, 1, .36, 1), transform 0.45s cubic-bezier(.22, 1, .36, 1), box-shadow 0.25s ease, opacity 0.25s ease",
    transitionDelay: isExpanded ? `${index * 35}ms` : `${(count - index) * 20}ms`,
    cursor: "pointer",
    zIndex: index + 1
  };
}

function getUploadStyle(count: number, isExpanded: boolean): CSSProperties {
  const lastIndex = count - 1;
  const lastAngle = getAngle(lastIndex);
  const uploadAngle = -lastAngle;

  return {
    position: "absolute",
    left: isExpanded ? getExpandLeft(count) : 69,
    top: isExpanded ? COLLAPSED_TOP : 53,
    width: isExpanded ? CARD_WIDTH : UPLOAD_BUTTON_SIZE,
    height: isExpanded ? CARD_HEIGHT : UPLOAD_BUTTON_SIZE,
    borderRadius: isExpanded ? 4 : "50%",
    border: isExpanded ? "1px dashed rgba(148,163,184,0.35)" : "none",
    background: isExpanded ? "#2a3242" : "#4b5563",
    color: isExpanded ? "#8ea0c2" : "#fff",
    fontSize: isExpanded ? 34 : 24,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    transition:
      "left 0.45s cubic-bezier(.22, 1, .36, 1), top 0.45s cubic-bezier(.22, 1, .36, 1), width 0.38s cubic-bezier(.22, 1, .36, 1), height 0.38s cubic-bezier(.22, 1, .36, 1), border-radius 0.38s cubic-bezier(.22, 1, .36, 1), transform 0.45s cubic-bezier(.22, 1, .36, 1), background 0.25s ease, border 0.25s ease, color 0.25s ease",
    transitionDelay: isExpanded ? `${count * 35}ms` : "0ms",
    transform: isExpanded ? `translateY(-3px) rotate(${uploadAngle}deg)` : "rotate(0deg)"
  };
}

function getCloseStyle(count: number, isExpanded: boolean): CSSProperties {
  const lastIndex = count - 1;

  return {
    position: "absolute",
    left: isExpanded ? getExpandLeft(lastIndex) + 48 : 76,
    top: isExpanded ? 6 : 10,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#313a4b",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    opacity: isExpanded ? 1 : 0,
    cursor: "pointer",
    transition:
      "left 0.45s cubic-bezier(.22, 1, .36, 1), top 0.45s cubic-bezier(.22, 1, .36, 1), opacity 0.2s ease",
    transitionDelay: isExpanded ? `${lastIndex * 35}ms` : "0ms"
  };
}

function getEmptyUploadStyle(): CSSProperties {
  return {
    position: "absolute",
    left: COLLAPSED_LEFT,
    top: COLLAPSED_TOP,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 4,
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px dashed rgba(148, 163, 184, 0.38)",
    color: "#8ea0c2",
    fontSize: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(8deg)",
    cursor: "pointer",
    outline: "none",
    appearance: "none"
  };
}

export function ComposerImageTray({
  accept,
  attachments,
  disabled = false,
  onAttach,
  onRemove
}: ComposerImageTrayProps) {
  const stackRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<ComposerAttachment | null>(null);
  const imageAttachments = useMemo(() => attachments.filter(isImageAttachment), [attachments]);
  const visibleImages = useMemo(() => imageAttachments, [imageAttachments]);
  const hasImages = visibleImages.length > 0;

  useEffect(() => {
    if (!hasImages && isExpanded) {
      setIsExpanded(false);
    }
  }, [hasImages, isExpanded]);

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

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

    const handleDocumentMouseMove = (event: globalThis.MouseEvent) => {
      if (!isInsideActiveArea(event.clientX, event.clientY)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousemove", handleDocumentMouseMove);
    return () => document.removeEventListener("mousemove", handleDocumentMouseMove);
  }, [isExpanded, visibleImages.length]);

  const isInsideActiveArea = (clientX: number, clientY: number): boolean => {
    const stack = stackRef.current;

    if (!stack) {
      return false;
    }

    const rect = stack.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (!isExpanded) {
      return (
        x >= COLLAPSED_LEFT &&
        x <= COLLAPSED_LEFT + CARD_WIDTH &&
        y >= COLLAPSED_TOP &&
        y <= COLLAPSED_TOP + CARD_HEIGHT
      );
    }

    const expandedRight = getExpandLeft(visibleImages.length) + CARD_WIDTH;
    const expandedBottom = COLLAPSED_TOP + CARD_HEIGHT + 10;

    return x >= 0 && x <= expandedRight && y >= 0 && y <= expandedBottom;
  };

  const handleStackMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isExpanded && isInsideActiveArea(event.clientX, event.clientY)) {
      setIsExpanded(true);
    }
  };

  const handleRemoveFrontImage = () => {
    const frontImage = visibleImages[visibleImages.length - 1];

    if (frontImage) {
      onRemove(frontImage.id);
    }
  };

  return (
    <>
      <div
        ref={stackRef}
        data-testid="image-stack"
        className="absolute left-7 top-7 z-10 overflow-visible"
        style={{
          position: "absolute",
          width: isExpanded ? getExpandLeft(visibleImages.length) + CARD_WIDTH : 120,
          height: 120,
          userSelect: "none"
        }}
        onMouseMove={handleStackMouseMove}
      >
        {!hasImages ? (
          <AttachButton
            accept={accept}
            disabled={disabled}
            label="Add image"
            className=""
            style={getEmptyUploadStyle()}
            onFilesSelected={onAttach}
          >
            +
          </AttachButton>
        ) : null}

        {visibleImages.map((attachment, index) => (
          <div
            key={attachment.id}
            data-testid="image-stack-item"
            role="button"
            tabIndex={0}
            aria-label={`Preview ${attachment.name}`}
            style={getCardStyle(index, visibleImages.length, isExpanded)}
            onMouseEnter={() => setIsExpanded(true)}
            onClick={() => setPreviewAttachment(attachment)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setPreviewAttachment(attachment);
              }
            }}
          >
            {attachment.previewUrl ? (
              <img
                src={attachment.previewUrl}
                alt={attachment.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block"
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-700">
                {renderFallbackLabel(attachment.name)}
              </div>
            )}
          </div>
        ))}

        {hasImages ? (
          <>
            <button
              type="button"
              aria-label={`Remove ${visibleImages[0].name}`}
              data-testid="image-stack-remove"
              style={getCloseStyle(visibleImages.length, isExpanded)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleRemoveFrontImage();
              }}
            >
              x
            </button>

            <AttachButton
              accept={accept}
              disabled={disabled}
              label="Add image"
              testId="image-stack-upload"
              className=""
              style={getUploadStyle(visibleImages.length, isExpanded)}
              onFilesSelected={onAttach}
            >
              +
            </AttachButton>
          </>
        ) : null}
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
