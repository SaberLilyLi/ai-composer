import type { CommandItem, ComposerContextItem, MentionItem } from "./types";

export interface TriggerMatch {
  mode: "mention" | "command";
  query: string;
  startIndex: number;
  endIndex: number;
}

export class ContextManager {
  findTriggerMatch(value: string, cursorIndex: number): TriggerMatch | null {
    const beforeCursor = value.slice(0, cursorIndex);
    const atIndex = beforeCursor.lastIndexOf("@");
    const slashIndex = beforeCursor.lastIndexOf("/");
    const triggerIndex = Math.max(atIndex, slashIndex);

    if (triggerIndex === -1) {
      return null;
    }

    const mode = beforeCursor[triggerIndex] === "@" ? "mention" : "command";
    const previousCharacter = triggerIndex > 0 ? beforeCursor[triggerIndex - 1] : " ";
    if (triggerIndex > 0 && !/\s/.test(previousCharacter)) {
      return null;
    }

    const query = beforeCursor.slice(triggerIndex + 1);
    if (/\s/.test(query)) {
      return null;
    }

    return {
      mode,
      query,
      startIndex: triggerIndex,
      endIndex: cursorIndex
    };
  }

  normalizeMentionItems(items: MentionItem[]): ComposerContextItem[] {
    return items.map((item) => ({
      ...item,
      kind: "mention"
    }));
  }

  normalizeCommandItems(items: CommandItem[]): ComposerContextItem[] {
    return items.map((item) => ({
      ...item,
      kind: "command"
    }));
  }

  applyToken(value: string, startIndex: number, endIndex: number, replacement: string): string {
    const prefix = value.slice(0, startIndex);
    const suffix = value.slice(endIndex);
    const spacer = suffix.startsWith(" ") || suffix.length === 0 ? "" : " ";
    return `${prefix}${replacement}${spacer}${suffix}`;
  }
}
