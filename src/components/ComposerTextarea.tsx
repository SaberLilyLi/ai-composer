import type { KeyboardEvent } from "react";
import { useLayoutEffect, useRef } from "react";

interface ComposerTextareaProps {
  value: string;
  placeholder: string;
  disabled: boolean;
  autoFocus: boolean;
  minRows: number;
  maxRows: number;
  onChange: (value: string) => void;
  onCursorChange?: (cursorIndex: number) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => boolean;
  onSubmit: () => void;
}

export function ComposerTextarea({
  value,
  placeholder,
  disabled,
  autoFocus,
  minRows,
  maxRows,
  onChange,
  onCursorChange,
  onKeyDown,
  onSubmit
}: ComposerTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    element.style.height = "auto";
    const computedStyles = window.getComputedStyle(element);
    const parsedLineHeight = Number.parseFloat(computedStyles.lineHeight);
    const lineHeight = Number.isNaN(parsedLineHeight) ? 24 : parsedLineHeight;
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;
    const nextHeight = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight);

    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [maxRows, minRows, value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      rows={minRows}
      aria-label="AI Composer Input"
      className="w-full resize-none rounded-none border-0 bg-transparent p-0 text-base leading-7 text-composer-text outline-none transition placeholder:text-composer-muted"
      onChange={(event) => {
        onChange(event.target.value);
        onCursorChange?.(event.target.selectionStart ?? event.target.value.length);
      }}
      onClick={(event) => {
        onCursorChange?.(event.currentTarget.selectionStart ?? value.length);
      }}
      onKeyUp={(event) => {
        onCursorChange?.(event.currentTarget.selectionStart ?? value.length);
      }}
      onKeyDown={(event) => {
        const handled = onKeyDown?.(event) ?? false;
        if (handled) {
          return;
        }

        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault();
          onSubmit();
        }
      }}
    />
  );
}
