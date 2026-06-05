import type { ComposerPhase } from "../core/types";

interface ComposerStatusSlotProps {
  phase: ComposerPhase;
}

export function ComposerStatusSlot({ phase }: ComposerStatusSlotProps) {
  return <div className="hidden text-sm text-composer-muted md:block">{phase === "generating" ? "Generating..." : "Ready"}</div>;
}
