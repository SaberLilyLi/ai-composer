import type { RuntimeEventName, RuntimeEventPayloadMap } from "@company/ai-composer-shared";

type RuntimeEventHandler<TKey extends RuntimeEventName> = (payload: RuntimeEventPayloadMap[TKey]) => void;

export class RuntimeEventBus {
  private handlers = new Map<RuntimeEventName, Set<(payload: unknown) => void>>();

  on<TKey extends RuntimeEventName>(event: TKey, handler: RuntimeEventHandler<TKey>): () => void {
    const handlers = this.handlers.get(event) ?? new Set<(payload: unknown) => void>();
    handlers.add(handler as (payload: unknown) => void);
    this.handlers.set(event, handlers);

    return () => this.off(event, handler);
  }

  once<TKey extends RuntimeEventName>(event: TKey, handler: RuntimeEventHandler<TKey>): () => void {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });

    return off;
  }

  off<TKey extends RuntimeEventName>(event: TKey, handler: RuntimeEventHandler<TKey>): void {
    const handlers = this.handlers.get(event);
    handlers?.delete(handler as (payload: unknown) => void);

    if (handlers?.size === 0) {
      this.handlers.delete(event);
    }
  }

  emit<TKey extends RuntimeEventName>(event: TKey, payload: RuntimeEventPayloadMap[TKey]): void {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }
}
