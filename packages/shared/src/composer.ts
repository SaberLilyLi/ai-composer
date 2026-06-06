export type ComposerPhase = "idle" | "generating";
export type AttachmentStatus = "ready" | "invalid";
export type ComposerContextMode = "none" | "mention" | "command";

export interface Attachment {
  id: string;
  type: "image" | "video" | "audio" | "file" | "avatar";
  url: string;
  name?: string;
  mimeType?: string;
}

export interface ComposerAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  status: AttachmentStatus;
  error?: string;
}

export interface UploadPluginOptions {
  accept?: string[];
  maxFiles?: number;
  maxFileSize?: number;
}

export interface UploadError {
  file?: File;
  message: string;
}

export interface AddAttachmentsResult {
  added: ComposerAttachment[];
  errors: UploadError[];
}

export interface MentionItem {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface CommandItem {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface ComposerContextItem {
  id: string;
  label: string;
  value: string;
  description?: string;
  kind: "mention" | "command";
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

export interface ComposerActionOptionChoice {
  label: string;
  value: string;
}

export interface ComposerActionOption {
  id: string;
  label: string;
  value: string;
  options: ComposerActionOptionChoice[];
}
