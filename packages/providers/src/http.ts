import type { ResolvedProviderConfig } from "./config";
import { ProviderError, isProviderError, mapHttpStatusToProviderError } from "./errors";

export interface ProviderRequestOptions {
  method?: "GET" | "POST";
  path: string;
  body?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
}

function isRetryable(error: unknown): boolean {
  if (!isProviderError(error)) {
    return true;
  }

  return error.code === "NetworkError" || error.code === "RateLimitError" || error.code === "TimeoutError";
}

function createSignal(timeout: number, upstreamSignal?: AbortSignal): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new ProviderError("TimeoutError", "Provider request timed out.")), timeout);

  const abortFromUpstream = () => {
    controller.abort(upstreamSignal?.reason);
  };

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      abortFromUpstream();
    } else {
      upstreamSignal.addEventListener("abort", abortFromUpstream, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      upstreamSignal?.removeEventListener("abort", abortFromUpstream);
    }
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return data?.error?.message || data?.message || `Provider request failed with status ${response.status}.`;
}

async function requestOnce<TResponse>(
  config: ResolvedProviderConfig,
  options: ProviderRequestOptions
): Promise<TResponse> {
  const { signal, cleanup } = createSignal(config.timeout, options.signal);

  try {
    const response = await fetch(`${config.baseUrl}${options.path}`, {
      method: options.method ?? "POST",
      headers: options.formData
        ? {
            Authorization: `Bearer ${config.apiKey}`
          }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`
          },
      body: options.formData ?? (typeof options.body === "undefined" ? undefined : JSON.stringify(options.body)),
      signal
    });

    if (!response.ok) {
      throw mapHttpStatusToProviderError(response.status, await parseErrorMessage(response));
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    if (isProviderError(error)) {
      throw error;
    }

    if ((error as Error).name === "AbortError") {
      throw new ProviderError("TimeoutError", "Provider request timed out.", { cause: error });
    }

    throw new ProviderError("NetworkError", error instanceof Error ? error.message : "Network request failed.", {
      cause: error
    });
  } finally {
    cleanup();
  }
}

export async function providerRequest<TResponse>(
  config: ResolvedProviderConfig,
  options: ProviderRequestOptions
): Promise<TResponse> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    try {
      return await requestOnce<TResponse>(config, options);
    } catch (error) {
      lastError = error;

      if (attempt >= config.maxRetries || !isRetryable(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}
