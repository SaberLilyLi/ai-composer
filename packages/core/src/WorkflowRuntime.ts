import type { Message, WorkflowStep } from "@company/ai-composer-shared";
import { EventBus } from "./EventBus";
import { ConversationEngine } from "./ConversationEngine";
import { PromptParser } from "./PromptParser";
import { ProviderRegistry } from "./ProviderRegistry";
import { WorkflowEngine } from "./WorkflowEngine";
import { RuntimeEventBus } from "./events";

export type WorkflowRuntimeStatus = "idle" | "running" | "success" | "error" | "aborted";

export interface WorkflowRuntimeState {
  status: WorkflowRuntimeStatus;
  steps: WorkflowStep[];
  messages: Message[];
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface WorkflowRuntimeInput {
  prompt: string;
  attachments?: string[];
}

interface WorkflowRuntimeEvents {
  start: { state: WorkflowRuntimeState };
  stepStart: { step: WorkflowStep; state: WorkflowRuntimeState };
  stepSuccess: { step: WorkflowStep; state: WorkflowRuntimeState };
  stepError: { step: WorkflowStep; error: unknown; state: WorkflowRuntimeState };
  complete: { state: WorkflowRuntimeState };
  abort: { state: WorkflowRuntimeState };
}

export class WorkflowRuntime {
  readonly conversation = new ConversationEngine();
  readonly parser = new PromptParser();
  readonly providers = new ProviderRegistry();
  readonly runtimeEvents = new RuntimeEventBus();
  private readonly events = new EventBus<WorkflowRuntimeEvents>();
  private controller: AbortController | null = null;
  private lastInput: WorkflowRuntimeInput | null = null;
  private state: WorkflowRuntimeState = {
    status: "idle",
    steps: [],
    messages: []
  };

  getState(): WorkflowRuntimeState {
    return this.state;
  }

  onStart(handler: (payload: { state: WorkflowRuntimeState }) => void) {
    return this.events.on("start", handler);
  }

  onStepStart(handler: (payload: { step: WorkflowStep; state: WorkflowRuntimeState }) => void) {
    return this.events.on("stepStart", handler);
  }

  onStepSuccess(handler: (payload: { step: WorkflowStep; state: WorkflowRuntimeState }) => void) {
    return this.events.on("stepSuccess", handler);
  }

  onStepError(handler: (payload: { step: WorkflowStep; error: unknown; state: WorkflowRuntimeState }) => void) {
    return this.events.on("stepError", handler);
  }

  onComplete(handler: (payload: { state: WorkflowRuntimeState }) => void) {
    return this.events.on("complete", handler);
  }

  onAbort(handler: (payload: { state: WorkflowRuntimeState }) => void) {
    return this.events.on("abort", handler);
  }

  async runPrompt(prompt: string, options: { attachments?: string[] } = {}): Promise<{ messages: Message[]; steps: WorkflowStep[] }> {
    this.lastInput = { prompt, attachments: options.attachments ?? [] };
    this.controller = new AbortController();
    const controller = this.controller;
    const analyzedSteps = await this.analyzePrompt(prompt, controller.signal);
    const steps = analyzedSteps.map((step, index) => ({
      id: `step-${index + 1}`,
      type: step.type,
      title: `Step ${index + 1}`,
      prompt: step.prompt,
      status: "waiting" as const
    }));

    this.state = {
      status: "running",
      steps,
      messages: this.conversation.getMessages(),
      startedAt: Date.now()
    };
    this.events.emit("start", { state: this.state });
    this.runtimeEvents.emit("workflow:start", { state: this.state });

    try {
      const engine = new WorkflowEngine({
        ...this.providers.get(),
        getProviderForStep: (type) => this.providers.getProviderForStep(type)
      });
      const result = await engine.execute(steps, {
        signal: controller.signal,
        attachments: options.attachments,
        onStepStart: (step) => {
          this.updateStep(step);
          this.events.emit("stepStart", { step, state: this.state });
          this.runtimeEvents.emit("step:start", { step, state: this.state });
        },
        onStepSuccess: (step) => {
          this.updateStep(step);
          this.events.emit("stepSuccess", { step, state: this.state });
          this.runtimeEvents.emit("step:success", { step, state: this.state });
        },
        onStepError: (step, error) => {
          this.updateStep(step);
          this.events.emit("stepError", { step, error, state: this.state });
          this.runtimeEvents.emit("step:error", { step, error, state: this.state });
        }
      });

      if (controller.signal.aborted) {
        throw createAbortError();
      }

      this.conversation.addMessage({
        id: `user-${Date.now()}`,
        role: "user",
        content: prompt,
        createdAt: Date.now(),
        status: "success"
      });
      this.conversation.addMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: typeof result.finalOutput === "string" ? result.finalOutput : JSON.stringify(result.finalOutput ?? {}),
        createdAt: Date.now(),
        status: "success"
      });

      this.state = {
        ...this.state,
        status: result.steps.some((step) => step.status === "error") ? "error" : "success",
        steps: result.steps,
        messages: this.conversation.getMessages(),
        error: result.steps.find((step) => step.status === "error")?.error,
        completedAt: Date.now()
      };
      this.events.emit("complete", { state: this.state });
      this.runtimeEvents.emit("workflow:complete", { state: this.state });

      return {
        messages: this.conversation.getMessages(),
        steps: result.steps
      };
    } catch (error) {
      const runtimeError = error instanceof Error ? error : new Error("Workflow execution failed.");
      const isAborted = controller.signal.aborted || runtimeError.name === "AbortError";

      this.state = {
        ...this.state,
        status: isAborted ? "aborted" : "error",
        error: runtimeError.message,
        completedAt: Date.now()
      };

      if (isAborted) {
        this.events.emit("abort", { state: this.state });
      } else {
        this.events.emit("complete", { state: this.state });
        this.runtimeEvents.emit("workflow:error", { error: runtimeError, state: this.state });
      }

      throw runtimeError;
    } finally {
      if (this.controller === controller) {
        this.controller = null;
      }
    }
  }

  abort(): void {
    this.controller?.abort();
    this.state = {
      ...this.state,
      status: "aborted",
      completedAt: Date.now()
    };
    this.events.emit("abort", { state: this.state });
  }

  retryWorkflow(): Promise<{ messages: Message[]; steps: WorkflowStep[] }> {
    if (!this.lastInput) {
      throw new Error("No workflow is available to retry.");
    }

    return this.runPrompt(this.lastInput.prompt, { attachments: this.lastInput.attachments });
  }

  async retryStep(stepId: string): Promise<WorkflowStep> {
    const failedStep = this.state.steps.find((step) => step.id === stepId);

    if (!failedStep) {
      throw new Error(`Workflow step "${stepId}" was not found.`);
    }

    const engine = new WorkflowEngine({
      ...this.providers.get(),
      getProviderForStep: (type) => this.providers.getProviderForStep(type)
    });
    const result = await engine.execute([{ ...failedStep, status: "waiting", output: undefined, error: undefined }], {
      attachments: this.lastInput?.attachments,
      onStepStart: (step) => {
        this.updateStep(step);
        this.events.emit("stepStart", { step, state: this.state });
        this.runtimeEvents.emit("step:start", { step, state: this.state });
      },
      onStepSuccess: (step) => {
        this.updateStep(step);
        this.events.emit("stepSuccess", { step, state: this.state });
        this.runtimeEvents.emit("step:success", { step, state: this.state });
      },
      onStepError: (step, error) => {
        this.updateStep(step);
        this.events.emit("stepError", { step, error, state: this.state });
        this.runtimeEvents.emit("step:error", { step, error, state: this.state });
      }
    });
    const retriedStep = result.steps[0];

    if (!retriedStep) {
      throw new Error(`Workflow step "${stepId}" did not return a result.`);
    }

    this.updateStep(retriedStep);
    this.state = {
      ...this.state,
      status: this.state.steps.some((step) => step.status === "error") ? "error" : "success",
      completedAt: Date.now()
    };
    return retriedStep;
  }

  private async analyzePrompt(prompt: string, signal?: AbortSignal): Promise<Array<{ type: WorkflowStep["type"]; prompt: string }>> {
    const analyzer = this.providers.getProvider("workflowAnalyzer") ?? this.providers.getProvider("chat");

    if (analyzer?.analyzeWorkflow) {
      const result = await analyzer.analyzeWorkflow({ prompt, signal });
      return result.steps;
    }

    return this.parser.parse(prompt);
  }

  private updateStep(step: WorkflowStep): void {
    this.state = {
      ...this.state,
      steps: this.state.steps.map((item) => (item.id === step.id ? step : item))
    };
  }
}

function createAbortError(): Error {
  const error = new Error("Workflow execution aborted.");
  error.name = "AbortError";
  return error;
}
