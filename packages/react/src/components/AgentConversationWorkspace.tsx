import { AiComposer } from "./AiComposer";
import { ConversationView } from "./ConversationView";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { useAgentConversationController } from "../controllers/useAgentConversationController";
import type { AgentConversationConfig, AgentMode } from "../controllers/useAgentConversationController";

export interface AgentConversationWorkspaceProps {
  theme?: "light" | "dark" | "auto";
  title?: string;
  subtitle?: string;
  initialMode?: AgentMode;
  config?: AgentConversationConfig;
}

const DEFAULT_TITLE = "Agent Conversation";
const DEFAULT_SUBTITLE = "Use the composer below to chat or execute an image workflow.";

export function AgentConversationWorkspace({
  theme = "dark",
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  initialMode = "chat",
  config
}: AgentConversationWorkspaceProps) {
  const {
    activeModel,
    actionOptions,
    commands,
    composerKey,
    conversationMessages,
    error,
    handleActionOptionChange,
    handleCommandSelect,
    handleSend,
    handleStop,
    isBusy,
    mentions,
    mode,
    modeSwitchConfig,
    resetConversation,
    retryConversation,
    retryWorkflow,
    retryWorkflowStep,
    setMode,
    uploadOptions,
    workflowSteps
  } = useAgentConversationController({ initialMode, config });
  const failedStep = workflowSteps.find((step) => step.status === "error");

  return (
    <div className="flex min-h-screen w-full flex-col bg-composer-bg text-composer-text" data-theme={theme}>
      <header className="sticky top-0 z-20 border-b border-composer-softBorder bg-composer-bg/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[920px] items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-composer-text">{title}</h1>
            <p className="truncate text-xs text-composer-muted">{mode === "chat" ? activeModel : `${activeModel} image mode`}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs text-composer-muted sm:block">
              {isBusy ? "Generating..." : "Ready"}
            </div>
            {!isBusy && mode === "chat" ? (
              <button
                type="button"
                className="rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted transition hover:bg-composer-chip"
                onClick={() => void retryConversation?.()}
              >
                Retry
              </button>
            ) : null}
            {!isBusy && mode === "image" ? (
              <button
                type="button"
                className="rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted transition hover:bg-composer-chip"
                onClick={() => void retryWorkflow?.()}
              >
                Retry Workflow
              </button>
            ) : null}
            {!isBusy && failedStep ? (
              <button
                type="button"
                className="rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted transition hover:bg-composer-chip"
                onClick={() => void retryWorkflowStep?.(failedStep.id)}
              >
                Retry Step
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-full border border-composer-chipBorder bg-composer-input px-3 py-1.5 text-xs font-medium text-composer-muted transition hover:bg-composer-chip"
              onClick={resetConversation}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-44 pt-8">
          <WorkflowTimeline steps={workflowSteps} />
          <ConversationView messages={conversationMessages} />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent px-4 pb-5 pt-12">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-3 flex items-center justify-between gap-3">
              {modeSwitchConfig.enabled ? (
                <div className="flex rounded-full border border-composer-chipBorder bg-composer-input p-1">
                  {modeSwitchConfig.modes.map((item) => {
                    const active = mode === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        className={[
                          "rounded-full px-3 py-1.5 text-xs font-medium transition",
                          active ? "bg-composer-elevated text-composer-text" : "text-composer-muted hover:text-composer-text"
                        ].join(" ")}
                        onClick={() => setMode(item)}
                      >
                        {item === "chat" ? "Chat" : "Image"}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div />
              )}
              <p className="hidden truncate text-xs text-composer-muted sm:block">{subtitle}</p>
            </div>

            {error ? (
              <div className="mb-3 rounded-2xl border border-composer-chipBorder bg-composer-chip px-4 py-3 text-sm text-composer-danger">
                {error}
              </div>
            ) : null}

            <AiComposer
              key={composerKey}
              theme={theme}
              minRows={1}
              maxRows={6}
              autoFocus
              disabled={isBusy}
              showActionOptions
              actionOptions={actionOptions}
              onActionOptionChange={handleActionOptionChange}
              uploadOptions={uploadOptions}
              placeholder={
                mode === "chat"
                  ? "Ask anything..."
                  : "Describe the image workflow you want to run..."
              }
              mentions={mentions}
              commands={commands}
              onCommandSelect={handleCommandSelect}
              onSend={handleSend}
              onStop={handleStop}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
