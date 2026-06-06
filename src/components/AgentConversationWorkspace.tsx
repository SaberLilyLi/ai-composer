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
  const activeModel = mode === "chat" ? selectedChatModel : selectedImageModel;

  return (
    <div className="flex min-h-screen w-full flex-col bg-composer-bg text-composer-text" data-theme={theme}>
      <header className="sticky top-0 z-20 border-b border-composer-softBorder bg-composer-bg/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[920px] items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-composer-text">{title}</h1>
            <p className="truncate text-xs text-composer-muted">{mode === "chat" ? activeModel : `${activeModel} image mode`}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs text-composer-muted sm:block">
              {isBusy ? "Generating..." : "Ready"}
            </div>
            <button
              type="button"
              className="rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted transition hover:bg-composer-chip"
              onClick={resetConversation}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-44 pt-8">
          <div className="mx-auto flex max-w-[760px] flex-col gap-7">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const isSystem = message.role === "system";

              return (
                <article
                  key={message.id}
                  className={[
                    "flex gap-4",
                    isUser ? "justify-end" : isSystem ? "justify-center" : "justify-start"
                  ].join(" ")}
                >
                  {!isUser && !isSystem ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-composer-elevated text-xs font-semibold text-composer-text">
                      AI
                    </div>
                  ) : null}

                  <div
                    className={[
                      "min-w-0",
                      isUser
                        ? "max-w-[76%] rounded-[22px] bg-composer-elevated px-5 py-3 text-composer-text"
                        : isSystem
                          ? "max-w-[82%] rounded-full border border-composer-chipBorder bg-composer-chip px-4 py-2 text-center text-sm text-composer-muted"
                          : "flex-1 text-composer-text"
                    ].join(" ")}
                  >
                    {!isUser && !isSystem ? (
                      <div className="mb-2 flex items-center gap-2 text-xs text-composer-muted">
                        <span className="font-medium text-composer-text">Assistant</span>
                        {message.model ? <span>{message.model}</span> : null}
                      </div>
                    ) : null}
                    <div className="whitespace-pre-wrap text-[15px] leading-7">{message.text}</div>

                    {message.attachments && message.attachments.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 rounded-xl border border-composer-chipBorder bg-composer-input px-2.5 py-2"
                          >
                            {attachment.previewUrl ? (
                              <img
                                src={attachment.previewUrl}
                                alt={attachment.name}
                                className="h-9 w-9 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-composer-chip text-[10px] font-semibold text-composer-muted">
                                FILE
                              </div>
                            )}
                            <div className="max-w-[160px] truncate text-xs text-composer-muted">{attachment.name}</div>
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
                            className="aspect-square w-full rounded-[18px] border border-composer-softBorder object-cover"
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {isUser ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-composer-brand text-xs font-semibold text-composer-sendText">
                      You
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent px-4 pb-5 pt-12">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex rounded-full border border-composer-chipBorder bg-composer-input p-1">
                {(["chat", "image"] as AgentMode[]).map((item) => {
                  const active = mode === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      className={[
                        "rounded-full px-3 py-1.5 text-xs font-medium transition",
                        active ? "bg-composer-elevated text-composer-text" : "text-composer-muted hover:text-composer-text"
                      ].join(" ")}
                      onClick={() => setMode(item)}
                    >
                      {item === "chat" ? "Chat" : "Image"}
                    </button>
                  );
                })}
              </div>
              <p className="hidden truncate text-xs text-composer-muted sm:block">{subtitle}</p>
            </div>

            {error ? (
              <div className="mb-3 rounded-2xl border border-composer-chipBorder bg-composer-chip px-4 py-3 text-sm text-composer-danger">
                {error}
              </div>
            ) : null}

            <AiComposer
              key={composerKey}
              theme={theme}
              minRows={1}
              maxRows={6}
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
                  ? "Ask anything..."
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
      </main>
    </div>
  );
}
