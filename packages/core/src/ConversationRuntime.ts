import type { ChatProvider } from "@company/ai-composer-providers";
import type { Message } from "@company/ai-composer-shared";
import { EventBus } from "./EventBus";
import { ConversationEngine } from "./ConversationEngine";
import { RuntimeEventBus } from "./events";

export type ConversationRuntimeStatus = "idle" | "streaming" | "success" | "error" | "aborted";

export interface ConversationRuntimeState {
  status: ConversationRuntimeStatus;
  messages: Message[];
  error?: string;
  lastInput?: string;
}

interface ConversationRuntimeEvents {
  start: { message: Message };
  message: { message: Message };
  streaming: { message: Message };
  error: { error: Error };
  complete: { message: Message };
  abort: undefined;
}

export class ConversationRuntime {
  private readonly conversation = new ConversationEngine();
  private readonly events = new EventBus<ConversationRuntimeEvents>();
  readonly runtimeEvents = new RuntimeEventBus();
  private controller: AbortController | null = null;
  private state: ConversationRuntimeState = {
    status: "idle",
    messages: []
  };

  constructor(private readonly chatProvider: ChatProvider) {}

  getState(): ConversationRuntimeState {
    return this.state;
  }

  onStart(handler: (payload: { message: Message }) => void) {
    return this.events.on("start", handler);
  }

  onMessage(handler: (payload: { message: Message }) => void) {
    return this.events.on("message", handler);
  }

  onStreaming(handler: (payload: { message: Message }) => void) {
    return this.events.on("streaming", handler);
  }

  onError(handler: (payload: { error: Error }) => void) {
    return this.events.on("error", handler);
  }

  onComplete(handler: (payload: { message: Message }) => void) {
    return this.events.on("complete", handler);
  }

  onAbort(handler: () => void) {
    return this.events.on("abort", handler);
  }

  async send(content: string): Promise<Message> {
    this.controller = new AbortController();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      createdAt: Date.now(),
      status: "success"
    };

    this.conversation.addMessage(userMessage);
    const streamingMessage: Message = {
      id: `assistant-stream-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      status: "streaming"
    };
    this.state = {
      status: "streaming",
      messages: this.conversation.getMessages().concat(streamingMessage),
      lastInput: content
    };
    this.events.emit("start", { message: userMessage });
    this.events.emit("message", { message: userMessage });
    this.runtimeEvents.emit("conversation:start", { message: userMessage });
    this.runtimeEvents.emit("conversation:message", { message: userMessage });
    this.events.emit("streaming", { message: streamingMessage });
    this.runtimeEvents.emit("conversation:message", { message: streamingMessage });

    try {
      const result = this.chatProvider.stream
        ? await this.sendWithStream(this.controller.signal, streamingMessage)
        : await this.chatProvider.chat({
          messages: this.conversation.getMessages(),
          signal: this.controller.signal
        });
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.text,
        createdAt: Date.now(),
        status: "success"
      };

      this.conversation.addMessage(assistantMessage);
      this.state = {
        status: "success",
        messages: this.conversation.getMessages(),
        lastInput: content
      };
      this.events.emit("complete", { message: assistantMessage });
      this.events.emit("message", { message: assistantMessage });
      this.runtimeEvents.emit("conversation:complete", { message: assistantMessage });
      this.runtimeEvents.emit("conversation:message", { message: assistantMessage });
      return assistantMessage;
    } catch (error) {
      const runtimeError = error instanceof Error ? error : new Error("Conversation request failed.");
      this.state = {
        status: this.controller.signal.aborted ? "aborted" : "error",
        messages: this.controller.signal.aborted ? this.conversation.getMessages() : this.conversation.getMessages().concat({
          ...streamingMessage,
          status: "error",
          content: runtimeError.message
        }),
        error: runtimeError.message,
        lastInput: content
      };

      if (this.controller.signal.aborted) {
        this.events.emit("abort", undefined);
      } else {
        this.events.emit("error", { error: runtimeError });
      }

      throw runtimeError;
    } finally {
      this.controller = null;
    }
  }

  abort(): void {
    this.controller?.abort();
    this.state = {
      ...this.state,
      status: "aborted"
    };
    this.events.emit("abort", undefined);
  }

  retry(): Promise<Message> {
    if (!this.state.lastInput) {
      throw new Error("No conversation input is available to retry.");
    }

    return this.send(this.state.lastInput);
  }

  private async sendWithStream(signal: AbortSignal, streamingMessage: Message): Promise<{ text: string; model: string }> {
    let text = "";

    for await (const chunk of this.chatProvider.stream?.({ messages: this.conversation.getMessages(), signal }) ?? []) {
      text += chunk.content;
      streamingMessage.content = text;
      this.state = {
        ...this.state,
        status: "streaming",
        messages: this.conversation.getMessages().concat({ ...streamingMessage })
      };
      this.events.emit("streaming", { message: { ...streamingMessage } });
      this.runtimeEvents.emit("conversation:message", { message: { ...streamingMessage } });

      if (chunk.done) {
        break;
      }
    }

    return {
      text,
      model: this.chatProvider.getCapability?.().provider ?? "stream"
    };
  }
}
