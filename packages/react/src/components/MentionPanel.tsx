import type { ComposerContextItem } from "../core/types";

interface MentionPanelProps {
  items: ComposerContextItem[];
  highlightedIndex: number;
  onSelect: (index: number) => void;
}

export function MentionPanel({ items, highlightedIndex, onSelect }: MentionPanelProps) {
  return (
    <div className="w-full max-w-[420px] rounded-xl border border-composer-border bg-composer-surface p-2 shadow-lg">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={`flex w-full items-start justify-between rounded-lg px-3 py-2 text-left transition ${
            index === highlightedIndex ? "bg-composer-bg" : "hover:bg-composer-bg"
          }`}
          onClick={() => onSelect(index)}
        >
          <div>
            <div className="text-sm font-medium text-composer-text">{item.label}</div>
            {item.description ? <div className="mt-1 text-xs text-composer-muted">{item.description}</div> : null}
          </div>
          <div className="text-xs text-composer-muted">@{item.value}</div>
        </button>
      ))}
    </div>
  );
}
