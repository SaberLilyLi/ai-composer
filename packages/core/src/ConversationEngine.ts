import type { Message } from "@company/ai-composer-shared";
import { HistoryManager } from "./HistoryManager";

export class ConversationEngine {
  private readonly history = new HistoryManager();

  getMessages(): Message[] {
    return this.history.getMessages();
  }

  addMessage(message: Message): void {
    this.history.append(message);
  }

  updateMessage(messageId: string, update: Partial<Message>): boolean {
    const current = this.history.getMessages().find((message) => message.id === messageId);

    if (!current) {
      return false;
    }

    return this.history.replace(messageId, { ...current, ...update });
  }

  retryMessage(messageId: string): Message | null {
    const current = this.history.getMessages().find((message) => message.id === messageId);

    if (!current) {
      return null;
    }

    const retryMessage = {
      ...current,
      id: `${messageId}-retry-${Date.now()}`,
      status: "pending" as const,
      createdAt: Date.now()
    };

    this.history.append(retryMessage);
    return retryMessage;
  }

  deleteMessage(messageId: string): boolean {
    return this.history.remove(messageId);
  }

  switchConversation(messages: Message[]): void {
    this.history.clear();
    messages.forEach((message) => this.history.append(message));
  }
}
