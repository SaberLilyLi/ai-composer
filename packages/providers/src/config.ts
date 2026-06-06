export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  timeout?: number;
  maxRetries?: number;
  provider?: "openai" | "openrouter" | "compatible";
}

export interface ResolvedProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
  maxRetries: number;
  provider: "openai" | "openrouter" | "compatible";
}

export function resolveProviderConfig(config: ProviderConfig): ResolvedProviderConfig {
  return {
    apiKey: config.apiKey,
    baseUrl: (config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, ""),
    model: config.model,
    timeout: config.timeout ?? 30000,
    maxRetries: config.maxRetries ?? 2,
    provider: config.provider ?? "compatible"
  };
}
