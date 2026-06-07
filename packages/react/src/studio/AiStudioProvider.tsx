import { createContext, useContext, useState, type PropsWithChildren } from "react";
import { createAiStudio, type AiStudio, type AiStudioConfig } from "@company/ai-composer-core";

const AiStudioContext = createContext<AiStudio | null>(null);

export interface AiStudioProviderProps extends PropsWithChildren {
  studio?: AiStudio;
  config?: AiStudioConfig;
}

export function AiStudioProvider({ children, studio, config }: AiStudioProviderProps) {
  const [instance] = useState<AiStudio>(() => studio ?? createAiStudio(config));

  return <AiStudioContext.Provider value={instance}>{children}</AiStudioContext.Provider>;
}

export function useAiStudio(): AiStudio {
  const studio = useContext(AiStudioContext);

  if (!studio) {
    throw new Error("useAiStudio must be used inside AiStudioProvider.");
  }

  return studio;
}
