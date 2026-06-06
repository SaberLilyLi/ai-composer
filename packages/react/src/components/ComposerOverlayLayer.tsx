import type { ComposerContextState } from "../core/types";
import { CommandPanel } from "./CommandPanel";
import { MentionPanel } from "./MentionPanel";

interface ComposerOverlayLayerProps {
  context: ComposerContextState;
  onSelect: (index: number) => void;
}

export function ComposerOverlayLayer({ context, onSelect }: ComposerOverlayLayerProps) {
  if (!context.isOpen || context.suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      {context.mode === "mention" ? (
        <MentionPanel
          items={context.suggestions}
          highlightedIndex={context.highlightedIndex}
          onSelect={onSelect}
        />
      ) : (
        <CommandPanel
          items={context.suggestions}
          highlightedIndex={context.highlightedIndex}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
