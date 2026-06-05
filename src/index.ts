import "./styles/index.css";

export { AiComposer } from "./components/AiComposer";
export type { AiComposerProps } from "./components/AiComposer";
export { ComposerCore } from "./core/ComposerCore";
export { ContextManager } from "./core/ContextManager";
export { UploadManager } from "./core/UploadManager";
export { CommandPlugin } from "./plugins/CommandPlugin";
export { MentionPlugin } from "./plugins/MentionPlugin";
export { UploadPlugin } from "./plugins/UploadPlugin";
export type {
  CommandItem,
  ComposerAttachment,
  ComposerContextItem,
  ComposerContextMode,
  ComposerPhase,
  ComposerPlugin,
  ComposerState,
  MentionItem,
  UploadPluginOptions
} from "./core/types";
export { createReactAdapter } from "./adapters/react";
export { createVueAdapter } from "./adapters/vue";
