import { useMemo, useRef, useState } from "react";
import { ConversationRuntime, WorkflowRuntime } from "@company/ai-composer-core";
import { GPTImageProvider, GPTProvider, MockChatProvider, MockImageProvider, ProviderError } from "@company/ai-composer-providers";

type RuntimeMode = "chat" | "optimize" | "workflow" | "image" | "cancel" | "retry";

function getErrorMessage(error: unknown): string {
  if (error instanceof ProviderError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Runtime request failed.";
}

function useRuntimeProviders() {
  return useMemo(() => {
    const env = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {});
    const apiKey = env.VITE_GPT_API_KEY ?? env.VITE_AGENT_API_KEY ?? "";
    const baseUrl = env.VITE_GPT_BASE_URL ?? env.VITE_AGENT_BASE_URL ?? "https://api.openai.com/v1";
    const chatModel = env.VITE_GPT_CHAT_MODEL ?? env.VITE_AGENT_CHAT_MODEL ?? "gpt-5.5";
    const imageModel = env.VITE_GPT_IMAGE_MODEL ?? env.VITE_AGENT_IMAGE_MODEL ?? "gpt-image-2";
    const hasRealConfig = apiKey.length > 0;
    const chatProvider = hasRealConfig
      ? new GPTProvider({
        apiKey,
        baseUrl,
        model: chatModel,
        timeout: 60000,
        maxRetries: 1
      })
      : new MockChatProvider();
    const imageProvider = hasRealConfig
      ? new GPTImageProvider({
        apiKey,
        baseUrl,
        model: imageModel,
        timeout: 120000,
        maxRetries: 1
      })
      : new MockImageProvider();

    return { chatProvider, imageProvider, hasRealConfig };
  }, []);
}

export function RuntimePlayground() {
  const [mode, setMode] = useState<RuntimeMode>("workflow");
  const [prompt, setPrompt] = useState("make the BMW blue\nchange the background to a rainy overpass\ncrop to 9:16");
  const [result, setResult] = useState("");
  const [steps, setSteps] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const workflowRuntimeRef = useRef<WorkflowRuntime | null>(null);
  const providers = useRuntimeProviders();

  const createWorkflowRuntime = () => {
    const runtime = new WorkflowRuntime();

    runtime.providers.registerProvider("chat", providers.chatProvider);
    runtime.providers.registerProvider("image", providers.imageProvider);
    runtime.onStepStart(({ state }) => setSteps(JSON.stringify(state.steps, null, 2)));
    runtime.onStepSuccess(({ state }) => setSteps(JSON.stringify(state.steps, null, 2)));
    runtime.onStepError(({ state }) => setSteps(JSON.stringify(state.steps, null, 2)));
    runtime.onAbort(({ state }) => setSteps(JSON.stringify(state.steps, null, 2)));
    workflowRuntimeRef.current = runtime;
    return runtime;
  };

  const run = async () => {
    setIsBusy(true);
    setResult("");
    setSteps("");

    try {
      if (mode === "chat") {
        const runtime = new ConversationRuntime(providers.chatProvider);
        const response = await runtime.send(prompt);
        setResult(response.content);
      }

      if (mode === "optimize") {
        const response = await providers.chatProvider.optimizePrompt?.({ prompt });
        setResult(response?.prompt ?? "Prompt optimization is not available.");
      }

      if (mode === "workflow" || mode === "image" || mode === "cancel" || mode === "retry") {
        const runtime = createWorkflowRuntime();

        if (mode === "cancel") {
          const pending = runtime.runPrompt(prompt);
          runtime.abort();
          await pending;
        } else {
          const response = await runtime.runPrompt(prompt);
          setResult(JSON.stringify(response.messages[response.messages.length - 1] ?? response.steps, null, 2));

          if (mode === "retry") {
            const firstError = response.steps.find((step) => step.status === "error");
            if (firstError) {
              const retried = await runtime.retryStep(firstError.id);
              setResult(JSON.stringify(retried, null, 2));
            }
          }
        }

        setSteps(JSON.stringify(runtime.getState().steps, null, 2));
      }
    } catch (error) {
      setResult(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const retryWorkflow = async () => {
    if (!workflowRuntimeRef.current) {
      setResult("No workflow is available to retry.");
      return;
    }

    setIsBusy(true);

    try {
      const response = await workflowRuntimeRef.current.retryWorkflow();
      setResult(JSON.stringify(response.messages[response.messages.length - 1] ?? response.steps, null, 2));
      setSteps(JSON.stringify(response.steps, null, 2));
    } catch (error) {
      setResult(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="min-h-screen bg-composer-bg px-4 py-20 text-composer-text" data-theme="dark">
      <div className="mx-auto flex max-w-[960px] flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold">Runtime Playground</h1>
          <p className="mt-1 text-sm text-composer-muted">
            {providers.hasRealConfig ? "GPT providers" : "Mock providers"} / WorkflowRuntime / ConversationRuntime
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["chat", "optimize", "workflow", "image", "cancel", "retry"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={[
                "rounded-full border border-composer-chipBorder px-3 py-1.5 text-sm",
                mode === item ? "bg-composer-elevated text-composer-text" : "bg-composer-input text-composer-muted"
              ].join(" ")}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
          className="w-full resize-none rounded-2xl border border-composer-border bg-composer-input p-4 text-sm leading-6 text-composer-text outline-none"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full bg-composer-brand px-4 py-2 text-sm font-semibold text-composer-sendText disabled:opacity-50"
            disabled={isBusy}
            onClick={run}
          >
            {isBusy ? "Running..." : "Run"}
          </button>
          <button
            type="button"
            className="rounded-full border border-composer-chipBorder bg-composer-input px-4 py-2 text-sm text-composer-muted disabled:opacity-50"
            disabled={isBusy}
            onClick={() => workflowRuntimeRef.current?.abort()}
          >
            Abort
          </button>
          <button
            type="button"
            className="rounded-full border border-composer-chipBorder bg-composer-input px-4 py-2 text-sm text-composer-muted disabled:opacity-50"
            disabled={isBusy}
            onClick={retryWorkflow}
          >
            Retry workflow
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <pre className="min-h-[220px] overflow-auto rounded-2xl border border-composer-chipBorder bg-composer-input p-4 text-sm leading-6 text-composer-text">
            {result || "Result"}
          </pre>
          <pre className="min-h-[220px] overflow-auto rounded-2xl border border-composer-chipBorder bg-composer-input p-4 text-sm leading-6 text-composer-text">
            {steps || "Steps"}
          </pre>
        </div>
      </div>
    </section>
  );
}
