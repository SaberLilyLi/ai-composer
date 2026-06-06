import { useMemo, useRef, useState } from "react";
import { ConversationRuntime, WorkflowRuntime } from "@company/ai-composer-core";
import { GPTImageProvider, GPTProvider } from "@company/ai-composer-providers";
import type { ComposerActionOption, ComposerAttachment, Message, WorkflowStep } from "../core/types";

export type AgentMode = "chat" | "image";

export interface AgentRuntimeConfig {
  apiKey: string;
  baseUrl: string;
  chatModel: string;
  imageModel: string;
  timeout?: number;
  maxRetries?: number;
}

const COMMANDS = [
  { id: "chat", label: "Chat mode", value: "chat", description: "Talk with the text model" },
  { id: "image", label: "Image mode", value: "image", description: "Run an image workflow" },
  { id: "reset", label: "Reset", value: "reset", description: "Clear the conversation" }
];

const MENTIONS = [
  { id: "planner", label: "Planner", value: "planner", description: "Break work into crisp steps" },
  { id: "designer", label: "Designer", value: "designer", description: "Shape visual direction" },
  { id: "operator", label: "Operator", value: "operator", description: "Focus on execution details" }
];

function getDefaultRuntimeConfig(): AgentRuntimeConfig {
  const env = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {});

  return {
    apiKey: env.VITE_GPT_API_KEY ?? env.VITE_AGENT_API_KEY ?? "",
    baseUrl: env.VITE_GPT_BASE_URL ?? env.VITE_AGENT_BASE_URL ?? "https://api.openai.com/v1",
    chatModel: env.VITE_GPT_CHAT_MODEL ?? env.VITE_AGENT_CHAT_MODEL ?? "gpt-5.5",
    imageModel: env.VITE_GPT_IMAGE_MODEL ?? env.VITE_AGENT_IMAGE_MODEL ?? "gpt-image-2",
    timeout: Number(env.VITE_GPT_TIMEOUT ?? env.VITE_AGENT_TIMEOUT ?? 60000),
    maxRetries: Number(env.VITE_GPT_MAX_RETRIES ?? env.VITE_AGENT_MAX_RETRIES ?? 1)
  };
}

function buildRuntimeConfig(config?: Partial<AgentRuntimeConfig>): AgentRuntimeConfig {
  const defaults = getDefaultRuntimeConfig();

  return {
    apiKey: config?.apiKey ?? defaults.apiKey,
    baseUrl: config?.baseUrl ?? defaults.baseUrl,
    chatModel: config?.chatModel ?? defaults.chatModel,
    imageModel: config?.imageModel ?? defaults.imageModel,
    timeout: config?.timeout ?? defaults.timeout,
    maxRetries: config?.maxRetries ?? defaults.maxRetries
  };
}

function createMessage(role: Message["role"], content: string, partial: Partial<Message> = {}): Message {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: Date.now(),
    ...partial
  };
}

function createProviders(config: AgentRuntimeConfig) {
  const chatProvider = new GPTProvider({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.chatModel,
    timeout: config.timeout,
    maxRetries: config.maxRetries
  });
  const imageProvider = new GPTImageProvider({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.imageModel,
    timeout: config.timeout,
    maxRetries: config.maxRetries
  });

  return { chatProvider, imageProvider };
}

function buildConversationRuntime(config: AgentRuntimeConfig): ConversationRuntime {
  return new ConversationRuntime(createProviders(config).chatProvider);
}

function buildWorkflowRuntime(config: AgentRuntimeConfig): WorkflowRuntime {
  const runtime = new WorkflowRuntime();
  const { chatProvider, imageProvider } = createProviders(config);

  runtime.providers.registerProvider("chat", chatProvider);
  runtime.providers.registerProvider("image", imageProvider);

  return runtime;
}

async function attachmentsToDataUrls(attachments: ComposerAttachment[]): Promise<string[]> {
  const imageAttachments = attachments.filter((attachment) => attachment.type.startsWith("image/"));
  return Promise.all(imageAttachments.map((attachment) => fileToDataUrl(attachment.file)));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error(`Failed to read "${file.name}" as a data URL.`));
    };

    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

export interface UseAgentConversationControllerOptions {
  initialMode: AgentMode;
  config?: Partial<AgentRuntimeConfig>;
}

export function useAgentConversationController({
  initialMode,
  config
}: UseAgentConversationControllerOptions) {
  const runtimeConfig = useMemo(() => buildRuntimeConfig(config), [config]);
  const conversationRuntimeRef = useRef<ConversationRuntime | null>(null);
  const workflowRuntimeRef = useRef<WorkflowRuntime | null>(null);
  const [mode, setMode] = useState<AgentMode>(initialMode);
  const [selectedChatModel, setSelectedChatModel] = useState(runtimeConfig.chatModel);
  const [selectedImageModel, setSelectedImageModel] = useState(runtimeConfig.imageModel);
  const [reasoningSpeed, setReasoningSpeed] = useState("balanced");
  const [composerKey, setComposerKey] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    createMessage(
      "assistant",
      "I am ready. Switch between text conversation and image workflow execution, then send your request with the composer below.",
      { status: "success" }
    )
  ]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const resetComposer = () => {
    setComposerKey((value) => value + 1);
  };

  const resetRuntimes = () => {
    conversationRuntimeRef.current?.abort();
    workflowRuntimeRef.current?.abort();
    conversationRuntimeRef.current = null;
    workflowRuntimeRef.current = null;
  };

  const resetConversation = () => {
    resetRuntimes();
    setIsBusy(false);
    setError("");
    setWorkflowSteps([]);
    setMessages([
      createMessage("assistant", "Conversation reset. I am ready for a fresh request.", { status: "success" })
    ]);
    resetComposer();
  };

  const handleSend = async (value: string, context: { attachments: ComposerAttachment[] }) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    setError("");
    setIsBusy(true);
    resetComposer();

    try {
      if (mode === "chat") {
        const runtime = buildConversationRuntime({ ...runtimeConfig, chatModel: selectedChatModel });
        conversationRuntimeRef.current = runtime;
        runtime.onMessage(({ message }) => setMessages((current) => current.concat(message)));
        runtime.onStreaming(({ message }) => setMessages((current) => current.concat(message)));

        await runtime.send(trimmedValue);
        setWorkflowSteps([]);
        return;
      }

      const runtime = buildWorkflowRuntime({
        ...runtimeConfig,
        chatModel: selectedChatModel,
        imageModel: selectedImageModel
      });
      workflowRuntimeRef.current = runtime;
      runtime.onStart(({ state }) => setWorkflowSteps(state.steps));
      runtime.onStepStart(({ state }) => setWorkflowSteps(state.steps));
      runtime.onStepSuccess(({ state }) => setWorkflowSteps(state.steps));
      runtime.onStepError(({ state }) => setWorkflowSteps(state.steps));
      runtime.onAbort(({ state }) => setWorkflowSteps(state.steps));

      const userMessage = createMessage("user", trimmedValue, {
        attachments: context.attachments.map((attachment) => ({
          id: attachment.id,
          type: attachment.type.startsWith("image/") ? "image" : "file",
          url: attachment.previewUrl ?? "",
          name: attachment.name,
          mimeType: attachment.type
        })),
        status: "success"
      });
      setMessages((current) => current.concat(userMessage));

      const result = await runtime.runPrompt(trimmedValue, {
        attachments: await attachmentsToDataUrls(context.attachments)
      });
      const finalMessage = result.messages[result.messages.length - 1];

      if (finalMessage) {
        setMessages((current) => current.concat(finalMessage));
      }
      setWorkflowSteps(result.steps);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Request failed.";

      if ((requestError as Error).name === "AbortError") {
        setMessages((current) => current.concat(createMessage("system", "Generation stopped.", { status: "success" })));
      } else {
        setError(message);
        setMessages((current) => current.concat(createMessage("system", message, { status: "error" })));
      }
    } finally {
      conversationRuntimeRef.current = null;
      workflowRuntimeRef.current = null;
      setIsBusy(false);
      resetComposer();
    }
  };

  const handleStop = () => {
    conversationRuntimeRef.current?.abort();
    workflowRuntimeRef.current?.abort();
  };

  const handleActionOptionChange = (id: string, value: string) => {
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
  };

  const handleCommandSelect = (item: { value: string }) => {
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
  };

  const actionOptions: ComposerActionOption[] = [
    {
      id: "model",
      label: "Model",
      value: mode === "chat" ? selectedChatModel : selectedImageModel,
      options:
        mode === "chat"
          ? [{ label: selectedChatModel, value: selectedChatModel }]
          : [{ label: selectedImageModel, value: selectedImageModel }]
    },
    {
      id: "reasoning-speed",
      label: "Speed",
      value: reasoningSpeed,
      options: [
        { label: "Fast", value: "fast" },
        { label: "Balanced", value: "balanced" },
        { label: "Deep", value: "deep" }
      ]
    }
  ];

  const activeModel = mode === "chat" ? selectedChatModel : selectedImageModel;

  return {
    activeModel,
    actionOptions,
    commands: COMMANDS,
    composerKey,
    conversationMessages: messages,
    error,
    handleActionOptionChange,
    handleCommandSelect,
    handleSend,
    handleStop,
    isBusy,
    mentions: MENTIONS,
    mode,
    resetConversation,
    setMode,
    workflowSteps
  };
}
