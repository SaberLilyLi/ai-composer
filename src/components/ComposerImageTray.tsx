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
const ACTIVE_AREA_PADDING_X = 42;
const ACTIVE_AREA_PADDING_TOP = 52;
const ACTIVE_AREA_PADDING_BOTTOM = 36;

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

function getCardStyle(index: number, count: number, isExpanded: boolean, isHovered: boolean): CSSProperties {
  const angle = getAngle(index);
  const translateY = isHovered ? -16 : isExpanded ? -3 : 0;
  const scale = isHovered ? 1.2 : 1;

  return {
    position: "absolute",
    left: isExpanded ? getExpandLeft(index) : COLLAPSED_LEFT,
    top: COLLAPSED_TOP,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 4,
    overflow: "visible",
    background: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.86)",
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.24), 0 2px 6px rgba(0, 0, 0, 0.16)",
    transformOrigin: "center center",
    transform: `translateY(${translateY}px) rotate(${angle}deg) scale(${scale})`,
    transition:
      "left 0.45s cubic-bezier(.22, 1, .36, 1), top 0.45s cubic-bezier(.22, 1, .36, 1), transform 0.45s cubic-bezier(.22, 1, .36, 1), box-shadow 0.25s ease, opacity 0.25s ease",
    transitionDelay: isExpanded ? `${index * 35}ms` : `${(count - index) * 20}ms`,
    cursor: "pointer",
    zIndex: isHovered ? 120 : index + 1
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

function getRemoveStyle(isExpanded: boolean, isHovered: boolean): CSSProperties {
  return {
    position: "absolute",
    right: -10,
    top: -10,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "rgba(49, 58, 75, 0.72)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 140,
    opacity: isExpanded || isHovered ? 1 : 0,
    backdropFilter: "blur(6px)",
    cursor: "pointer",
    pointerEvents: isExpanded || isHovered ? "auto" : "none",
    transition: "opacity 0.18s ease, transform 0.18s ease",
    transform: isHovered ? "scale(1.08)" : "scale(1)"
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

function getNameBadgeStyle(isVisible: boolean): CSSProperties {
  return {
    position: "absolute",
    left: "50%",
    top: -28,
    zIndex: 10,
    width: "max-content",
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    borderRadius: 4,
    background: "rgba(2, 6, 23, 0.82)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 500,
    lineHeight: "16px",
    padding: "2px 6px",
    textAlign: "center",
    transform: "translateX(-50%)",
    opacity: isVisible ? 1 : 0,
    pointerEvents: "none",
    transition: "opacity 0.15s ease"
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
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
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

    return (
      x >= -ACTIVE_AREA_PADDING_X &&
      x <= expandedRight + ACTIVE_AREA_PADDING_X &&
      y >= -ACTIVE_AREA_PADDING_TOP &&
      y <= expandedBottom + ACTIVE_AREA_PADDING_BOTTOM
    );
  };

  const handleStackMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isExpanded && isInsideActiveArea(event.clientX, event.clientY)) {
      setIsExpanded(true);
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
            title={attachment.name}
            style={getCardStyle(index, visibleImages.length, isExpanded, hoveredImageId === attachment.id)}
            onMouseEnter={() => {
              setIsExpanded(true);
              setHoveredImageId(attachment.id);
            }}
            onMouseLeave={() => setHoveredImageId((currentId) => (currentId === attachment.id ? null : currentId))}
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
                title={attachment.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 4,
                  objectFit: "cover",
                  display: "block"
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded text-xs font-semibold text-slate-700">
                {renderFallbackLabel(attachment.name)}
              </div>
            )}
            <div style={getNameBadgeStyle(hoveredImageId === attachment.id)}>
              {attachment.name}
            </div>
            <button
              type="button"
              aria-label={`Remove ${attachment.name}`}
              data-testid="image-stack-remove"
              style={getRemoveStyle(isExpanded, hoveredImageId === attachment.id)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove(attachment.id);
              }}
            >
              x
            </button>
          </div>
        ))}

        {hasImages ? (
          <>
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
            className="relative rounded-[18px] border border-composer-border bg-composer-input p-3 shadow-composer"
            style={{
              width: "min(82vw, 1024px)",
              maxHeight: "calc(100vh - 64px)",
              overflow: "hidden"
            }}
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
                className="rounded-xl object-contain"
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "calc(100vh - 150px)",
                  width: "auto",
                  height: "auto",
                  margin: "0 auto"
                }}
              />
            ) : (
              <div className="flex h-[320px] w-full items-center justify-center rounded-xl bg-composer-chip text-4xl font-semibold text-composer-text">
                {renderFallbackLabel(previewAttachment.name)}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
