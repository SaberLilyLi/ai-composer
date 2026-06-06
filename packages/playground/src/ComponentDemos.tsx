import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import type { ComposerAttachment, Message } from "@company/ai-composer";
import { AiComposer, ConversationView, requestAgentImage } from "@company/ai-composer";
import { GPTProvider, MockChatProvider, MockImageProvider } from "@company/ai-composer-providers";

export interface DemoConfig {
  apiKey: string;
  baseUrl: string;
  chatEndpoint?: string;
  imageEndpoint?: string;
  chatModel: string;
  imageModel: string;
}

type ThemeMode = "light" | "dark";

const CHAT_MENTIONS = [
  { id: "pm", label: "PM", value: "pm", description: "Frame the ask into a product requirement" },
  { id: "designer", label: "Designer", value: "designer", description: "Focus on UI and interaction details" },
  { id: "engineer", label: "Engineer", value: "engineer", description: "Turn the request into an implementation plan" }
];

const CHAT_COMMANDS = [
  { id: "summarize", label: "Summarize", value: "summarize", description: "Compress the current topic into key points" },
  { id: "rewrite", label: "Rewrite", value: "rewrite", description: "Rewrite the prompt with clearer intent" },
  { id: "reset", label: "Reset", value: "reset", description: "Clear this demo conversation" }
];

const IMAGE_MENTIONS = [
  { id: "art-director", label: "Art Director", value: "art-director", description: "Guide style, framing, and visual tone" },
  { id: "retoucher", label: "Retoucher", value: "retoucher", description: "Focus on edit details and cleanup" },
  { id: "brand", label: "Brand", value: "brand", description: "Keep the visual aligned to brand intent" }
];

const IMAGE_COMMANDS = [
  { id: "generate", label: "Generate", value: "generate", description: "Create a new image from text only" },
  { id: "edit", label: "Edit", value: "edit", description: "Edit based on the uploaded reference image" },
  { id: "reset", label: "Reset", value: "reset", description: "Clear this image conversation" }
];

function createMessage(role: Message["role"], content: string, partial: Partial<Message> = {}): Message {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: Date.now(),
    ...partial
  };
}

function toConversationAttachments(attachments: ComposerAttachment[]) {
  return attachments.map((attachment) => ({
    id: attachment.id,
    type: attachment.type.startsWith("image/") ? "image" : "file",
    url: attachment.previewUrl ?? "",
    name: attachment.name,
    mimeType: attachment.type
  }));
}

function createMockImageUrl(prompt: string): string {
  const title = prompt.trim().slice(0, 60) || "Generated mock image";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2b4668"/>
          <stop offset="52%" stop-color="#1f2937"/>
          <stop offset="100%" stop-color="#c46a2d"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)"/>
      <circle cx="930" cy="210" r="120" fill="rgba(255,255,255,0.16)"/>
      <rect x="96" y="648" width="1008" height="112" rx="24" fill="rgba(15,23,42,0.58)"/>
      <text x="100" y="176" fill="#f8fafc" font-size="38" font-family="Segoe UI, Arial, sans-serif">Image Demo Result</text>
      <text x="100" y="252" fill="#e2e8f0" font-size="62" font-weight="700" font-family="Segoe UI, Arial, sans-serif">Mock output</text>
      <text x="100" y="714" fill="#f8fafc" font-size="34" font-family="Segoe UI, Arial, sans-serif">${escapeSvg(title)}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function DemoShell({
  title,
  description,
  status,
  error,
  theme,
  onClear,
  children
}: {
  title: string;
  description: string;
  status: string;
  error: string;
  theme: ThemeMode;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <section className="min-h-screen bg-composer-bg px-4 py-20 text-composer-text" data-theme={theme}>
      <div className="mx-auto flex max-w-[920px] flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[720px]">
            <h1 className="text-xl font-semibold text-composer-text">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-composer-muted">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs text-composer-muted">
              {status}
            </div>
            <button
              type="button"
              className="rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted transition hover:bg-composer-chip hover:text-composer-text"
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-composer-chipBorder bg-composer-chip px-4 py-3 text-sm text-composer-danger">
            {error}
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}

export function ChatModelDemo({ config, theme }: { config: DemoConfig; theme: ThemeMode }) {
  const provider = useMemo(() => {
    if (!config.apiKey) {
      return new MockChatProvider();
    }

    return new GPTProvider({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.chatModel,
      timeout: 60000,
      maxRetries: 1
    });
  }, [config.apiKey, config.baseUrl, config.chatModel]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [composerKey, setComposerKey] = useState(0);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    createMessage(
      "assistant",
      "This demo directly stacks `ConversationView` and `AiComposer`.\n\nTry plain chat, markdown, file cards, image previews, `/summarize`, or `@designer`.",
      { status: "success" }
    )
  ]);

  const reset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsBusy(false);
    setError("");
    setComposerKey((value) => value + 1);
    setMessages([
      createMessage(
        "assistant",
        "Chat demo reset.\n\nThe surface still uses the existing input and conversation components with no component edits.",
        { status: "success" }
      )
    ]);
  };

  const handleSend = async (value: string, context: { attachments: ComposerAttachment[] }) => {
    const prompt = value.trim();

    if (!prompt) {
      return;
    }

    const nextUserMessage = createMessage("user", prompt, {
      attachments: toConversationAttachments(context.attachments),
      status: "success"
    });
    const nextMessages = messages.concat(nextUserMessage);
    const controller = new AbortController();

    abortControllerRef.current = controller;
    setError("");
    setIsBusy(true);
    setMessages(nextMessages);
    setComposerKey((current) => current + 1);

    try {
      const result = await provider.chat({
        messages: nextMessages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt
        })),
        signal: controller.signal
      });

      setMessages((current) =>
        current.concat(
          createMessage("assistant", result.text, {
            status: "success"
          })
        )
      );
    } catch (requestError) {
      if ((requestError as Error).name === "AbortError") {
        setMessages((current) =>
          current.concat(createMessage("system", "Generation stopped.", { status: "success" }))
        );
      } else {
        const message = requestError instanceof Error ? requestError.message : "Chat request failed.";
        setError(message);
        setMessages((current) => current.concat(createMessage("system", message, { status: "error" })));
      }
    } finally {
      abortControllerRef.current = null;
      setIsBusy(false);
    }
  };

  return (
    <DemoShell
      title="ChatGPT Conversation Demo"
      description="Directly composed with the current `AiComposer` and `ConversationView` components. This is the minimal block-stacking surface for validating chat layout, markdown rendering, attachments, and the bottom composer shell."
      status={isBusy ? "Generating..." : `Model: ${config.apiKey ? config.chatModel : "mock-chat"}`}
      error={error}
      theme={theme}
      onClear={reset}
    >
      <div className="rounded-[28px] border border-composer-softBorder bg-composer-surface/60 p-6 shadow-composer">
        <ConversationView messages={messages} />
      </div>

      <div className="sticky bottom-5">
        <AiComposer
          key={composerKey}
          theme={theme}
          autoFocus
          disabled={isBusy}
          minRows={2}
          maxRows={7}
          showActionOptions
          actionOptions={[
            {
              id: "model",
              label: "Model",
              value: config.apiKey ? config.chatModel : "mock-chat",
              options: [{ label: config.apiKey ? config.chatModel : "mock-chat", value: config.apiKey ? config.chatModel : "mock-chat" }]
            },
            {
              id: "mode",
              label: "Mode",
              value: "dialog",
              options: [{ label: "Dialog", value: "dialog" }]
            }
          ]}
          uploadOptions={{
            accept: ["image/*", ".pdf", ".doc", ".docx", ".txt", ".md"],
            maxFiles: 6,
            maxFileSize: 10 * 1024 * 1024
          }}
          placeholder="Ask a question, attach references, or trigger /commands..."
          mentions={CHAT_MENTIONS}
          commands={CHAT_COMMANDS}
          onCommandSelect={(item) => {
            if (item.value === "reset") {
              reset();
            }
          }}
          onSend={handleSend}
          onStop={() => abortControllerRef.current?.abort()}
        />
      </div>
    </DemoShell>
  );
}

export function ImageModelDemo({ config, theme }: { config: DemoConfig; theme: ThemeMode }) {
  const mockProvider = useMemo(() => new MockImageProvider(), []);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [composerKey, setComposerKey] = useState(0);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    createMessage(
      "assistant",
      "This demo uses the same two existing components, but routes the request to an image model.\n\nUpload a reference image to test edit mode, or send a pure prompt to test generate mode.",
      { status: "success" }
    )
  ]);

  const reset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsBusy(false);
    setError("");
    setComposerKey((value) => value + 1);
    setMessages([
      createMessage(
        "assistant",
        "Image demo reset.\n\nYou can now validate the same composer shell against image generation and image result rendering.",
        { status: "success" }
      )
    ]);
  };

  const handleSend = async (value: string, context: { attachments: ComposerAttachment[] }) => {
    const prompt = value.trim();

    if (!prompt) {
      return;
    }

    const nextUserMessage = createMessage("user", prompt, {
      attachments: toConversationAttachments(context.attachments),
      status: "success"
    });
    const controller = new AbortController();

    abortControllerRef.current = controller;
    setError("");
    setIsBusy(true);
    setMessages((current) => current.concat(nextUserMessage));
    setComposerKey((current) => current + 1);

    try {
      const result = config.apiKey
        ? await requestAgentImage({
          config: {
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            imageEndpoint: config.imageEndpoint,
            chatEndpoint: config.chatEndpoint,
            chatModel: config.chatModel,
            imageModel: config.imageModel
          },
          prompt,
          attachments: context.attachments,
          signal: controller.signal
        })
        : context.attachments.some((attachment) => attachment.type.startsWith("image/"))
          ? await mockProvider.editImage({
            prompt,
            attachments: [],
            signal: controller.signal
          })
          : await mockProvider.generateImage({
            prompt,
            signal: controller.signal
          });
      const images = result.images.map((image, index) => ({
        id: `generated-${Date.now()}-${index}`,
        type: "image" as const,
        url: image.startsWith("mock://") ? createMockImageUrl(prompt) : image,
        name: `Generated ${index + 1}`,
        mimeType: "image/png"
      }));

      setMessages((current) =>
        current.concat(
          createMessage(
            "assistant",
            context.attachments.some((attachment) => attachment.type.startsWith("image/"))
              ? "Image edit completed. The generated result is rendered below in the conversation area."
              : "Image generation completed. The generated result is rendered below in the conversation area.",
            {
              attachments: images,
              status: "success"
            }
          )
        )
      );
    } catch (requestError) {
      if ((requestError as Error).name === "AbortError") {
        setMessages((current) =>
          current.concat(createMessage("system", "Generation stopped.", { status: "success" }))
        );
      } else {
        const message = requestError instanceof Error ? requestError.message : "Image request failed.";
        setError(message);
        setMessages((current) => current.concat(createMessage("system", message, { status: "error" })));
      }
    } finally {
      abortControllerRef.current = null;
      setIsBusy(false);
    }
  };

  return (
    <DemoShell
      title="Image Model Demo"
      description="This surface also directly stacks the current `AiComposer` and `ConversationView`, but feeds the request into the image model path. It is intended to validate image attachments in the composer, reference-image editing, and generated-image display in the conversation content area."
      status={isBusy ? "Generating..." : `Model: ${config.apiKey ? config.imageModel : "mock-image"}`}
      error={error}
      theme={theme}
      onClear={reset}
    >
      <div className="rounded-[28px] border border-composer-softBorder bg-composer-surface/60 p-6 shadow-composer">
        <ConversationView messages={messages} />
      </div>

      <div className="sticky bottom-5">
        <AiComposer
          key={composerKey}
          theme={theme}
          autoFocus
          disabled={isBusy}
          minRows={2}
          maxRows={7}
          showActionOptions
          actionOptions={[
            {
              id: "model",
              label: "Model",
              value: config.apiKey ? config.imageModel : "mock-image",
              options: [{ label: config.apiKey ? config.imageModel : "mock-image", value: config.apiKey ? config.imageModel : "mock-image" }]
            },
            {
              id: "task",
              label: "Task",
              value: "image",
              options: [{ label: "Image", value: "image" }]
            }
          ]}
          uploadOptions={{
            accept: ["image/*"],
            maxFiles: 6,
            maxFileSize: 10 * 1024 * 1024
          }}
          placeholder="Describe the image to generate, or upload a reference image to edit..."
          mentions={IMAGE_MENTIONS}
          commands={IMAGE_COMMANDS}
          onCommandSelect={(item) => {
            if (item.value === "reset") {
              reset();
            }
          }}
          onSend={handleSend}
          onStop={() => abortControllerRef.current?.abort()}
        />
      </div>
    </DemoShell>
  );
}
