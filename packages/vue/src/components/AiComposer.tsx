import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties, type PropType } from "vue";
import {
  CommandPlugin,
  ComposerCore,
  MentionPlugin,
  UploadPlugin,
  type CommandItem,
  type ComposerActionOption,
  type ComposerAttachment,
  type ComposerContextItem,
  type ComposerState,
  type ComposerTheme,
  type MentionItem,
  type UploadPluginOptions
} from "@company/ai-composer-core";

export interface VueAiComposerProps {
  value?: string;
  defaultValue?: string;
  defaultAttachments?: ComposerAttachment[];
  attachments?: ComposerAttachment[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  minRows?: number;
  maxRows?: number;
  theme?: ComposerTheme;
  uploadOptions?: UploadPluginOptions;
  mentions?: MentionItem[];
  commands?: CommandItem[];
  showActionOptions?: boolean;
  showStopButton?: boolean;
  showStatusText?: boolean;
  statusText?: string;
  statusTextMap?: Partial<Record<ComposerState["phase"], string>>;
  actionHint?: string;
  actionOptions?: ComposerActionOption[];
  onAttachmentsChange?: (attachments: ComposerAttachment[]) => void;
  onAttachmentError?: (message: string, file?: File) => void;
  onMentionSelect?: (item: MentionItem) => void;
  onCommandSelect?: (item: CommandItem) => void;
}

const DEFAULT_PLACEHOLDER = "输入想法、脚本，'/' 使用技能，@ 调用参考，和 Agent 一起创作";

function toItemPayload(item: ComposerContextItem) {
  return {
    id: item.id,
    label: item.label,
    value: item.value,
    description: item.description
  };
}

function isThenable(value: unknown): value is Promise<unknown> {
  return Boolean(value && typeof value === "object" && "then" in value);
}

function renderAttachmentLabel(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 2).toUpperCase() : "AI";
}

const IMAGE_TRAY_ANGLES = [10, -8, 6, -5, 4, -3];
const IMAGE_TRAY_LEFT = 24;
const IMAGE_TRAY_TOP = 18;
const IMAGE_TRAY_GAP = 68;
const IMAGE_TRAY_CARD_WIDTH = 62;
const IMAGE_TRAY_CARD_HEIGHT = 76;
const IMAGE_TRAY_UPLOAD_SIZE = 41;
const IMAGE_TRAY_ACTIVE_PADDING_X = 42;
const IMAGE_TRAY_ACTIVE_PADDING_TOP = 52;
const IMAGE_TRAY_ACTIVE_PADDING_BOTTOM = 36;

function isImageAttachment(attachment: ComposerAttachment): boolean {
  return attachment.type.startsWith("image/") || Boolean(attachment.previewUrl);
}

function getImageTrayLeft(index: number): number {
  return IMAGE_TRAY_LEFT + index * IMAGE_TRAY_GAP;
}

function getImageTrayAngle(index: number): number {
  return IMAGE_TRAY_ANGLES[index] ?? (index % 2 === 0 ? 4 : -4);
}

function getImageCardStyle(index: number, count: number, isExpanded: boolean, isHovered: boolean): CSSProperties {
  const angle = getImageTrayAngle(index);
  const translateY = isHovered ? -16 : isExpanded ? -3 : 0;
  const scale = isHovered ? 1.2 : 1;
  return {
    position: "absolute",
    left: `${isExpanded ? getImageTrayLeft(index) : IMAGE_TRAY_LEFT}px`,
    top: `${IMAGE_TRAY_TOP}px`,
    width: `${IMAGE_TRAY_CARD_WIDTH}px`,
    height: `${IMAGE_TRAY_CARD_HEIGHT}px`,
    borderRadius: "4px",
    overflow: "visible",
    background: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.86)",
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.24), 0 2px 6px rgba(0, 0, 0, 0.16)",
    transformOrigin: "center center",
    transform: `translateY(${translateY}px) rotate(${angle}deg) scale(${scale})`,
    transition:
      "left 0.45s cubic-bezier(.22, 1, .36, 1), top 0.45s cubic-bezier(.22, 1, .36, 1), transform 0.45s cubic-bezier(.22, 1, .36, 1), box-shadow 0.25s ease, opacity 0.25s ease",
    transitionDelay: isExpanded ? `${index * 35}ms` : `${(count - index) * 20}ms`,
    cursor: "pointer",
    zIndex: isHovered ? 120 : index + 1
  };
}

function getImageUploadStyle(count: number, isExpanded: boolean): CSSProperties {
  const uploadAngle = -getImageTrayAngle(count - 1);
  return {
    position: "absolute",
    left: `${isExpanded ? getImageTrayLeft(count) : 69}px`,
    top: `${isExpanded ? IMAGE_TRAY_TOP : 53}px`,
    width: `${isExpanded ? IMAGE_TRAY_CARD_WIDTH : IMAGE_TRAY_UPLOAD_SIZE}px`,
    height: `${isExpanded ? IMAGE_TRAY_CARD_HEIGHT : IMAGE_TRAY_UPLOAD_SIZE}px`,
    borderRadius: isExpanded ? "4px" : "50%",
    border: isExpanded ? "1px dashed rgba(148,163,184,0.35)" : "none",
    background: isExpanded ? "#2a3242" : "#4b5563",
    color: isExpanded ? "#8ea0c2" : "#fff",
    fontSize: isExpanded ? "34px" : "24px",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    transition:
      "left 0.45s cubic-bezier(.22, 1, .36, 1), top 0.45s cubic-bezier(.22, 1, .36, 1), width 0.38s cubic-bezier(.22, 1, .36, 1), height 0.38s cubic-bezier(.22, 1, .36, 1), border-radius 0.38s cubic-bezier(.22, 1, .36, 1), transform 0.45s cubic-bezier(.22, 1, .36, 1), background 0.25s ease, border 0.25s ease, color 0.25s ease",
    transitionDelay: isExpanded ? `${count * 35}ms` : "0ms",
    transform: isExpanded ? `translateY(-3px) rotate(${uploadAngle}deg)` : "rotate(0deg)"
  };
}

function getImageRemoveStyle(isExpanded: boolean, isHovered: boolean): CSSProperties {
  return {
    position: "absolute",
    right: "-10px",
    top: "-10px",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(49, 58, 75, 0.72)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 140,
    opacity: isExpanded || isHovered ? 1 : 0,
    backdropFilter: "blur(6px)",
    cursor: "pointer",
    pointerEvents: isExpanded || isHovered ? "auto" : "none",
    transition: "opacity 0.18s ease, transform 0.18s ease",
    transform: isHovered ? "scale(1.08)" : "scale(1)"
  };
}

function getEmptyImageUploadStyle(): CSSProperties {
  return {
    position: "absolute",
    left: `${IMAGE_TRAY_LEFT}px`,
    top: `${IMAGE_TRAY_TOP}px`,
    width: `${IMAGE_TRAY_CARD_WIDTH}px`,
    height: `${IMAGE_TRAY_CARD_HEIGHT}px`,
    borderRadius: "4px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px dashed rgba(148, 163, 184, 0.38)",
    color: "#8ea0c2",
    fontSize: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(8deg)",
    cursor: "pointer",
    outline: "none",
    appearance: "none"
  };
}

function getImageNameBadgeStyle(isVisible: boolean): CSSProperties {
  return {
    position: "absolute",
    left: "50%",
    top: "-28px",
    zIndex: 10,
    width: "max-content",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    borderRadius: "4px",
    background: "rgba(2, 6, 23, 0.82)",
    color: "#fff",
    fontSize: "10px",
    fontWeight: 500,
    lineHeight: "16px",
    padding: "2px 6px",
    textAlign: "center",
    transform: "translateX(-50%)",
    opacity: isVisible ? 1 : 0,
    pointerEvents: "none",
    transition: "opacity 0.15s ease"
  };
}

export const AiComposer = defineComponent({
  name: "AiComposer",
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: "" },
    defaultAttachments: { type: Array as PropType<ComposerAttachment[]>, default: () => [] },
    attachments: { type: Array as PropType<ComposerAttachment[]>, default: undefined },
    placeholder: { type: String, default: DEFAULT_PLACEHOLDER },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    autoFocus: { type: Boolean, default: false },
    minRows: { type: Number, default: 3 },
    maxRows: { type: Number, default: 8 },
    theme: { type: String as PropType<ComposerTheme>, default: "auto" },
    uploadOptions: { type: Object as PropType<UploadPluginOptions>, default: () => ({}) },
    mentions: { type: Array as PropType<MentionItem[]>, default: () => [] },
    commands: { type: Array as PropType<CommandItem[]>, default: () => [] },
    showActionOptions: { type: Boolean, default: false },
    showStopButton: { type: Boolean, default: false },
    showStatusText: { type: Boolean, default: false },
    statusText: { type: String, default: undefined },
    statusTextMap: { type: Object as PropType<Partial<Record<ComposerState["phase"], string>>>, default: undefined },
    actionHint: { type: String, default: undefined },
    actionOptions: { type: Array as PropType<ComposerActionOption[]>, default: undefined },
    onSend: { type: Function as PropType<(value: string, context: { attachments: ComposerAttachment[] }) => void | Promise<void>>, default: undefined },
    onStop: { type: Function as PropType<() => void>, default: undefined },
    onChange: { type: Function as PropType<(value: string) => void>, default: undefined },
    onActionOptionChange: { type: Function as PropType<(id: string, value: string) => void>, default: undefined },
    onAttachmentsChange: { type: Function as PropType<(attachments: ComposerAttachment[]) => void>, default: undefined },
    onAttachmentError: { type: Function as PropType<(message: string, file?: File) => void>, default: undefined },
    onMentionSelect: { type: Function as PropType<(item: MentionItem) => void>, default: undefined },
    onCommandSelect: { type: Function as PropType<(item: CommandItem) => void>, default: undefined }
  },
  emits: [
    "update:value",
    "change",
    "send",
    "stop",
    "attachments-change",
    "attachment-error",
    "mention-select",
    "command-select",
    "action-option-change"
  ],
  setup(props, { emit }) {
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const imageTrayRef = ref<HTMLDivElement | null>(null);
    const isImageTrayExpanded = ref(false);
    const hoveredImageId = ref<string | null>(null);
    const previewAttachment = ref<ComposerAttachment | null>(null);
    const core = new ComposerCore({
      value: props.value ?? props.defaultValue ?? "",
      disabled: props.disabled || props.loading,
      attachments: props.defaultAttachments
    });

    core.use(new UploadPlugin(props.uploadOptions));
    core.use(new MentionPlugin());
    core.use(new CommandPlugin());
    core.setMentionItems(props.mentions);
    core.setCommandItems(props.commands);

    const state = ref<ComposerState>(core.getState());
    const isControlled = computed(() => typeof props.value === "string");
    const canSend = computed(() => state.value.value.trim().length > 0 && state.value.phase !== "generating" && !state.value.disabled);
    const canStop = computed(() => props.showStopButton && (state.value.phase === "generating" || props.loading));
    const imageAttachmentCount = computed(
      () => state.value.attachments.filter((attachment) => attachment.type.startsWith("image/") || attachment.previewUrl).length
    );
    const imageAttachments = computed(() => state.value.attachments.filter(isImageAttachment));
    const visibleActionOptions = computed<ComposerActionOption[]>(
      () =>
        props.actionOptions ?? [
          {
            id: "model",
            label: "模型",
            value: "default",
            options: [{ label: "Default", value: "default" }]
          }
        ]
    );
    const statusText = computed(() => props.statusText ?? props.statusTextMap?.[state.value.phase] ?? (state.value.phase === "generating" || props.loading ? "Generating..." : "Ready"));

    const resizeTextarea = () => {
      const element = textareaRef.value;
      if (!element) {
        return;
      }

      element.style.height = "auto";
      const computedStyles = window.getComputedStyle(element);
      const parsedLineHeight = Number.parseFloat(computedStyles.lineHeight);
      const lineHeight = Number.isNaN(parsedLineHeight) ? 24 : parsedLineHeight;
      const minHeight = props.minRows * lineHeight;
      const maxHeight = props.maxRows * lineHeight;
      const nextHeight = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight);

      element.style.height = `${nextHeight}px`;
      element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
    };

    const setValue = (nextValue: string) => {
      if (!isControlled.value) {
        core.setValue(nextValue);
      }

      emit("update:value", nextValue);
      emit("change", nextValue);
      props.onChange?.(nextValue);
    };

    const syncCursor = () => {
      const element = textareaRef.value;
      core.syncContext(core.getState().value, element?.selectionStart ?? core.getState().value.length);
    };

    const handleFiles = (files: FileList | File[]) => {
      core.addAttachments(Array.from(files));
      if (fileInputRef.value) {
        fileInputRef.value.value = "";
      }
    };

    const isInsideImageTray = (clientX: number, clientY: number): boolean => {
      const tray = imageTrayRef.value;
      if (!tray) return false;
      const rect = tray.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const count = imageAttachments.value.length;

      if (!isImageTrayExpanded.value) {
        return (
          x >= IMAGE_TRAY_LEFT &&
          x <= IMAGE_TRAY_LEFT + IMAGE_TRAY_CARD_WIDTH &&
          y >= IMAGE_TRAY_TOP &&
          y <= IMAGE_TRAY_TOP + IMAGE_TRAY_CARD_HEIGHT
        );
      }

      const expandedRight = getImageTrayLeft(count) + IMAGE_TRAY_CARD_WIDTH;
      const expandedBottom = IMAGE_TRAY_TOP + IMAGE_TRAY_CARD_HEIGHT + 10;
      return (
        x >= -IMAGE_TRAY_ACTIVE_PADDING_X &&
        x <= expandedRight + IMAGE_TRAY_ACTIVE_PADDING_X &&
        y >= -IMAGE_TRAY_ACTIVE_PADDING_TOP &&
        y <= expandedBottom + IMAGE_TRAY_ACTIVE_PADDING_BOTTOM
      );
    };

    const handleImageTrayMouseMove = (event: MouseEvent) => {
      if (!isImageTrayExpanded.value && isInsideImageTray(event.clientX, event.clientY)) {
        isImageTrayExpanded.value = true;
      }
    };

    const handleSend = () => {
      core.send();
    };

    const handleStop = () => {
      core.stop();
    };

    const handleContextSelection = (index: number) => {
      while (state.value.context.highlightedIndex !== index) {
        core.moveContextSelection(index > state.value.context.highlightedIndex ? "down" : "up");
      }
      const selectedItem = core.selectContextItem();
      if (selectedItem && !isControlled.value) {
        emit("update:value", core.getState().value);
        props.onChange?.(core.getState().value);
      }
    };

    const unsubscribe = [
      core.subscribe((nextState) => {
        state.value = nextState;
        void nextTick(resizeTextarea);
      }),
      core.onSend(({ value, attachments }) => {
        emit("send", value, { attachments });
        const result = props.onSend?.(value, { attachments });
        if (isThenable(result)) {
          void result.finally(() => core.setPhase("idle"));
        }
      }),
      core.onStop(() => {
        emit("stop");
        props.onStop?.();
      }),
      core.onAttachmentsChange(({ attachments }) => {
        emit("attachments-change", attachments);
        props.onAttachmentsChange?.(attachments);
      }),
      core.onAttachmentError(({ message, file }) => {
        emit("attachment-error", message, file);
        props.onAttachmentError?.(message, file);
      }),
      core.onMentionSelect(({ item }) => {
        emit("mention-select", toItemPayload(item));
        props.onMentionSelect?.(item);
      }),
      core.onCommandSelect(({ item }) => {
        emit("command-select", toItemPayload(item));
        props.onCommandSelect?.(item);
      })
    ];

    watch(
      () => props.value,
      (nextValue) => {
        if (typeof nextValue === "string" && nextValue !== state.value.value) {
          core.setValue(nextValue);
        }
      }
    );

    watch(
      () => props.attachments,
      (nextAttachments) => {
        if (Array.isArray(nextAttachments)) {
          core.setAttachments(nextAttachments);
        }
      },
      { deep: true, immediate: true }
    );

    watch(
      () => props.disabled || props.loading,
      (nextDisabled) => core.setDisabled(nextDisabled),
      { immediate: true }
    );

    watch(
      () => props.uploadOptions,
      (nextOptions) => core.setUploadConstraints(nextOptions ?? {}),
      { deep: true }
    );

    watch(
      () => props.mentions,
      (items) => core.setMentionItems(items ?? []),
      { deep: true }
    );

    watch(
      () => props.commands,
      (items) => core.setCommandItems(items ?? []),
      { deep: true }
    );

    watch(
      imageAttachments,
      (attachments) => {
        if (attachments.length === 0) {
          isImageTrayExpanded.value = false;
          previewAttachment.value = null;
        }
      },
      { deep: true }
    );

    watch(isImageTrayExpanded, (expanded, _previous, onCleanup) => {
      if (!expanded) return;
      const handleDocumentMouseMove = (event: MouseEvent) => {
        if (!isInsideImageTray(event.clientX, event.clientY)) {
          isImageTrayExpanded.value = false;
        }
      };
      document.addEventListener("mousemove", handleDocumentMouseMove);
      onCleanup(() => document.removeEventListener("mousemove", handleDocumentMouseMove));
    });

    watch(previewAttachment, (attachment, _previous, onCleanup) => {
      if (!attachment) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          previewAttachment.value = null;
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
    });

    onMounted(() => {
      if (props.autoFocus) {
        textareaRef.value?.focus();
      }
      resizeTextarea();
    });

    onBeforeUnmount(() => {
      unsubscribe.forEach((item) => item());
      core.clearAttachments();
    });

    return () =>
      h(
        "div",
        {
          class:
            "relative flex min-h-[220px] w-full flex-col overflow-visible rounded-[24px] border border-composer-border bg-composer-input p-6 text-composer-text transition-[border-color,box-shadow] duration-[250ms] ease-out hover:border-[var(--color-composer-hover-border)] hover:shadow-[var(--shadow-composer-hover)]",
          "data-theme": props.theme
        },
        [
          h("input", {
            ref: fileInputRef,
            type: "file",
            class: "sr-only",
            multiple: (props.uploadOptions?.maxFiles ?? 9) > 1,
            accept: props.uploadOptions?.accept?.join(","),
            onChange: (event: Event) => {
              const files = (event.target as HTMLInputElement).files;
              if (files) {
                handleFiles(files);
              }
            }
          }),
          h(
            "div",
            {
              ref: imageTrayRef,
              "data-testid": "image-stack",
              class: "absolute left-7 top-7 z-10 overflow-visible",
              style: {
                position: "absolute",
                width: `${isImageTrayExpanded.value ? getImageTrayLeft(imageAttachments.value.length) + IMAGE_TRAY_CARD_WIDTH : 120}px`,
                height: "120px",
                userSelect: "none"
              },
              onMousemove: handleImageTrayMouseMove
            },
            [
              imageAttachments.value.length === 0
                ? h(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Add image",
                      disabled: state.value.disabled,
                      style: getEmptyImageUploadStyle(),
                      onClick: () => fileInputRef.value?.click()
                    },
                    "+"
                  )
                : null,
              ...imageAttachments.value.map((attachment, index) =>
                h(
                  "div",
                  {
                    key: attachment.id,
                    "data-testid": "image-stack-item",
                    role: "button",
                    tabindex: 0,
                    "aria-label": `Preview ${attachment.name}`,
                    title: attachment.name,
                    style: getImageCardStyle(index, imageAttachments.value.length, isImageTrayExpanded.value, hoveredImageId.value === attachment.id),
                    onMouseenter: () => {
                      isImageTrayExpanded.value = true;
                      hoveredImageId.value = attachment.id;
                    },
                    onMouseleave: () => {
                      if (hoveredImageId.value === attachment.id) {
                        hoveredImageId.value = null;
                      }
                    },
                    onClick: () => {
                      previewAttachment.value = attachment;
                    },
                    onKeydown: (event: KeyboardEvent) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        previewAttachment.value = attachment;
                      }
                    }
                  },
                  [
                    attachment.previewUrl
                      ? h("img", {
                          src: attachment.previewUrl,
                          alt: attachment.name,
                          title: attachment.name,
                          style: {
                            width: "100%",
                            height: "100%",
                            borderRadius: "4px",
                            objectFit: "cover",
                            display: "block"
                          }
                        })
                      : h("div", { class: "flex h-full w-full items-center justify-center overflow-hidden rounded text-xs font-semibold text-slate-700" }, renderAttachmentLabel(attachment.name)),
                    h(
                      "div",
                      {
                        style: getImageNameBadgeStyle(hoveredImageId.value === attachment.id)
                      },
                      attachment.name
                    ),
                    h(
                      "button",
                      {
                        type: "button",
                        "aria-label": `Remove ${attachment.name}`,
                        "data-testid": "image-stack-remove",
                        style: getImageRemoveStyle(isImageTrayExpanded.value, hoveredImageId.value === attachment.id),
                        onClick: (event: MouseEvent) => {
                          event.preventDefault();
                          event.stopPropagation();
                          core.removeAttachment(attachment.id);
                        }
                      },
                      "x"
                    )
                  ]
                )
              ),
              imageAttachments.value.length > 0
                ? [
                    h(
                      "button",
                      {
                        type: "button",
                        "aria-label": "Add image",
                        "data-testid": "image-stack-upload",
                        disabled: state.value.disabled,
                        style: getImageUploadStyle(imageAttachments.value.length, isImageTrayExpanded.value),
                        onClick: () => fileInputRef.value?.click()
                      },
                      "+"
                    )
                  ]
                : null
            ]
          ),
          h(
            "div",
            {
              class: [
                "relative z-0 min-w-0 flex-1 pt-5 transition-[padding] duration-[250ms]",
                imageAttachmentCount.value > 0 ? "pl-[160px]" : "pl-[100px]"
              ].join(" ")
            },
            [
              h("textarea", {
                ref: textareaRef,
                value: state.value.value,
                placeholder: props.placeholder,
                disabled: state.value.disabled,
                rows: props.minRows,
                "aria-label": "AI Composer Input",
                class:
                  "w-full resize-none rounded-none border-0 bg-transparent p-0 text-base leading-7 text-composer-text outline-none transition placeholder:text-composer-muted",
                onInput: (event: Event) => {
                  setValue((event.target as HTMLTextAreaElement).value);
                  syncCursor();
                },
                onClick: syncCursor,
                onKeyup: syncCursor,
                onKeydown: (event: KeyboardEvent) => {
                  if (state.value.context.isOpen) {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      core.moveContextSelection("down");
                      return;
                    }

                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      core.moveContextSelection("up");
                      return;
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      core.closeContext();
                      return;
                    }

                    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
                      event.preventDefault();
                      const selectedItem = core.selectContextItem();
                      if (selectedItem && !isControlled.value) {
                        emit("update:value", core.getState().value);
                        props.onChange?.(core.getState().value);
                      }
                      if (selectedItem) {
                        return;
                      }
                    }
                  }

                  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
                    event.preventDefault();
                    handleSend();
                  }
                }
              }),
              state.value.context.isOpen && state.value.context.suggestions.length > 0
                ? h(
                    "div",
                    {
                      class:
                        "mt-2 w-[360px] overflow-hidden rounded-2xl border border-composer-chipBorder bg-composer-input shadow-lg"
                    },
                    state.value.context.suggestions.map((item, index) =>
                      h(
                        "button",
                        {
                          key: item.id,
                          type: "button",
                          class: [
                            "block w-full px-4 py-3 text-left text-sm transition",
                            index === state.value.context.highlightedIndex
                              ? "bg-composer-elevated text-composer-text"
                              : "text-composer-muted hover:bg-composer-chip hover:text-composer-text"
                          ].join(" "),
                          onClick: () => handleContextSelection(index)
                        },
                        [
                          h("span", { class: "block font-medium text-composer-text" }, item.label),
                          item.description ? h("span", { class: "mt-1 block text-xs text-composer-muted" }, item.description) : null
                        ]
                      )
                    )
                  )
                : null
            ]
          ),
          h("div", { class: "mt-auto flex min-h-14 items-center gap-4 border-t border-composer-softBorder pt-3" }, [
            h("div", { class: props.showStatusText ? "text-xs text-composer-muted" : "sr-only" }, statusText.value),
            h("div", { class: "flex w-full items-center justify-between gap-4" }, [
              props.showActionOptions
                ? h(
                    "div",
                    { class: "flex min-w-0 flex-wrap items-center gap-2" },
                    visibleActionOptions.value.map((option) =>
                      h("label", { key: option.id, class: "flex items-center gap-2 rounded-[18px] border border-composer-chipBorder bg-composer-chip px-3 py-1.5 text-sm text-composer-text" }, [
                        h("span", { class: "text-sm font-medium text-composer-muted" }, option.label),
                        h(
                          "select",
                          {
                            "aria-label": option.label,
                            value: option.value,
                            class: "min-w-[112px] bg-transparent text-sm font-medium text-composer-text outline-none",
                            onChange: (event: Event) => {
                              const nextValue = (event.target as HTMLSelectElement).value;
                              emit("action-option-change", option.id, nextValue);
                              props.onActionOptionChange?.(option.id, nextValue);
                            }
                          },
                          option.options.map((choice) => h("option", { key: choice.value, value: choice.value, class: "bg-composer-bg text-composer-text" }, choice.label))
                        )
                      ])
                    )
                  )
                : h("div"),
              h("div", { class: "flex shrink-0 items-center gap-3" }, [
                props.actionHint ? h("div", { class: "max-w-[220px] truncate text-sm text-composer-muted" }, props.actionHint) : null,
                canStop.value
                  ? h(
                      "button",
                      {
                        type: "button",
                        class:
                          "flex h-12 w-12 items-center justify-center rounded-full bg-composer-danger text-sm font-semibold text-composer-sendText transition",
                        onClick: handleStop
                      },
                      "Stop"
                    )
                  : h(
                      "button",
                      {
                        type: "button",
                        disabled: !canSend.value,
                        class:
                          "flex h-12 w-12 items-center justify-center rounded-full bg-composer-send text-xl font-semibold text-composer-sendText shadow-tile transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:bg-[var(--color-send-disabled)] disabled:text-white disabled:opacity-100",
                        onClick: handleSend
                      },
                      "↑"
                    )
              ])
            ])
          ]),
          previewAttachment.value
            ? h(
                "div",
                {
                  class: "fixed inset-0 z-50 flex items-center justify-center bg-black/62 px-6 py-8",
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-label": `Preview ${previewAttachment.value.name}`,
                  onClick: () => {
                    previewAttachment.value = null;
                  }
                },
                h(
                  "div",
                  {
                    class: "relative rounded-[18px] border border-composer-border bg-composer-input p-3 shadow-composer",
                    style: {
                      width: "min(82vw, 1024px)",
                      maxHeight: "calc(100vh - 64px)",
                      overflow: "hidden"
                    },
                    onClick: (event: MouseEvent) => event.stopPropagation()
                  },
                  [
                    h("div", { class: "mb-3 flex items-center justify-between gap-4" }, [
                      h("div", { class: "min-w-0 truncate text-sm font-medium text-composer-text" }, previewAttachment.value.name),
                      h(
                        "button",
                        {
                          type: "button",
                          "aria-label": "Close preview",
                          class:
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-composer-uploadActionBorder bg-composer-uploadAction text-sm font-semibold text-composer-text transition hover:brightness-110",
                          onClick: () => {
                            previewAttachment.value = null;
                          }
                        },
                        "x"
                      )
                    ]),
                    previewAttachment.value.previewUrl
                      ? h("img", {
                          src: previewAttachment.value.previewUrl,
                          alt: previewAttachment.value.name,
                          class: "rounded-xl object-contain",
                          style: {
                            display: "block",
                            maxWidth: "100%",
                            maxHeight: "calc(100vh - 150px)",
                            width: "auto",
                            height: "auto",
                            margin: "0 auto"
                          }
                        })
                      : h(
                          "div",
                          { class: "flex h-[320px] w-full items-center justify-center rounded-xl bg-composer-chip text-4xl font-semibold text-composer-text" },
                          renderAttachmentLabel(previewAttachment.value.name)
                        )
                  ]
                )
              )
            : null
        ]
      );
  }
});
