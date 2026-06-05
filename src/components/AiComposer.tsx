import { useEffect, useMemo, useState } from "react";
import { ComposerCore } from "../core/ComposerCore";
import type {
  CommandItem,
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
const EMPTY_HINT =
  "\u56fe\u7247\u53c2\u8003\u4f1a\u5148\u663e\u793a\u5728\u4e0a\u65b9\uff0c\u7ee7\u7eed\u8f93\u5165\u60f3\u6cd5\u3001\u811a\u672c\u6216\u63d0\u793a\u8bcd\u5f00\u59cb\u521b\u4f5c";

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
  onChange?: (value: string) => void;
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
  onChange,
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
        void sendResult.catch(() => {
          core.setPhase("idle");
        });
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
  const canStop = state.phase === "generating";
  const imageAttachmentCount = state.attachments.filter((attachment) => {
    return attachment.type.startsWith("image/") || attachment.previewUrl;
  }).length;
  const showEmptyHint = state.value.trim().length === 0 && imageAttachmentCount === 0;

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
      className="w-full rounded-[26px] border border-composer-border bg-composer-shell p-3 text-composer-text shadow-composer"
      data-theme={theme}
    >
      <div className="rounded-[22px] border border-composer-border bg-composer-input px-4 pb-4 pt-3">
        <div className="flex min-h-[104px] items-start gap-3">
          <ComposerImageTray
            accept={uploadOptions?.accept}
            attachments={state.attachments}
            disabled={state.disabled}
            onAttach={(files) => core.addAttachments(files)}
            onRemove={(id) => core.removeAttachment(id)}
          />

          <div className="relative min-w-0 flex-1 pt-1.5">
            {showEmptyHint ? (
              <div className="pointer-events-none absolute left-0 top-1.5 text-[15px] leading-7 text-composer-muted/95">
                {EMPTY_HINT}
              </div>
            ) : null}

            <ComposerTextarea
              value={state.value}
              placeholder={showEmptyHint ? "" : placeholder}
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
        </div>

        <AttachmentList attachments={state.attachments} onRemove={(id) => core.removeAttachment(id)} />
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-composer-softBorder pt-3">
          <ComposerStatusSlot phase={state.phase} />
          <ComposerActions canSend={canSend} canStop={canStop} onSend={() => core.send()} onStop={() => core.stop()} />
        </div>
      </div>
    </div>
  );
}
