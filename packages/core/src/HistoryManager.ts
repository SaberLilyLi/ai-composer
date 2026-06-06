import type { Message } from "@company/ai-composer-shared";

export class HistoryManager {
  private items: Message[] = [];

  getMessages(): Message[] {
    return this.items;
  }

  append(message: Message): void {
    this.items = this.items.concat(message);
  }

  replace(messageId: string, nextMessage: Message): boolean {
    const index = this.items.findIndex((item) => item.id === messageId);

    if (index === -1) {
      return false;
    }

    this.items = this.items.map((item, currentIndex) => (currentIndex === index ? nextMessage : item));
    return true;
  }

  remove(messageId: string): boolean {
    const nextItems = this.items.filter((item) => item.id !== messageId);

    if (nextItems.length === this.items.length) {
      return false;
    }

    this.items = nextItems;
    return true;
  }

  clear(): void {
    this.items = [];
  }
}
