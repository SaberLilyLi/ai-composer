import { inject, type InjectionKey, type ShallowRef } from "vue";
import type { AiStudio } from "@company/ai-composer-core";

export type AiStudioContextValue = ShallowRef<AiStudio>;

export const AI_STUDIO_KEY: InjectionKey<AiStudioContextValue> = Symbol("ai-studio");

export function useAiStudio(): AiStudioContextValue {
  const studio = inject(AI_STUDIO_KEY, null);

  if (!studio) {
    throw new Error("useAiStudio must be used inside AiStudioProvider.");
  }

  return studio;
}
