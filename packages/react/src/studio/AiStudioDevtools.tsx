import { createDevtoolsSnapshot } from "@company/ai-composer-core";
import { useAiStudio } from "./AiStudioProvider";

export interface AiStudioDevtoolsProps {
  enabled?: boolean;
}

export function AiStudioDevtools({ enabled }: AiStudioDevtoolsProps) {
  const studio = useAiStudio();
  const isDev = ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false);

  if (!(enabled ?? isDev)) {
    return null;
  }

  const snapshot = createDevtoolsSnapshot(studio.workspace);

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-[360px] overflow-hidden rounded-2xl border border-composer-chipBorder bg-composer-input shadow-2xl">
      <div className="border-b border-composer-chipBorder px-4 py-3 text-sm font-semibold text-composer-text">AI Studio DevTools</div>
      <pre className="max-h-[360px] overflow-auto p-4 text-xs leading-6 text-composer-muted">{JSON.stringify(snapshot, null, 2)}</pre>
    </aside>
  );
}
