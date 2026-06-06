import { useEffect, useMemo, useRef, useState } from "react";
import { ConversationRuntime, requestAgentImage } from "@company/ai-composer-core";
import { GPTProvider } from "@company/ai-composer-providers";
import type {
  ComposerActionOption,
  ComposerAttachment,
  Message,
  UploadPluginOptions,
  WorkflowStep
} from "../core/types";

export type AgentMode = "chat" | "image";
export type AgentImageResolution = "1K" | "2K" | "4K";
export type AgentImageSize = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export interface AgentRuntimeConfig {
  apiKey: string;
  baseUrl: string;
  chatEndpoint?: string;
  imageEndpoint?: string;
  chatModel: string;
  imageModel: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AgentSelectOption {
  label: string;
  value: string;
}

export interface AgentModeSwitchConfig {
  enabled?: boolean;
  modes?: AgentMode[];
}

export interface AgentChatUIConfig {
  modelOptions?: AgentSelectOption[];
  showReasoningSpeed?: boolean;
  reasoningSpeedOptions?: AgentSelectOption[];
}

export interface AgentImageGenerationUIConfig extends AgentImageGenerationOptions {
  enabled?: boolean;
  countOptions?: number[];
  resolutionOptions?: AgentImageResolution[];
  sizeOptions?: AgentImageSize[];
}

export interface AgentImageGenerationOptions {
  count?: number;
  resolution?: AgentImageResolution;
  size?: AgentImageSize;
}

interface NormalizedImageGenerationUIConfig {
  enabled: boolean;
  count: number;
  resolution: AgentImageResolution;
  size: AgentImageSize;
  countOptions: number[];
  resolutionOptions: AgentImageResolution[];
  sizeOptions: AgentImageSize[];
}

export interface AgentImageUIConfig {
  modelOptions?: AgentSelectOption[];
  multiImage?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  generationOptions?: AgentImageGenerationUIConfig;
}

export interface AgentConversationUIConfig {
  modeSwitch?: AgentModeSwitchConfig;
  chat?: AgentChatUIConfig;
  image?: AgentImageUIConfig;
}

export interface AgentConversationConfig extends Partial<AgentRuntimeConfig> {
  ui?: AgentConversationUIConfig;
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

const STORAGE_KEY = "ai-composer:agent-conversation-cache";

interface ConversationCacheEntry {
  messages: Message[];
  workflowSteps: WorkflowStep[];
}

interface ConversationCachePayload {
  mode: AgentMode;
  selectedChatModel: string;
  selectedImageModel: string;
  reasoningSpeed: string;
  conversations: Record<string, ConversationCacheEntry>;
}

function getDefaultRuntimeConfig(): AgentRuntimeConfig {
  const env = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {});

  return {
    apiKey: env.VITE_GPT_API_KEY ?? env.VITE_AGENT_API_KEY ?? "",
    baseUrl: env.VITE_GPT_BASE_URL ?? env.VITE_AGENT_BASE_URL ?? "https://api.openai.com/v1",
    chatEndpoint: env.VITE_AGENT_CHAT_ENDPOINT ?? "",
    imageEndpoint: env.VITE_AGENT_IMAGE_ENDPOINT ?? "",
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
    chatEndpoint: config?.chatEndpoint ?? defaults.chatEndpoint,
    imageEndpoint: config?.imageEndpoint ?? defaults.imageEndpoint,
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

function createIntroMessages(mode: AgentMode): Message[] {
  if (mode === "image") {
    return [
      createMessage(
        "assistant",
        "I am ready. Describe an image workflow or attach a reference image, then send your request with the composer below.",
        { status: "success" }
      )
    ];
  }

  return [
    createMessage(
      "assistant",
      "I am ready. Switch between text conversation and image workflow execution, then send your request with the composer below.",
      { status: "success" }
    )
  ];
}

function getConversationKey(mode: AgentMode, chatModel: string, imageModel: string): string {
  return mode === "chat" ? `chat:${chatModel}` : `image:${imageModel}`;
}

function createConversationEntry(mode: AgentMode): ConversationCacheEntry {
  return {
    messages: createIntroMessages(mode),
    workflowSteps: []
  };
}

function readConversationCache(
  runtimeConfig: AgentRuntimeConfig,
  initialMode: AgentMode
): ConversationCachePayload {
  const fallback: ConversationCachePayload = {
    mode: initialMode,
    selectedChatModel: runtimeConfig.chatModel,
    selectedImageModel: runtimeConfig.imageModel,
    reasoningSpeed: "balanced",
    conversations: {}
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<ConversationCachePayload>;
    return {
      mode: parsed.mode === "image" ? "image" : parsed.mode === "chat" ? "chat" : fallback.mode,
      selectedChatModel:
        typeof parsed.selectedChatModel === "string" && parsed.selectedChatModel
          ? parsed.selectedChatModel
          : fallback.selectedChatModel,
      selectedImageModel:
        typeof parsed.selectedImageModel === "string" && parsed.selectedImageModel
          ? parsed.selectedImageModel
          : fallback.selectedImageModel,
      reasoningSpeed:
        typeof parsed.reasoningSpeed === "string" && parsed.reasoningSpeed
          ? parsed.reasoningSpeed
          : fallback.reasoningSpeed,
      conversations: parsed.conversations && typeof parsed.conversations === "object" ? parsed.conversations : {}
    };
  } catch {
    return fallback;
  }
}

function createProviders(config: AgentRuntimeConfig) {
  const chatProvider = new GPTProvider({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.chatModel,
    timeout: config.timeout,
    maxRetries: config.maxRetries
  });

  return { chatProvider };
}

function buildConversationRuntime(config: AgentRuntimeConfig): ConversationRuntime {
  return new ConversationRuntime(createProviders(config).chatProvider);
}

export interface UseAgentConversationControllerOptions {
  initialMode: AgentMode;
  config?: AgentConversationConfig;
}

const DEFAULT_REASONING_SPEED_OPTIONS: AgentSelectOption[] = [
  { label: "Fast", value: "fast" },
  { label: "Balanced", value: "balanced" },
  { label: "Deep", value: "deep" }
];

const DEFAULT_IMAGE_COUNT_OPTIONS = [1, 2, 3, 4];
const DEFAULT_IMAGE_RESOLUTION_OPTIONS: AgentImageResolution[] = ["1K", "2K", "4K"];
const DEFAULT_IMAGE_SIZE_OPTIONS: AgentImageSize[] = ["1:1", "4:3", "3:4", "16:9", "9:16"];

function normalizeModeSwitchConfig(config?: AgentModeSwitchConfig): Required<AgentModeSwitchConfig> {
  const normalizedModes = (config?.modes ?? ["chat", "image"]).filter(
    (mode, index, list): mode is AgentMode => (mode === "chat" || mode === "image") && list.indexOf(mode) === index
  );

  return {
    enabled: config?.enabled ?? false,
    modes: normalizedModes.length > 0 ? normalizedModes : ["chat", "image"]
  };
}

function normalizeImageGenerationUIConfig(
  config?: AgentImageGenerationUIConfig
): NormalizedImageGenerationUIConfig {
  return {
    enabled: config?.enabled ?? false,
    count: typeof config?.count === "number" ? Math.max(1, Math.min(4, Math.floor(config.count))) : 1,
    resolution: config?.resolution ?? "2K",
    size: config?.size ?? "1:1",
    countOptions: (config?.countOptions?.length ? config.countOptions : DEFAULT_IMAGE_COUNT_OPTIONS)
      .map((item) => Math.max(1, Math.min(4, Math.floor(item))))
      .filter((item, index, list) => list.indexOf(item) === index),
    resolutionOptions: config?.resolutionOptions?.length ? config.resolutionOptions : DEFAULT_IMAGE_RESOLUTION_OPTIONS,
    sizeOptions: config?.sizeOptions?.length ? config.sizeOptions : DEFAULT_IMAGE_SIZE_OPTIONS
  };
}

function normalizeImageUIConfig(config?: AgentImageUIConfig) {
  return {
    modelOptions: config?.modelOptions,
    multiImage: config?.multiImage ?? false,
    maxFiles: config?.maxFiles ?? 9,
    maxFileSize: config?.maxFileSize ?? 10 * 1024 * 1024,
    generationOptions: normalizeImageGenerationUIConfig(config?.generationOptions)
  };
}

function normalizeChatUIConfig(config?: AgentChatUIConfig) {
  return {
    modelOptions: config?.modelOptions,
    showReasoningSpeed: config?.showReasoningSpeed ?? true,
    reasoningSpeedOptions: config?.reasoningSpeedOptions?.length
      ? config.reasoningSpeedOptions
      : DEFAULT_REASONING_SPEED_OPTIONS
  };
}

export function useAgentConversationController({
  initialMode,
  config
}: UseAgentConversationControllerOptions) {
  const runtimeConfig = useMemo(() => buildRuntimeConfig(config), [config]);
  const uiConfig = useMemo(
    () => ({
      modeSwitch: normalizeModeSwitchConfig(config?.ui?.modeSwitch),
      chat: normalizeChatUIConfig(config?.ui?.chat),
      image: normalizeImageUIConfig(config?.ui?.image)
    }),
    [config]
  );
  const initialCache = useMemo(() => readConversationCache(runtimeConfig, initialMode), [initialMode, runtimeConfig]);
  const conversationRuntimeRef = useRef<ConversationRuntime | null>(null);
  const [mode, setModeState] = useState<AgentMode>(initialCache.mode);
  const [selectedChatModel, setSelectedChatModelState] = useState(initialCache.selectedChatModel);
  const [selectedImageModel, setSelectedImageModelState] = useState(initialCache.selectedImageModel);
  const [reasoningSpeed, setReasoningSpeed] = useState(initialCache.reasoningSpeed);
  const [imageCount, setImageCount] = useState(uiConfig.image.generationOptions.count);
  const [imageResolution, setImageResolution] = useState<AgentImageResolution>(uiConfig.image.generationOptions.resolution);
  const [imageSize, setImageSize] = useState<AgentImageSize>(uiConfig.image.generationOptions.size);
  const [composerKey, setComposerKey] = useState(0);
  const [messages, setMessages] = useState<Message[]>(
    () =>
      initialCache.conversations[getConversationKey(initialCache.mode, initialCache.selectedChatModel, initialCache.selectedImageModel)]
        ?.messages ?? createIntroMessages(initialCache.mode)
  );
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(
    () =>
      initialCache.conversations[getConversationKey(initialCache.mode, initialCache.selectedChatModel, initialCache.selectedImageModel)]
        ?.workflowSteps ?? []
  );
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const conversationCacheRef = useRef<Record<string, ConversationCacheEntry>>(initialCache.conversations);

  const resetComposer = () => {
    setComposerKey((value) => value + 1);
  };

  const switchConversation = (
    nextMode: AgentMode,
    nextChatModel: string = selectedChatModel,
    nextImageModel: string = selectedImageModel
  ) => {
    const nextKey = getConversationKey(nextMode, nextChatModel, nextImageModel);
    const nextEntry = conversationCacheRef.current[nextKey] ?? createConversationEntry(nextMode);

    resetRuntimes();
    setError("");
    setIsBusy(false);
    setModeState(nextMode);
    setSelectedChatModelState(nextChatModel);
    setSelectedImageModelState(nextImageModel);
    setMessages(nextEntry.messages);
    setWorkflowSteps(nextEntry.workflowSteps);
    resetComposer();
  };

  const resetRuntimes = () => {
    conversationRuntimeRef.current?.abort();
    conversationRuntimeRef.current = null;
  };

  const resetConversation = () => {
    resetRuntimes();
    setIsBusy(false);
    setError("");
    const resetEntry: ConversationCacheEntry = {
      messages: [createMessage("assistant", "Conversation reset. I am ready for a fresh request.", { status: "success" })],
      workflowSteps: []
    };
    const activeKey = getConversationKey(mode, selectedChatModel, selectedImageModel);

    conversationCacheRef.current[activeKey] = resetEntry;
    setWorkflowSteps(resetEntry.workflowSteps);
    setMessages(resetEntry.messages);
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
      setWorkflowSteps([
        {
          id: `image-step-${Date.now()}`,
          type: context.attachments.some((attachment) => attachment.type.startsWith("image/")) ? "image_edit" : "image_generate",
          title: "Image generation",
          prompt: trimmedValue,
          status: "running",
          startedAt: Date.now(),
          provider: selectedImageModel
        }
      ]);

      const result = await (
        requestAgentImage as unknown as (input: {
          config: {
            apiKey: string;
            baseUrl: string;
            chatEndpoint?: string;
            imageEndpoint?: string;
            chatModel: string;
            imageModel: string;
          };
          prompt: string;
          attachments: ComposerAttachment[];
          options?: AgentImageGenerationOptions;
          signal?: AbortSignal;
        }) => Promise<{ images: string[]; text: string; model: string }>
      )({
        config: {
          apiKey: runtimeConfig.apiKey,
          baseUrl: runtimeConfig.baseUrl,
          chatEndpoint: runtimeConfig.chatEndpoint,
          imageEndpoint: runtimeConfig.imageEndpoint,
          imageModel: selectedImageModel,
          chatModel: selectedChatModel
        },
        prompt: trimmedValue,
        attachments: context.attachments,
        options: {
          count: imageCount,
          resolution: imageResolution,
          size: imageSize
        }
      });

      setMessages((current) =>
        current.concat(
          createMessage("assistant", result.text, {
            status: "success",
            attachments: result.images.map((image, index) => ({
              id: `generated-image-${Date.now()}-${index}`,
              type: "image",
              url: image,
              name: `Generated ${index + 1}`,
              mimeType: "image/png"
            }))
          })
        )
      );
      setWorkflowSteps((current) =>
        current.map((step) => ({
          ...step,
          status: "success",
          completedAt: Date.now()
        }))
      );
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Request failed.";

      if ((requestError as Error).name === "AbortError") {
        setMessages((current) => current.concat(createMessage("system", "Generation stopped.", { status: "success" })));
        setWorkflowSteps((current) =>
          current.map((step) => ({
            ...step,
            status: "error",
            error: "Generation stopped.",
            completedAt: Date.now()
          }))
        );
      } else {
        setError(message);
        setMessages((current) => current.concat(createMessage("system", message, { status: "error" })));
        setWorkflowSteps((current) =>
          current.map((step) => ({
            ...step,
            status: "error",
            error: message,
            completedAt: Date.now()
          }))
        );
      }
    } finally {
      conversationRuntimeRef.current = null;
      setIsBusy(false);
      resetComposer();
    }
  };

  const handleStop = () => {
    conversationRuntimeRef.current?.abort();
  };

  const handleActionOptionChange = (id: string, value: string) => {
    if (id === "model") {
      if (mode === "chat") {
        switchConversation("chat", value, selectedImageModel);
      } else {
        switchConversation("image", selectedChatModel, value);
      }
      return;
    }

    if (id === "reasoning-speed") {
      setReasoningSpeed(value);
      return;
    }

    if (id === "image-count") {
      setImageCount(Math.max(1, Math.min(4, Number(value) || 1)));
      return;
    }

    if (id === "image-resolution") {
      setImageResolution(value as AgentImageResolution);
      return;
    }

    if (id === "image-size") {
      setImageSize(value as AgentImageSize);
    }
  };

  const handleCommandSelect = (item: { value: string }) => {
    if (item.value === "chat") {
      switchConversation("chat");
      return;
    }

    if (item.value === "image") {
      switchConversation("image");
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
          ? (uiConfig.chat.modelOptions?.length
              ? uiConfig.chat.modelOptions
              : [{ label: selectedChatModel, value: selectedChatModel }])
          : (uiConfig.image.modelOptions?.length
              ? uiConfig.image.modelOptions
              : [{ label: selectedImageModel, value: selectedImageModel }])
    },
    ...(mode === "chat" && uiConfig.chat.showReasoningSpeed
      ? [
          {
            id: "reasoning-speed",
            label: "Speed",
            value: reasoningSpeed,
            options: uiConfig.chat.reasoningSpeedOptions
          }
        ]
      : []),
    ...(mode === "image" && uiConfig.image.generationOptions.enabled
      ? [
          {
            id: "image-count",
            label: "Count",
            value: String(imageCount),
            options: uiConfig.image.generationOptions.countOptions!.map((item) => ({
              label: `${item}`,
              value: String(item)
            }))
          },
          {
            id: "image-resolution",
            label: "Resolution",
            value: imageResolution,
            options: uiConfig.image.generationOptions.resolutionOptions!.map((item) => ({
              label: item,
              value: item
            }))
          },
          {
            id: "image-size",
            label: "Size",
            value: imageSize,
            options: uiConfig.image.generationOptions.sizeOptions!.map((item) => ({
              label: item,
              value: item
            }))
          }
        ]
      : [])
  ];

  const activeModel = mode === "chat" ? selectedChatModel : selectedImageModel;
  const uploadOptions: UploadPluginOptions = {
    accept: ["image/*"],
    maxFiles: uiConfig.image.multiImage ? uiConfig.image.maxFiles : 1,
    maxFileSize: uiConfig.image.maxFileSize
  };

  useEffect(() => {
    setImageCount(uiConfig.image.generationOptions.count);
    setImageResolution(uiConfig.image.generationOptions.resolution);
    setImageSize(uiConfig.image.generationOptions.size);
  }, [
    uiConfig.image.generationOptions.count,
    uiConfig.image.generationOptions.resolution,
    uiConfig.image.generationOptions.size
  ]);

  useEffect(() => {
    const activeKey = getConversationKey(mode, selectedChatModel, selectedImageModel);

    conversationCacheRef.current[activeKey] = {
      messages,
      workflowSteps
    };

    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode,
        selectedChatModel,
        selectedImageModel,
        reasoningSpeed,
        conversations: conversationCacheRef.current
      } satisfies ConversationCachePayload)
    );
  }, [messages, mode, reasoningSpeed, selectedChatModel, selectedImageModel, workflowSteps]);

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
    modeSwitchConfig: uiConfig.modeSwitch,
    resetConversation,
    setMode: (nextMode: AgentMode) => switchConversation(nextMode),
    uploadOptions,
    workflowSteps
  };
}
