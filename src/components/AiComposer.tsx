import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ComposerCore } from "../core/ComposerCore";
import type {
  CommandItem,
  ComposerActionOption,
  ComposerAttachment,
  ComposerState,
  MentionItem,
  UploadPluginOptions
} from "../core/types";
import { CommandPlugin } from "../plugins/CommandPlugin";
import { MentionPlugin } from "../plugins/MentionPlugin";
import { UploadPlugin } from "../plugins/UploadPlugin";
import { AttachmentList } from "./AttachmentList";
import { ComposerActions } from "./ComposerActions";
import { ComposerImageTray } from "./ComposerImageTray";
import { ComposerOverlayLayer } from "./ComposerOverlayLayer";
import { ComposerStatusSlot } from "./ComposerStatusSlot";
import { ComposerTextarea } from "./ComposerTextarea";

const DEFAULT_PLACEHOLDER =
  "\u8f93\u5165\u60f3\u6cd5\u3001\u811a\u672c\uff0c'/' \u4f7f\u7528\u6280\u80fd\uff0c@ \u8c03\u7528\u53c2\u8003\uff0c\u548c Agent \u4e00\u8d77\u521b\u4f5c";

export interface AiComposerProps {
  value?: string;
  defaultValue?: string;
  defaultAttachments?: ComposerAttachment[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  minRows?: number;
  maxRows?: number;
  theme?: "light" | "dark" | "auto";
  uploadOptions?: UploadPluginOptions;
  mentions?: MentionItem[];
  commands?: CommandItem[];
  showActionOptions?: boolean;
  showStopButton?: boolean;
  showStatusText?: boolean;
  statusText?: string;
  statusTextMap?: Partial<Record<ComposerState["phase"], string>>;
  actionHint?: ReactNode;
  actionOptions?: ComposerActionOption[];
  onChange?: (value: string) => void;
  onActionOptionChange?: (id: string, value: string) => void;
  onSend?: (
    value: string,
    context: { attachments: ComposerAttachment[] }
  ) => void | Promise<void>;
  onStop?: () => void;
  onAttachmentsChange?: (attachments: ComposerAttachment[]) => void;
  onAttachmentError?: (message: string, file?: File) => void;
  onMentionSelect?: (item: MentionItem) => void;
  onCommandSelect?: (item: CommandItem) => void;
}

export function AiComposer({
  value,
  defaultValue,
  defaultAttachments = [],
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  autoFocus = false,
  minRows = 3,
  maxRows = 8,
  theme = "auto",
  uploadOptions,
  mentions = [],
  commands = [],
  showActionOptions = false,
  showStopButton = false,
  showStatusText = false,
  statusText,
  statusTextMap,
  actionHint,
  actionOptions,
  onChange,
  onActionOptionChange,
  onSend,
  onStop,
  onAttachmentsChange,
  onAttachmentError,
  onMentionSelect,
  onCommandSelect
}: AiComposerProps) {
  const core = useMemo(() => {
    const nextCore = new ComposerCore({
      value: value ?? defaultValue ?? "",
      disabled,
      attachments: defaultAttachments
    });

    nextCore.use(new UploadPlugin(uploadOptions));
    nextCore.use(new MentionPlugin());
    nextCore.use(new CommandPlugin());
    return nextCore;
  }, []);
  const [state, setState] = useState<ComposerState>(core.getState());

  useEffect(() => core.subscribe(setState), [core]);

  useEffect(() => {
    core.setDisabled(disabled);
  }, [core, disabled]);

  useEffect(() => {
    if (typeof value === "string" && value !== state.value) {
      core.setValue(value);
    }
  }, [core, state.value, value]);

  useEffect(() => {
    core.setUploadConstraints(uploadOptions ?? {});
  }, [core, uploadOptions]);

  useEffect(() => {
    core.setMentionItems(mentions);
  }, [core, mentions]);

  useEffect(() => {
    core.setCommandItems(commands);
  }, [core, commands]);

  useEffect(() => {
    const unsubscribeSend = core.onSend(({ value: nextValue, attachments }) => {
      const sendResult = onSend?.(nextValue, { attachments });

      if (sendResult && typeof sendResult === "object" && "then" in sendResult) {
        void sendResult.finally(() => core.setPhase("idle"));
      }
    });
    const unsubscribeStop = core.onStop(() => {
      onStop?.();
    });

    return () => {
      unsubscribeSend();
      unsubscribeStop();
    };
  }, [core, onSend, onStop]);

  useEffect(() => {
    const unsubscribeMention = core.onMentionSelect(({ item }) => {
      onMentionSelect?.({
        id: item.id,
        label: item.label,
        value: item.value,
        description: item.description
      });
    });

    const unsubscribeCommand = core.onCommandSelect(({ item }) => {
      onCommandSelect?.({
        id: item.id,
        label: item.label,
        value: item.value,
        description: item.description
      });
    });

    return () => {
      unsubscribeMention();
      unsubscribeCommand();
    };
  }, [core, onCommandSelect, onMentionSelect]);

  useEffect(() => {
    const unsubscribeAttachments = core.onAttachmentsChange(({ attachments }) => {
      onAttachmentsChange?.(attachments);
    });

    const unsubscribeAttachmentErrors = core.onAttachmentError(({ message, file }) => {
      onAttachmentError?.(message, file);
    });

    return () => {
      unsubscribeAttachments();
      unsubscribeAttachmentErrors();
    };
  }, [core, onAttachmentError, onAttachmentsChange]);

  const canSend = state.value.trim().length > 0 && state.phase !== "generating" && !state.disabled;
  const canStop = showStopButton && state.phase === "generating";
  const imageAttachmentCount = state.attachments.filter((attachment) => {
    return attachment.type.startsWith("image/") || attachment.previewUrl;
  }).length;
  const handleValueChange = (nextValue: string) => {
    if (typeof value !== "string") {
      core.setValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const handleContextSelection = (index: number) => {
    while (state.context.highlightedIndex !== index) {
      core.moveContextSelection(index > state.context.highlightedIndex ? "down" : "up");
    }
    const selectedItem = core.selectContextItem();
    if (selectedItem && typeof value !== "string") {
      onChange?.(core.getState().value);
    }
  };

  return (
    <div
      className="relative flex min-h-[220px] w-full flex-col overflow-visible rounded-[24px] border border-composer-border bg-composer-input p-6 text-composer-text transition-[border-color,box-shadow] duration-[250ms] ease-out hover:border-[var(--color-composer-hover-border)] hover:shadow-[var(--shadow-composer-hover)]"
      data-theme={theme}
    >
      <ComposerImageTray
        accept={uploadOptions?.accept}
        attachments={state.attachments}
        disabled={state.disabled}
        onAttach={(files) => core.addAttachments(files)}
        onRemove={(id) => core.removeAttachment(id)}
      />

      <div
        className={[
          "relative z-0 min-w-0 flex-1 pt-5 transition-[padding] duration-[250ms]",
          imageAttachmentCount > 0 ? "pl-[160px]" : "pl-[100px]"
        ].join(" ")}
      >
        <ComposerTextarea
          value={state.value}
          placeholder={placeholder}
          disabled={state.disabled}
          autoFocus={autoFocus}
          minRows={minRows}
          maxRows={maxRows}
          onChange={handleValueChange}
          onCursorChange={(cursorIndex) => core.syncContext(core.getState().value, cursorIndex)}
          onKeyDown={(event) => {
            if (!state.context.isOpen) {
              return false;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              return core.moveContextSelection("down");
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              return core.moveContextSelection("up");
            }

            if (event.key === "Escape") {
              event.preventDefault();
              core.closeContext();
              return true;
            }

            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              const selectedItem = core.selectContextItem();
              if (selectedItem && typeof value !== "string") {
                onChange?.(core.getState().value);
              }
              return selectedItem !== null;
            }

            return false;
          }}
          onSubmit={() => core.send()}
        />
        <ComposerOverlayLayer context={state.context} onSelect={handleContextSelection} />
      </div>

      <AttachmentList attachments={state.attachments} onRemove={(id) => core.removeAttachment(id)} />
      <div className="mt-auto flex min-h-14 items-center gap-4 border-t border-composer-softBorder pt-3">
        <ComposerStatusSlot
          phase={state.phase}
          showStatusText={showStatusText}
          statusText={statusText}
          statusTextMap={statusTextMap}
        />
        <ComposerActions
          canSend={canSend}
          canStop={canStop}
          showStopButton={showStopButton}
          showActionOptions={showActionOptions}
          actionHint={actionHint}
          actionOptions={actionOptions}
          onActionOptionChange={onActionOptionChange}
          onSend={() => core.send()}
          onStop={() => core.stop()}
        />
      </div>
    </div>
  );
}
