import type { ReactNode } from "react";
import { SendButton } from "./SendButton";
import { StopButton } from "./StopButton";
import type { ComposerActionOption } from "../core/types";

interface ComposerActionsProps {
  canSend: boolean;
  canStop: boolean;
  showStopButton?: boolean;
  showActionOptions?: boolean;
  actionHint?: ReactNode;
  actionOptions?: ComposerActionOption[];
  onActionOptionChange?: (id: string, value: string) => void;
  onSend: () => void;
  onStop: () => void;
}

const DEFAULT_ACTION_OPTIONS: ComposerActionOption[] = [
  {
    id: "model",
    label: "\u6a21\u578b",
    value: "qwen",
    options: [
      { label: "Qwen", value: "qwen" }
    ]
  },
  {
    id: "reasoning-speed",
    label: "\u63a8\u7406\u901f\u5ea6",
    value: "balanced",
    options: [
      { label: "\u5feb", value: "fast" },
      { label: "\u5747\u8861", value: "balanced" },
      { label: "\u6df1\u5ea6", value: "deep" }
    ]
  }
];

export function ComposerActions({
  canSend,
  canStop,
  showStopButton = false,
  showActionOptions = false,
  actionHint,
  actionOptions,
  onActionOptionChange,
  onSend,
  onStop
}: ComposerActionsProps) {
  const visibleActionOptions = actionOptions && actionOptions.length > 0 ? actionOptions : DEFAULT_ACTION_OPTIONS;

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {showActionOptions ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {visibleActionOptions.map((actionOption) => {
            return (
              <label
                key={actionOption.id}
                className="flex items-center gap-2 rounded-[18px] border border-composer-chipBorder bg-composer-chip px-3 py-1.5 text-sm text-composer-text"
              >
                <span className="text-sm font-medium text-composer-muted">{actionOption.label}</span>
                <select
                  aria-label={actionOption.label}
                  value={actionOption.value}
                  className="min-w-[112px] bg-transparent text-sm font-medium text-composer-text outline-none"
                  onChange={(event) => onActionOptionChange?.(actionOption.id, event.target.value)}
                >
                  {actionOption.options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-composer-bg text-composer-text">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      ) : (
        <div />
      )}
      <div className="flex shrink-0 items-center gap-3">
        {actionHint ? <div className="max-w-[220px] truncate text-sm text-composer-muted">{actionHint}</div> : null}
        {showStopButton && canStop ? (
          <StopButton disabled={!canStop} onClick={onStop} />
        ) : (
          <SendButton disabled={!canSend} onClick={onSend} />
        )}
      </div>
    </div>
  );
}
