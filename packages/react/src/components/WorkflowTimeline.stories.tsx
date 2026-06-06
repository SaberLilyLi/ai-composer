import type { Meta, StoryObj } from "@storybook/react";
import { WorkflowTimeline } from "./WorkflowTimeline";

const meta = {
  title: "Composer/WorkflowTimeline",
  component: WorkflowTimeline,
  parameters: {
    layout: "centered"
  }
} satisfies Meta<typeof WorkflowTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    steps: [
      { id: "step-1", type: "chat", title: "Step1", status: "success" },
      { id: "step-2", type: "image_generate", title: "Step2", status: "running" },
      { id: "step-3", type: "agent_task", title: "Step3", status: "waiting" }
    ]
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-8" data-theme="dark">
      <WorkflowTimeline {...args} />
    </div>
  )
};
