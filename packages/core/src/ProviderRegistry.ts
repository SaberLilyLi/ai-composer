import type {
  AgentProvider,
  AvatarProvider,
  ChatProvider,
  ImageProvider,
  PromptOptimizerProvider,
  ProviderCapability,
  ProviderMetadata,
  VideoProvider,
  WorkflowAnalyzerProvider
} from "@company/ai-composer-providers";
import type { WorkflowStepType } from "@company/ai-composer-shared";

export interface ProviderRegistryState {
  chat?: ChatProvider;
  image?: ImageProvider;
  video?: VideoProvider;
  avatar?: AvatarProvider;
  agent?: AgentProvider;
  workflowAnalyzer?: WorkflowAnalyzerProvider;
  promptOptimizer?: PromptOptimizerProvider;
}

export type ProviderKind = keyof ProviderRegistryState;
export type ProviderByKind<TKey extends ProviderKind> = NonNullable<ProviderRegistryState[TKey]>;

export class ProviderRegistry {
  private state: ProviderRegistryState = {};

  register(registry: ProviderRegistryState): void {
    this.state = {
      ...this.state,
      ...registry
    };
  }

  get(): ProviderRegistryState {
    return this.state;
  }

  registerProvider<TKey extends ProviderKind>(kind: TKey, provider: ProviderByKind<TKey>): void {
    this.state = {
      ...this.state,
      [kind]: provider
    };

    if (kind === "chat") {
      const chatProvider = provider as ChatProvider;

      if (chatProvider.analyzeWorkflow) {
        this.state.workflowAnalyzer = chatProvider as ChatProvider & WorkflowAnalyzerProvider;
      }

      if (chatProvider.optimizePrompt) {
        this.state.promptOptimizer = chatProvider as ChatProvider & PromptOptimizerProvider;
      }
    }
  }

  removeProvider(kind: ProviderKind): boolean {
    if (!this.state[kind]) {
      return false;
    }

    const nextState = { ...this.state };
    delete nextState[kind];

    if (kind === "chat") {
      delete nextState.workflowAnalyzer;
      delete nextState.promptOptimizer;
    }

    this.state = nextState;
    return true;
  }

  getProvider<TKey extends ProviderKind>(kind: TKey): ProviderRegistryState[TKey] {
    return this.state[kind];
  }

  listProviders(): ProviderKind[] {
    return Object.keys(this.state).filter((kind) => {
      return Boolean(this.state[kind as ProviderKind]);
    }) as ProviderKind[];
  }

  listCapabilities(): ProviderCapability[] {
    const seen = new Set<string>();

    return this.listProviders()
      .map((kind) => {
        const provider = this.state[kind] as { getCapability?: () => ProviderCapability } | undefined;
        const capability = provider?.getCapability?.();
        return capability ? normalizeProviderCapability(capability) : undefined;
      })
      .filter((capability): capability is ProviderCapability => {
        if (!capability) {
          return false;
        }

        const key = `${capability.provider}:${capability.supports.join(",")}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });
  }

  getProviderMetadata(kind: ProviderKind): ProviderMetadata | undefined {
    const provider = this.state[kind] as { getMetadata?: () => ProviderMetadata } | undefined;
    return provider?.getMetadata?.();
  }

  listProviderMetadata(): ProviderMetadata[] {
    const seen = new Set<string>();

    return this.listProviders()
      .map((kind) => this.getProviderMetadata(kind))
      .filter((metadata): metadata is ProviderMetadata => {
        if (!metadata || seen.has(metadata.id)) {
          return false;
        }

        seen.add(metadata.id);
        return true;
      });
  }

  getProviderForStep(type: WorkflowStepType): ChatProvider | ImageProvider | VideoProvider | AgentProvider | undefined {
    if (this.state.image?.getCapability?.().supports.includes(type)) {
      return this.state.image;
    }

    if (this.state.chat?.getCapability?.().supports.includes(type)) {
      return this.state.chat;
    }

    if (type === "video_generate" || type === "image_to_video") {
      return this.state.video;
    }

    if (type === "agent_task") {
      return this.state.agent;
    }

    return undefined;
  }
}

function normalizeProviderCapability(capability: ProviderCapability): ProviderCapability {
  return {
    inputTypes: inferInputTypes(capability.supports),
    outputTypes: inferOutputTypes(capability.supports),
    streaming: false,
    batch: false,
    configurable: false,
    ...capability
  };
}

function inferInputTypes(supports: WorkflowStepType[]): ProviderCapability["inputTypes"] {
  if (supports.some((type) => type.includes("image"))) {
    return ["text", "image"];
  }

  if (supports.some((type) => type.includes("video"))) {
    return ["text", "video"];
  }

  return ["text"];
}

function inferOutputTypes(supports: WorkflowStepType[]): ProviderCapability["outputTypes"] {
  if (supports.some((type) => type.includes("image"))) {
    return ["image"];
  }

  if (supports.some((type) => type.includes("video"))) {
    return ["video"];
  }

  return ["text"];
}
