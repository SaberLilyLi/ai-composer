import { SendButton } from "./SendButton";
import { StopButton } from "./StopButton";

interface ComposerActionsProps {
  canSend: boolean;
  canStop: boolean;
  onSend: () => void;
  onStop: () => void;
}

const ACTION_LABELS = {
  agent: "Agent \u6a21\u5f0f",
  auto: "\u81ea\u52a8",
  skill: "\u4f7f\u7528\u6280\u80fd"
};

export function ComposerActions({ canSend, canStop, onSend, onStop }: ComposerActionsProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <button
          type="button"
          className="h-9 rounded-[18px] border border-composer-chipBorder bg-composer-chip px-3.5 text-sm font-medium text-composer-accent transition-colors duration-200 hover:bg-composer-elevated"
        >
          {ACTION_LABELS.agent}
        </button>
        <button
          type="button"
          className="h-9 rounded-[18px] border border-composer-chipBorder bg-composer-chip px-3.5 text-sm font-medium text-composer-text transition-colors duration-200 hover:bg-composer-elevated"
        >
          {ACTION_LABELS.auto}
        </button>
        <button
          type="button"
          className="h-9 rounded-[18px] border border-composer-chipBorder bg-composer-chip px-3.5 text-sm font-medium text-composer-text transition-colors duration-200 hover:bg-composer-elevated"
        >
          {ACTION_LABELS.skill}
        </button>
        <button
          type="button"
          aria-label="Mention"
          className="flex h-9 w-9 items-center justify-center rounded-[18px] border border-composer-chipBorder bg-composer-chip text-sm font-semibold text-composer-text transition-colors duration-200 hover:bg-composer-elevated"
        >
          @
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canStop ? <StopButton disabled={!canStop} onClick={onStop} /> : <SendButton disabled={!canSend} onClick={onSend} />}
      </div>
    </div>
  );
}
