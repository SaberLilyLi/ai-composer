export interface VueAdapterOptions {
  componentName?: string;
}

export function createVueAdapter(options: VueAdapterOptions = {}) {
  return {
    componentName: options.componentName ?? "AiComposer",
    mount() {
      throw new Error("Vue adapter scaffold only. Implementation will be added in a later step.");
    }
  };
}
