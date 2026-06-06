import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { WorkflowStep } from "../core/types";
import { WorkflowTimeline } from "./WorkflowTimeline";

afterEach(() => {
  cleanup();
});

describe("WorkflowTimeline", () => {
  it("renders workflow steps by status", () => {
    const steps: WorkflowStep[] = [
      { id: "step-1", type: "chat", title: "Step1", status: "success" },
      { id: "step-2", type: "image_generate", title: "Step2", status: "running" },
      { id: "step-3", type: "agent_task", title: "Step3", status: "waiting" }
    ];

    render(<WorkflowTimeline steps={steps} />);

    expect(screen.getByLabelText("Workflow timeline")).toBeTruthy();
    expect(screen.getByText("Step1")).toBeTruthy();
    expect(screen.getByText("Step2")).toBeTruthy();
    expect(screen.getByText("Step3")).toBeTruthy();
    expect(screen.getByText("running")).toBeTruthy();
  });
});
