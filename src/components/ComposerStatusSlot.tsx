import type { ComposerPhase } from "../core/types";

interface ComposerStatusSlotProps {
  phase: ComposerPhase;
}

export function ComposerStatusSlot({ phase }: ComposerStatusSlotProps) {
  return <div className="sr-only">{phase === "generating" ? "Generating..." : "Ready"}</div>;
}
