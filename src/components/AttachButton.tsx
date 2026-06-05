import type { CSSProperties, ReactNode } from "react";
import { useId, useRef } from "react";

interface AttachButtonProps {
  accept?: string[];
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  label?: string;
  children?: ReactNode;
  onFilesSelected: (files: File[]) => void;
}

export function AttachButton({
  accept,
  disabled = false,
  className,
  style,
  label = "Attach",
  children,
  onFilesSelected
}: AttachButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  return (
    <>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        multiple
        hidden
        disabled={disabled}
        accept={accept?.join(",")}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) {
            onFilesSelected(files);
          }
          event.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        className={
          className ??
          "rounded-lg border border-composer-chipBorder bg-composer-chip px-4 py-2 text-sm font-medium text-composer-text transition hover:border-composer-brand disabled:cursor-not-allowed disabled:opacity-50"
        }
        style={style}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        {children ?? label}
      </button>
    </>
  );
}
