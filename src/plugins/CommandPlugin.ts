import { ContextManager } from "../core/ContextManager";
import type { ComposerCore } from "../core/ComposerCore";
import type { CommandCapability, CommandItem, ComposerContextItem, ComposerPlugin } from "../core/types";

export class CommandPlugin implements ComposerPlugin, CommandCapability {
  name = "command-plugin";
  private readonly contextManager = new ContextManager();
  private items: CommandItem[] = [];

  install(composer: ComposerCore): void {
    composer.registerCommandCapability(this);
  }

  setItems(items: CommandItem[]): void {
    this.items = items;
  }

  getSuggestions(query: string): ComposerContextItem[] {
    const normalizedQuery = query.trim().toLowerCase();
    const source = this.contextManager.normalizeCommandItems(this.items);

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
    return this.contextManager.applyToken(value, startIndex, endIndex, `/${item.value}`);
  }
}
