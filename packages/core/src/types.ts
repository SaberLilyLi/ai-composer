import type { CommandItem, ComposerActionOption, ComposerAttachment, ComposerContextItem, ComposerContextMode, ComposerPhase, MentionItem, UploadPluginOptions } from "@company/ai-composer-shared";
import type { ComposerCore } from "./ComposerCore";

export type {
  CommandItem,
  ComposerActionOption,
  ComposerAttachment,
  ComposerContextItem,
  ComposerContextMode,
  ComposerPhase,
  MentionItem,
  UploadPluginOptions
};

export interface ComposerState {
  value: string;
  phase: ComposerPhase;
  disabled: boolean;
  attachments: ComposerAttachment[];
  context: ComposerContextState;
}

export interface ComposerOptions {
  value?: string;
  disabled?: boolean;
  attachments?: ComposerAttachment[];
}

export interface ComposerListener {
  (state: ComposerState): void;
}

export interface UploadError {
  file?: File;
  message: string;
}

export interface AddAttachmentsResult {
  added: ComposerAttachment[];
  errors: UploadError[];
}

export interface ComposerContextState {
  mode: ComposerContextMode;
  query: string;
  startIndex: number;
  endIndex: number;
  highlightedIndex: number;
  isOpen: boolean;
  suggestions: ComposerContextItem[];
}

export interface ComposerPlugin {
  name: string;
  install(composer: ComposerCore): void;
}

export interface UploadCapability {
  setOptions(options: UploadPluginOptions): void;
  addFiles(files: File[], existingAttachments: ComposerAttachment[]): AddAttachmentsResult;
  revokeAttachment(attachment: ComposerAttachment): void;
  revokeAll(attachments: ComposerAttachment[]): void;
}

export interface MentionCapability {
  setItems(items: MentionItem[]): void;
  getSuggestions(query: string): ComposerContextItem[];
  applySelection(value: string, startIndex: number, endIndex: number, item: ComposerContextItem): string;
}

export interface CommandCapability {
  setItems(items: CommandItem[]): void;
  getSuggestions(query: string): ComposerContextItem[];
  applySelection(value: string, startIndex: number, endIndex: number, item: ComposerContextItem): string;
}
