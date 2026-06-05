import { EventBus } from "./EventBus";
import { Store } from "./Store";
import { ContextManager } from "./ContextManager";
import type {
  AddAttachmentsResult,
  CommandCapability,
  CommandItem,
  ComposerAttachment,
  ComposerContextItem,
  ComposerContextState,
  ComposerListener,
  ComposerOptions,
  ComposerPhase,
  ComposerPlugin,
  ComposerState,
  MentionCapability,
  MentionItem,
  UploadCapability,
  UploadPluginOptions
} from "./types";

interface ComposerCoreEvents {
  send: { value: string; attachments: ComposerAttachment[] };
  stop: undefined;
  attachmentsChange: { attachments: ComposerAttachment[] };
  attachmentError: { message: string; file?: File };
  mentionSelect: { item: ComposerContextItem };
  commandSelect: { item: ComposerContextItem };
}

const initialContextState: ComposerContextState = {
  mode: "none",
  query: "",
  startIndex: -1,
  endIndex: -1,
  highlightedIndex: 0,
  isOpen: false,
  suggestions: []
};

const createInitialState = (options: ComposerOptions = {}): ComposerState => ({
  value: options.value ?? "",
  phase: "idle",
  disabled: options.disabled ?? false,
  attachments: options.attachments ?? [],
  context: initialContextState
});

export class ComposerCore {
  private readonly store: Store;
  private readonly events = new EventBus<ComposerCoreEvents>();
  private readonly contextManager = new ContextManager();
  private uploadCapability: UploadCapability | null = null;
  private mentionCapability: MentionCapability | null = null;
  private commandCapability: CommandCapability | null = null;

  constructor(options: ComposerOptions = {}) {
    this.store = new Store(createInitialState(options));
  }

  getState(): ComposerState {
    return this.store.getState();
  }

  subscribe(listener: ComposerListener): () => void {
    return this.store.subscribe(listener);
  }

  onSend(handler: (payload: { value: string; attachments: ComposerAttachment[] }) => void): () => void {
    return this.events.on("send", handler);
  }

  onStop(handler: () => void): () => void {
    return this.events.on("stop", handler);
  }

  onAttachmentsChange(handler: (payload: { attachments: ComposerAttachment[] }) => void): () => void {
    return this.events.on("attachmentsChange", handler);
  }

  onAttachmentError(handler: (payload: { message: string; file?: File }) => void): () => void {
    return this.events.on("attachmentError", handler);
  }

  onMentionSelect(handler: (payload: { item: ComposerContextItem }) => void): () => void {
    return this.events.on("mentionSelect", handler);
  }

  onCommandSelect(handler: (payload: { item: ComposerContextItem }) => void): () => void {
    return this.events.on("commandSelect", handler);
  }

  use(plugin: ComposerPlugin): void {
    plugin.install(this);
  }

  registerUploadCapability(capability: UploadCapability): void {
    this.uploadCapability = capability;
  }

  registerMentionCapability(capability: MentionCapability): void {
    this.mentionCapability = capability;
  }

  registerCommandCapability(capability: CommandCapability): void {
    this.commandCapability = capability;
  }

  setMentionItems(items: MentionItem[]): void {
    this.mentionCapability?.setItems(items);
    this.refreshContextSuggestions();
  }

  setCommandItems(items: CommandItem[]): void {
    this.commandCapability?.setItems(items);
    this.refreshContextSuggestions();
  }

  setValue(value: string): void {
    this.store.setState({
      ...this.store.getState(),
      value
    });
  }

  setDisabled(disabled: boolean): void {
    this.store.setState({
      ...this.store.getState(),
      disabled
    });
  }

  setPhase(phase: ComposerPhase): void {
    this.store.setState({
      ...this.store.getState(),
      phase
    });
  }

  syncContext(value: string, cursorIndex: number): void {
    const match = this.contextManager.findTriggerMatch(value, cursorIndex);

    if (!match) {
      this.closeContext();
      return;
    }

    const suggestions = this.getSuggestions(match.mode, match.query);
    this.store.setState({
      ...this.store.getState(),
      context: {
        mode: match.mode,
        query: match.query,
        startIndex: match.startIndex,
        endIndex: match.endIndex,
        highlightedIndex: 0,
        isOpen: suggestions.length > 0,
        suggestions
      }
    });
  }

  moveContextSelection(direction: "up" | "down"): boolean {
    const state = this.store.getState();
    const { context } = state;

    if (!context.isOpen || context.suggestions.length === 0) {
      return false;
    }

    const step = direction === "down" ? 1 : -1;
    const nextIndex =
      (context.highlightedIndex + step + context.suggestions.length) % context.suggestions.length;

    this.store.setState({
      ...state,
      context: {
        ...context,
        highlightedIndex: nextIndex
      }
    });

    return true;
  }

  selectContextItem(): ComposerContextItem | null {
    const state = this.store.getState();
    const { context } = state;

    if (!context.isOpen || context.suggestions.length === 0) {
      return null;
    }

    const item = context.suggestions[context.highlightedIndex];
    const nextValue =
      context.mode === "mention"
        ? this.mentionCapability?.applySelection(state.value, context.startIndex, context.endIndex, item)
        : this.commandCapability?.applySelection(state.value, context.startIndex, context.endIndex, item);

    if (!nextValue) {
      return null;
    }

    this.store.setState({
      ...state,
      value: nextValue,
      context: initialContextState
    });

    if (item.kind === "mention") {
      this.events.emit("mentionSelect", { item });
    } else {
      this.events.emit("commandSelect", { item });
    }

    return item;
  }

  closeContext(): void {
    const state = this.store.getState();
    if (!state.context.isOpen && state.context.mode === "none") {
      return;
    }

    this.store.setState({
      ...state,
      context: initialContextState
    });
  }

  setAttachments(attachments: ComposerAttachment[]): void {
    this.store.setState({
      ...this.store.getState(),
      attachments
    });
    this.events.emit("attachmentsChange", { attachments });
  }

  setUploadConstraints(options: UploadPluginOptions): void {
    this.uploadCapability?.setOptions(options);
  }

  addAttachments(files: File[]): AddAttachmentsResult {
    if (!this.uploadCapability) {
      const result = {
        added: [],
        errors: files.map((file) => ({
          file,
          message: "Upload capability is not installed."
        }))
      };
      result.errors.forEach((error) => {
        this.events.emit("attachmentError", error);
      });
      return result;
    }

    const state = this.store.getState();
    const result = this.uploadCapability.addFiles(files, state.attachments);
    const nextAttachments = state.attachments.concat(result.added);

    this.setAttachments(nextAttachments);
    result.errors.forEach((error) => {
      this.events.emit("attachmentError", error);
    });

    return result;
  }

  removeAttachment(id: string): boolean {
    const state = this.store.getState();
    const attachment = state.attachments.find((item) => item.id === id);

    if (!attachment) {
      return false;
    }

    this.uploadCapability?.revokeAttachment(attachment);
    this.setAttachments(state.attachments.filter((item) => item.id !== id));
    return true;
  }

  clearAttachments(): void {
    const attachments = this.store.getState().attachments;
    this.uploadCapability?.revokeAll(attachments);
    this.setAttachments([]);
  }

  send(): string | null {
    const state = this.store.getState();
    const nextValue = state.value.trim();

    if (!nextValue || state.disabled || state.phase === "generating") {
      return null;
    }

    this.store.setState({
      ...state,
      phase: "generating"
    });
    this.events.emit("send", { value: nextValue, attachments: state.attachments });
    return nextValue;
  }

  stop(): boolean {
    const state = this.store.getState();
    if (state.phase !== "generating") {
      return false;
    }

    this.store.setState({
      ...state,
      phase: "idle"
    });
    this.events.emit("stop", undefined);
    return true;
  }

  reset(): void {
    this.uploadCapability?.revokeAll(this.store.getState().attachments);
    this.store.setState(createInitialState());
  }

  private getSuggestions(mode: "mention" | "command", query: string): ComposerContextItem[] {
    if (mode === "mention") {
      return this.mentionCapability?.getSuggestions(query) ?? [];
    }

    return this.commandCapability?.getSuggestions(query) ?? [];
  }

  private refreshContextSuggestions(): void {
    const state = this.store.getState();
    const { context } = state;

    if (!context.isOpen || context.mode === "none") {
      return;
    }

    const suggestions = this.getSuggestions(context.mode, context.query);
    this.store.setState({
      ...state,
      context: {
        ...context,
        suggestions,
        highlightedIndex: Math.min(context.highlightedIndex, Math.max(suggestions.length - 1, 0)),
        isOpen: suggestions.length > 0
      }
    });
  }
}
