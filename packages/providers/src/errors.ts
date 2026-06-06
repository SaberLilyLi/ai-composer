export type ProviderErrorCode =
  | "NetworkError"
  | "AuthError"
  | "RateLimitError"
  | "ModelError"
  | "TimeoutError";

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(code: ProviderErrorCode, message: string, options: { status?: number; cause?: unknown } = {}) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.status = options.status;
    this.cause = options.cause;
  }
}

export function isProviderError(error: unknown): error is ProviderError {
  return error instanceof ProviderError;
}

export function mapHttpStatusToProviderError(status: number, message: string): ProviderError {
  if (status === 401 || status === 403) {
    return new ProviderError("AuthError", message, { status });
  }

  if (status === 429) {
    return new ProviderError("RateLimitError", message, { status });
  }

  if (status >= 400) {
    return new ProviderError("ModelError", message, { status });
  }

  return new ProviderError("NetworkError", message, { status });
}
