import { useRef, useState } from "react";
import { AiComposer } from "./AiComposer";
import type { ComposerActionOption, ComposerAttachment } from "../core/types";
import {
  getAgentRuntimeConfig,
  requestAgentChat,
  requestAgentImage,
  toAttachmentPreviews,
  type AgentMessage,
  type AgentMode,
  type AgentRuntimeConfig
} from "../core/agentRuntime";

export interface AgentConversationWorkspaceProps {
  theme?: "light" | "dark" | "auto";
  title?: string;
  subtitle?: string;
  initialMode?: AgentMode;
  config?: Partial<AgentRuntimeConfig>;
}

const DEFAULT_TITLE = "Agent Conversation";
const DEFAULT_SUBTITLE = "Use the composer below to talk with Qwen or generate images with Wan.";

function buildRuntimeConfig(config?: Partial<AgentRuntimeConfig>): AgentRuntimeConfig {
  const defaults = getAgentRuntimeConfig();

  return {
    apiKey: config?.apiKey ?? defaults.apiKey,
    baseUrl: config?.baseUrl ?? defaults.baseUrl,
    chatEndpoint: config?.chatEndpoint ?? defaults.chatEndpoint,
    imageEndpoint: config?.imageEndpoint ?? defaults.imageEndpoint,
    chatModel: config?.chatModel ?? defaults.chatModel,
    imageModel: config?.imageModel ?? defaults.imageModel
  };
}

function createMessage(role: AgentMessage["role"], text: string, partial?: Partial<AgentMessage>): AgentMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    ...partial
  };
}

const COMMANDS = [
  { id: "chat", label: "Chat mode", value: "chat", description: "Talk with the text model" },
  { id: "image", label: "Image mode", value: "image", description: "Generate an image" },
  { id: "reset", label: "Reset", value: "reset", description: "Clear the conversation" }
];

const MENTIONS = [
  { id: "planner", label: "Planner", value: "planner", description: "Break work into crisp steps" },
  { id: "designer", label: "Designer", value: "designer", description: "Shape visual direction" },
  { id: "operator", label: "Operator", value: "operator", description: "Focus on execution details" }
];

export function AgentConversationWorkspace({
  theme = "dark",
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  initialMode = "chat",
  config
}: AgentConversationWorkspaceProps) {
  const runtimeConfig = buildRuntimeConfig(config);
  const abortRef = useRef<AbortController | null>(null);
  const [mode, setMode] = useState<AgentMode>(initialMode);
  const [selectedChatModel, setSelectedChatModel] = useState(runtimeConfig.chatModel);
  const [selectedImageModel, setSelectedImageModel] = useState(runtimeConfig.imageModel);
  const [reasoningSpeed, setReasoningSpeed] = useState("balanced");
  const [composerKey, setComposerKey] = useState(0);
  const [messages, setMessages] = useState<AgentMessage[]>([
    createMessage(
      "assistant",
      "I am ready. Switch between text conversation and image generation, then send your request with the composer below.",
      { model: initialMode === "chat" ? runtimeConfig.chatModel : runtimeConfig.imageModel }
    )
  ]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const resetComposer = () => {
    setComposerKey((value) => value + 1);
  };

  const resetConversation = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsBusy(false);
    setError("");
    setMessages([
      createMessage(
        "assistant",
        "Conversation reset. I am ready for a fresh request.",
        { model: mode === "chat" ? runtimeConfig.chatModel : runtimeConfig.imageModel }
      )
    ]);
    resetComposer();
  };

  const handleSend = async (value: string, context: { attachments: ComposerAttachment[] }) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    const attachmentPreviews = toAttachmentPreviews(context.attachments);
    const userMessage = createMessage("user", trimmedValue, {
      attachments: attachmentPreviews
    });
    const nextHistory = messages.concat(userMessage);
    const controller = new AbortController();

    abortRef.current = controller;
    setError("");
    setIsBusy(true);
    setMessages(nextHistory);
    resetComposer();

    try {
      if (mode === "chat") {
        const result = await requestAgentChat({
          config: {
            ...runtimeConfig,
            chatModel: selectedChatModel
          },
          history: nextHistory,
          signal: controller.signal
        });

        setMessages((current) =>
          current.concat(
            createMessage("assistant", result.text, {
              model: result.model
            })
          )
        );
      } else {
        const result = await requestAgentImage({
          config: {
            ...runtimeConfig,
            imageModel: selectedImageModel
          },
          prompt: trimmedValue,
          attachments: context.attachments,
          signal: controller.signal
        });

        setMessages((current) =>
          current.concat(
            createMessage("assistant", result.text, {
              generatedImages: result.images,
              model: result.model
            })
          )
        );
      }
    } catch (requestError) {
      if ((requestError as Error).name === "AbortError") {
        setMessages((current) =>
          current.concat(
            createMessage("system", "Generation stopped.")
          )
        );
      } else {
        const message = requestError instanceof Error ? requestError.message : "Request failed.";
        setError(message);
        setMessages((current) =>
          current.concat(
            createMessage("system", message)
          )
        );
      }
    } finally {
      abortRef.current = null;
      setIsBusy(false);
      resetComposer();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const actionOptions: ComposerActionOption[] = [
    {
      id: "model",
      label: "\u6a21\u578b",
      value: mode === "chat" ? selectedChatModel : selectedImageModel,
      options:
        mode === "chat"
          ? [{ label: "Qwen", value: "qwen3.7-plus" }]
          : [{ label: "Wan", value: "wan2.7-image-pro" }]
    },
    {
      id: "reasoning-speed",
      label: "\u63a8\u7406\u901f\u5ea6",
      value: reasoningSpeed,
      options: [
        { label: "\u5feb", value: "fast" },
        { label: "\u5747\u8861", value: "balanced" },
        { label: "\u6df1\u5ea6", value: "deep" }
      ]
    }
  ];

  return (
    <div
      className="flex min-h-[840px] w-[1120px] overflow-hidden rounded-[32px] border border-composer-border bg-composer-bg shadow-composer"
      data-theme={theme}
    >
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-composer-softBorder bg-composer-input px-6 py-7">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-composer-accent">Agent workspace</div>
        <h1 className="mt-4 text-[28px] font-semibold leading-tight text-composer-text">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-composer-muted">{subtitle}</p>

        <div className="mt-8 rounded-3xl border border-composer-softBorder bg-composer-chip p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-composer-muted">Active models</div>
          <div className="mt-4 rounded-2xl border border-composer-chipBorder bg-composer-bg px-4 py-3">
            <div className="text-xs text-composer-muted">Chat</div>
            <div className="mt-1 text-sm font-medium text-composer-text">{selectedChatModel}</div>
          </div>
          <div className="mt-3 rounded-2xl border border-composer-chipBorder bg-composer-bg px-4 py-3">
            <div className="text-xs text-composer-muted">Image</div>
            <div className="mt-1 text-sm font-medium text-composer-text">{selectedImageModel}</div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-composer-softBorder bg-composer-chip p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-composer-text">Mode</div>
            <button
              type="button"
              className="rounded-full border border-composer-chipBorder px-3 py-1 text-xs text-composer-muted transition hover:bg-composer-bg"
              onClick={resetConversation}
            >
              Reset
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {(["chat", "image"] as AgentMode[]).map((item) => {
              const active = mode === item;

              return (
                <button
                  key={item}
                  type="button"
                  className={[
                    "flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    active
                      ? "border-composer-brand bg-composer-bg text-composer-brand"
                      : "border-composer-chipBorder bg-transparent text-composer-text hover:bg-composer-bg"
                  ].join(" ")}
                  onClick={() => setMode(item)}
                >
                  {item === "chat" ? "Chat" : "Image"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto rounded-3xl border border-composer-softBorder bg-composer-chip p-4 text-xs leading-6 text-composer-muted">
          Put your API key in `.env` as `VITE_AGENT_API_KEY`. The chat and image model names can also be overridden there if your DashScope account exposes different identifiers.
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-composer-bg">
        <div className="flex items-center justify-between border-b border-composer-softBorder px-8 py-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-composer-muted">Conversation</div>
            <div className="mt-2 text-lg font-semibold text-composer-text">
              {mode === "chat" ? "Qwen dialogue" : "Wan image generation"}
            </div>
          </div>
          <div className="rounded-full border border-composer-chipBorder bg-composer-input px-4 py-2 text-sm text-composer-muted">
            {isBusy ? "Generating..." : "Ready"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto flex max-w-[720px] flex-col gap-5">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const isSystem = message.role === "system";

              return (
                <article
                  key={message.id}
                  className={[
                    "rounded-[28px] border px-5 py-4 shadow-tile",
                    isUser
                      ? "self-end border-composer-brand bg-composer-bg text-composer-text"
                      : isSystem
                        ? "border-transparent bg-composer-chip text-composer-muted"
                        : "border-composer-softBorder bg-composer-input text-composer-text"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-composer-muted">
                      {message.role}
                    </div>
                    {message.model ? (
                      <div className="rounded-full border border-composer-chipBorder px-2.5 py-1 text-[11px] text-composer-muted">
                        {message.model}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7">{message.text}</div>

                  {message.attachments && message.attachments.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 rounded-2xl border border-composer-chipBorder bg-composer-bg px-3 py-2"
                        >
                          {attachment.previewUrl ? (
                            <img
                              src={attachment.previewUrl}
                              alt={attachment.name}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-composer-chip text-xs font-semibold text-composer-muted">
                              FILE
                            </div>
                          )}
                          <div className="text-xs text-composer-muted">{attachment.name}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {message.generatedImages && message.generatedImages.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {message.generatedImages.map((imageUrl, index) => (
                        <img
                          key={`${message.id}-${index}`}
                          src={imageUrl}
                          alt={`Generated ${index + 1}`}
                          className="aspect-square w-full rounded-[22px] border border-composer-softBorder object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <div className="border-t border-composer-softBorder px-8 py-7">
          {error ? (
            <div className="mx-auto mb-4 max-w-[720px] rounded-2xl border border-composer-chipBorder bg-composer-chip px-4 py-3 text-sm text-composer-danger">
              {error}
            </div>
          ) : null}

          <div className="mx-auto max-w-[720px]">
            <AiComposer
              key={composerKey}
              theme={theme}
              autoFocus
              disabled={isBusy}
              showActionOptions
              actionOptions={actionOptions}
              onActionOptionChange={(id, value) => {
                if (id === "model") {
                  if (mode === "chat") {
                    setSelectedChatModel(value);
                  } else {
                    setSelectedImageModel(value);
                  }
                  return;
                }

                if (id === "reasoning-speed") {
                  setReasoningSpeed(value);
                }
              }}
              uploadOptions={{
                accept: ["image/*"],
                maxFiles: 9,
                maxFileSize: 10 * 1024 * 1024
              }}
              placeholder={
                mode === "chat"
                  ? "Ask the agent to analyze, plan, or write..."
                  : "Describe the image you want Wan to generate..."
              }
              mentions={MENTIONS}
              commands={COMMANDS}
              onCommandSelect={(item) => {
                if (item.value === "chat") {
                  setMode("chat");
                  return;
                }

                if (item.value === "image") {
                  setMode("image");
                  return;
                }

                if (item.value === "reset") {
                  resetConversation();
                }
              }}
              onSend={handleSend}
              onStop={handleStop}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
