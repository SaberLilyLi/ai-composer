import { defineComponent, h, type PropType } from "vue";
import type { WorkflowStep } from "@company/ai-composer-shared";

export interface VueWorkflowTimelineProps {
  steps: WorkflowStep[];
  emptyText?: string;
}

const statusGlyph: Record<WorkflowStep["status"], string> = {
  waiting: "...",
  running: ">>",
  success: "OK",
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

export const WorkflowTimeline = defineComponent({
  name: "WorkflowTimeline",
  props: {
    steps: { type: Array as PropType<WorkflowStep[]>, default: () => [] },
    emptyText: { type: String, default: "" }
  },
  setup(props) {
    return () => {
      if (props.steps.length === 0) {
        return props.emptyText
          ? h("aside", { class: "mx-auto mb-5 max-w-[760px] rounded-2xl border border-composer-chipBorder bg-composer-input px-3 py-3 text-xs text-composer-muted" }, props.emptyText)
          : null;
      }

      return h(
        "aside",
        {
          "aria-label": "Workflow timeline",
          class: "mx-auto mb-5 flex max-w-[760px] flex-wrap gap-2 rounded-2xl border border-composer-chipBorder bg-composer-input px-3 py-3"
        },
        props.steps.map((step, index) => {
          const duration = getDuration(step);

          return h(
            "div",
            {
              key: step.id,
              class: "flex min-h-9 max-w-full items-center gap-2 rounded-full border border-composer-softBorder bg-composer-chip px-3 py-1.5 text-xs",
              title: step.error ?? step.prompt
            },
            [
              h("span", { class: ["font-semibold", statusTone[step.status]].join(" "), "aria-hidden": "true" }, statusGlyph[step.status]),
              h("span", { class: "font-medium text-composer-text" }, step.title || `Step${index + 1}`),
              h("span", { class: "text-composer-muted" }, step.status),
              step.prompt ? h("span", { class: "max-w-[180px] truncate text-composer-muted" }, step.prompt) : null,
              duration ? h("span", { class: "text-composer-muted" }, duration) : null,
              step.error ? h("span", { class: "max-w-[180px] truncate text-composer-danger" }, step.error) : null
            ]
          );
        })
      );
    };
  }
});
