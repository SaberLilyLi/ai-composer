import type { WorkflowStep } from "../core/types";

export interface WorkflowTimelineProps {
  steps: WorkflowStep[];
}

const statusGlyph: Record<WorkflowStep["status"], string> = {
  waiting: "○",
  running: "⟳",
  success: "✓",
  error: "!"
};

const statusTone: Record<WorkflowStep["status"], string> = {
  waiting: "text-composer-muted",
  running: "text-composer-brand",
  success: "text-composer-text",
  error: "text-composer-danger"
};

function getDuration(step: WorkflowStep): string {
  if (typeof step.startedAt !== "number" || typeof step.completedAt !== "number") {
    return "";
  }

  return `${Math.max(0, step.completedAt - step.startedAt)}ms`;
}

export function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Workflow timeline"
      className="mx-auto mb-5 flex max-w-[760px] flex-wrap gap-2 rounded-2xl border border-composer-chipBorder bg-composer-input px-3 py-3"
    >
      {steps.map((step, index) => {
        const duration = getDuration(step);

        return (
          <div
            key={step.id}
            className="flex min-h-9 max-w-full items-center gap-2 rounded-full border border-composer-softBorder bg-composer-chip px-3 py-1.5 text-xs"
            title={step.error}
          >
            <span className={["font-semibold", statusTone[step.status]].join(" ")} aria-hidden="true">
              {statusGlyph[step.status]}
            </span>
            <span className="font-medium text-composer-text">{step.title || `Step${index + 1}`}</span>
            <span className="text-composer-muted">{step.status}</span>
            {step.provider ? <span className="text-composer-muted">{step.provider}</span> : null}
            {duration ? <span className="text-composer-muted">{duration}</span> : null}
            {step.error ? <span className="max-w-[180px] truncate text-composer-danger">{step.error}</span> : null}
          </div>
        );
      })}
    </aside>
  );
}
