import { useMemo, useState } from "react";
import { GPTImageProvider, GPTProvider, ProviderError } from "@company/ai-composer-providers";

type PlaygroundMode = "chat" | "optimize" | "workflow" | "image";

function getErrorMessage(error: unknown): string {
  if (error instanceof ProviderError) {
    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Request failed.";
}

export function GPTPlayground() {
  const [mode, setMode] = useState<PlaygroundMode>("chat");
  const [prompt, setPrompt] = useState("把宝马改成蓝色\n然后背景改成雨夜高架\n最后改成9:16");
  const [imageInput, setImageInput] = useState("");
  const [result, setResult] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const config = useMemo(() => {
    const env = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {});

    return {
      apiKey: env.VITE_GPT_API_KEY ?? env.VITE_AGENT_API_KEY ?? "",
      baseUrl: env.VITE_GPT_BASE_URL ?? env.VITE_AGENT_BASE_URL ?? "https://api.openai.com/v1",
      chatModel: env.VITE_GPT_CHAT_MODEL ?? env.VITE_AGENT_CHAT_MODEL ?? "gpt-5.5",
      imageModel: env.VITE_GPT_IMAGE_MODEL ?? env.VITE_AGENT_IMAGE_MODEL ?? "gpt-image-2"
    };
  }, []);

  const run = async () => {
    setIsBusy(true);
    setResult("");

    try {
      const chatProvider = new GPTProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        model: config.chatModel,
        timeout: 60000,
        maxRetries: 1
      });
      const imageProvider = new GPTImageProvider({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        model: config.imageModel,
        timeout: 120000,
        maxRetries: 1
      });

      if (mode === "chat") {
        const response = await chatProvider.chat({
          messages: [{ id: "playground-user", role: "user", content: prompt, createdAt: Date.now() }]
        });
        setResult(response.text);
      }

      if (mode === "optimize") {
        const response = await chatProvider.optimizePrompt({ prompt });
        setResult(response.prompt);
      }

      if (mode === "workflow") {
        const response = await chatProvider.analyzeWorkflow({ prompt });
        setResult(JSON.stringify(response.steps, null, 2));
      }

      if (mode === "image") {
        const attachments = imageInput.trim() ? [imageInput.trim()] : [];
        const response =
          attachments.length > 0
            ? await imageProvider.editImage({ prompt, attachments })
            : await imageProvider.generateImage({ prompt });
        setResult(JSON.stringify(response.images, null, 2));
      }
    } catch (error) {
      setResult(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="min-h-screen bg-composer-bg px-4 py-20 text-composer-text" data-theme="dark">
      <div className="mx-auto flex max-w-[920px] flex-col gap-5">
        <div>
          <h1 className="text-xl font-semibold">GPT Provider Playground</h1>
          <p className="mt-1 text-sm text-composer-muted">{config.chatModel} / {config.imageModel}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["chat", "optimize", "workflow", "image"] as const).map((item) => (
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

        {mode === "image" ? (
          <input
            value={imageInput}
            onChange={(event) => setImageInput(event.target.value)}
            placeholder="Optional image data URL for editImage()"
            className="w-full rounded-2xl border border-composer-border bg-composer-input p-3 text-sm text-composer-text outline-none"
          />
        ) : null}

        <button
          type="button"
          className="w-fit rounded-full bg-composer-brand px-4 py-2 text-sm font-semibold text-composer-sendText disabled:opacity-50"
          disabled={isBusy}
          onClick={run}
        >
          {isBusy ? "Running..." : "Run"}
        </button>

        {result ? (
          <pre className="min-h-[180px] overflow-auto rounded-2xl border border-composer-chipBorder bg-composer-input p-4 text-sm leading-6 text-composer-text">
            {result}
          </pre>
        ) : null}
      </div>
    </section>
  );
}
