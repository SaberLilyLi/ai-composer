import { ContextManager } from "../ContextManager";
import type { ComposerCore } from "../ComposerCore";
import type { ComposerContextItem, ComposerPlugin, MentionCapability, MentionItem } from "../types";

export class MentionPlugin implements ComposerPlugin, MentionCapability {
  name = "mention-plugin";
  private readonly contextManager = new ContextManager();
  private items: MentionItem[] = [];

  install(composer: ComposerCore): void {
    composer.registerMentionCapability(this);
  }

  setItems(items: MentionItem[]): void {
    this.items = items;
  }

  getSuggestions(query: string): ComposerContextItem[] {
    const normalizedQuery = query.trim().toLowerCase();
    const source = this.contextManager.normalizeMentionItems(this.items);

    if (!normalizedQuery) {
      return source;
    }

    return source.filter((item) => {
      return (
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.value.toLowerCase().includes(normalizedQuery)
      );
    });
  }

  applySelection(value: string, startIndex: number, endIndex: number, item: ComposerContextItem): string {
    return this.contextManager.applyToken(value, startIndex, endIndex, `@${item.value}`);
  }
}
