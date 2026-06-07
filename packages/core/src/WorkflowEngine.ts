import type { WorkflowExecutionResult, WorkflowStep, WorkflowStepType } from "@company/ai-composer-shared";
import type { AgentProvider, ChatProvider, ImageProvider, VideoProvider } from "@company/ai-composer-providers";

export interface WorkflowEngineProviders {
  chat?: ChatProvider;
  image?: ImageProvider;
  video?: VideoProvider;
  agent?: AgentProvider;
  getProviderForStep?: (type: WorkflowStepType) => ChatProvider | ImageProvider | VideoProvider | AgentProvider | undefined;
}

export interface WorkflowEngineContext {
  signal?: AbortSignal;
  attachments?: string[];
  imageOptions?: {
    count?: number;
    resolution?: string;
    size?: string;
  };
  onStepStart?: (step: WorkflowStep) => void;
  onStepSuccess?: (step: WorkflowStep) => void;
  onStepError?: (step: WorkflowStep, error: unknown) => void;
}

export class WorkflowEngine {
  constructor(private readonly providers: WorkflowEngineProviders = {}) {}

  async execute(steps: WorkflowStep[], context: WorkflowEngineContext = {}): Promise<WorkflowExecutionResult> {
    const nextSteps: WorkflowStep[] = [];

    for (const step of steps) {
      if (context.signal?.aborted) {
        throw new Error("Workflow execution aborted.");
      }

      const runningStep: WorkflowStep = { ...step, status: "running", startedAt: Date.now(), error: undefined };
      nextSteps.push(runningStep);
      context.onStepStart?.(runningStep);

      try {
        const { output, provider } = await this.runStep(runningStep.type, runningStep.prompt ?? "", steps, context);
        runningStep.status = "success";
        runningStep.output = output;
        runningStep.provider = provider;
        runningStep.completedAt = Date.now();
        context.onStepSuccess?.(runningStep);
      } catch (error) {
        runningStep.status = "error";
        runningStep.error = error instanceof Error ? error.message : "Unknown workflow error";
        runningStep.output = runningStep.error;
        runningStep.completedAt = Date.now();
        context.onStepError?.(runningStep, error);

        if (context.signal?.aborted) {
          throw error;
        }
      }
    }

    return {
      steps: nextSteps,
      finalOutput: nextSteps[nextSteps.length - 1]?.output
    };
  }

  private async runStep(type: WorkflowStepType, prompt: string, steps: WorkflowStep[], context: WorkflowEngineContext) {
    const matchedProvider = this.providers.getProviderForStep?.(type);

    switch (type) {
      case "image_generate": {
        const provider = requireImageProvider(matchedProvider ?? this.providers.image, type);
        const output = await runImageGeneration(provider, {
          prompt,
          attachments: context.attachments,
          signal: context.signal,
          imageOptions: context.imageOptions
        });
        return { output, provider: getProviderName(provider, output.model) };
      }
      case "image_edit":
      case "image_replace": {
        const provider = requireImageProvider(matchedProvider ?? this.providers.image, type);
        const output = await runImageEdit(provider, {
          prompt,
          attachments: context.attachments ?? [],
          signal: context.signal,
          imageOptions: context.imageOptions
        });

        return { output, provider: getProviderName(provider, output.model) };
      }
      case "video_generate":
      case "image_to_video":
        if (!this.providers.video) {
          throw new Error(`No provider is registered for workflow step "${type}".`);
        }

        return {
          output: await this.providers.video.generateVideo({ prompt, signal: context.signal }),
          provider: "video"
        };
      case "agent_task":
        if (!this.providers.agent) {
          throw new Error(`No provider is registered for workflow step "${type}".`);
        }

        const plan = await this.providers.agent.plan({ goal: prompt, signal: context.signal });
        return {
          output: await this.providers.agent.execute({ steps: plan.steps.length > 0 ? plan.steps : steps, signal: context.signal }),
          provider: plan.model
        };
      case "chat":
      default: {
        const provider = requireChatProvider(matchedProvider ?? this.providers.chat, type);
        const output = await provider.chat({
          signal: context.signal,
          messages: [
            {
              id: `message-${Date.now()}`,
              role: "user",
              content: prompt,
              createdAt: Date.now()
            }
          ]
        });
        return { output, provider: getProviderName(provider, output.model) };
      }
    }
  }
}

function requireChatProvider(provider: unknown, type: WorkflowStepType): ChatProvider {
  if (provider && typeof (provider as ChatProvider).chat === "function") {
    return provider as ChatProvider;
  }

  throw new Error(`No provider is registered for workflow step "${type}".`);
}

function requireImageProvider(provider: unknown, type: WorkflowStepType): ImageProvider {
  if (provider && typeof (provider as ImageProvider).generateImage === "function") {
    return provider as ImageProvider;
  }

  throw new Error(`No provider is registered for workflow step "${type}".`);
}

function getProviderName(provider: { getCapability?: () => { provider: string } }, fallback: string): string {
  return provider.getCapability?.().provider ?? fallback;
}

async function runImageGeneration(
  provider: ImageProvider,
  input: {
    prompt: string;
    attachments?: string[];
    signal?: AbortSignal;
    imageOptions?: WorkflowEngineContext["imageOptions"];
  }
) {
  const configurableProvider = provider as ImageProvider & {
    generateWithOptions?: (input: {
      prompt: string;
      attachments?: string[];
      signal?: AbortSignal;
      count?: number;
      resolution?: string;
      size?: string;
    }) => Promise<{ images: string[]; model: string }>;
  };

  if (configurableProvider.generateWithOptions) {
    return configurableProvider.generateWithOptions({
      prompt: input.prompt,
      attachments: input.attachments,
      signal: input.signal,
      count: input.imageOptions?.count,
      resolution: input.imageOptions?.resolution,
      size: input.imageOptions?.size
    });
  }

  return provider.generateImage({
    prompt: input.prompt,
    attachments: input.attachments,
    signal: input.signal
  });
}

async function runImageEdit(
  provider: ImageProvider,
  input: {
    prompt: string;
    attachments: string[];
    signal?: AbortSignal;
    imageOptions?: WorkflowEngineContext["imageOptions"];
  }
) {
  const configurableProvider = provider as ImageProvider & {
    generateWithOptions?: (input: {
      prompt: string;
      attachments?: string[];
      signal?: AbortSignal;
      count?: number;
      resolution?: string;
      size?: string;
    }) => Promise<{ images: string[]; model: string }>;
  };

  if (provider.editImage) {
    return provider.editImage({
      prompt: input.prompt,
      attachments: input.attachments,
      signal: input.signal
    });
  }

  if (configurableProvider.generateWithOptions) {
    return configurableProvider.generateWithOptions({
      prompt: input.prompt,
      attachments: input.attachments,
      signal: input.signal,
      count: input.imageOptions?.count,
      resolution: input.imageOptions?.resolution,
      size: input.imageOptions?.size
    });
  }

  return provider.generateImage({
    prompt: input.prompt,
    attachments: input.attachments,
    signal: input.signal
  });
}
