import {
  GPTProvider,
  MockChatProvider,
  MockImageProvider,
  type ChatProvider,
  type ImageProvider,
  type PromptOptimizerProvider,
  type WorkflowAnalyzerProvider
} from "@company/ai-composer-providers";
import {
  LegacyChatProvider,
  LegacyImageProvider,
  type LegacyAdapterConfig
} from "./legacy/LegacyAdapter";

export interface RuntimeProviderBundle {
  chat: ChatProvider;
  image: ImageProvider;
  workflowAnalyzer: WorkflowAnalyzerProvider;
  promptOptimizer: PromptOptimizerProvider;
}

export function createRuntimeProviderBundle(config: LegacyAdapterConfig): RuntimeProviderBundle {
  if (!config.apiKey) {
    const chat = new MockChatProvider();

    return {
      chat,
      image: new MockImageProvider(),
      workflowAnalyzer: chat,
      promptOptimizer: chat
    };
  }

  const analyzerProvider = new GPTProvider({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.chatModel,
    timeout: config.timeout,
    maxRetries: config.maxRetries
  });

  return {
    chat: new LegacyChatProvider(config),
    image: new LegacyImageProvider(config),
    workflowAnalyzer: analyzerProvider,
    promptOptimizer: analyzerProvider
  };
}
