import { defineComponent, provide, shallowRef, type PropType } from "vue";
import { createAiStudio, type AiStudio, type AiStudioConfig } from "@company/ai-composer-core";
import { AI_STUDIO_KEY } from "../composables/useAiStudio";

export interface AiStudioProviderProps {
  studio?: AiStudio;
  config?: AiStudioConfig;
}

export const AiStudioProvider = defineComponent({
  name: "AiStudioProvider",
  props: {
    studio: { type: Object as PropType<AiStudio>, default: undefined },
    config: { type: Object as PropType<AiStudioConfig>, default: undefined }
  },
  setup(props, { slots }) {
    const studio = shallowRef<AiStudio>(props.studio ?? createAiStudio(props.config));

    provide(AI_STUDIO_KEY, studio);

    return () => slots.default?.() ?? null;
  }
});
