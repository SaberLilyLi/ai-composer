import type { ComposerPhase } from "../core/types";

interface ComposerStatusSlotProps {
  phase: ComposerPhase;
  showStatusText?: boolean;
  statusText?: string;
  statusTextMap?: Partial<Record<ComposerPhase, string>>;
}

const DEFAULT_STATUS_TEXT: Record<ComposerPhase, string> = {
  idle: "Ready",
  generating: "Generating..."
};

export function ComposerStatusSlot({ phase, showStatusText = false, statusText, statusTextMap }: ComposerStatusSlotProps) {
  const label = statusText ?? statusTextMap?.[phase] ?? DEFAULT_STATUS_TEXT[phase] ?? phase;

  return <div className={showStatusText ? "text-xs text-composer-muted" : "sr-only"}>{label}</div>;
}
