import type { Meta, StoryObj } from "@storybook/react";
import { AgentConversationWorkspace } from "./AgentConversationWorkspace";

const meta = {
  title: "Composer/AgentConversationWorkspace",
  component: AgentConversationWorkspace,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof AgentConversationWorkspace>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    theme: "dark"
  },
  render: (args) => (
    <div className="min-h-screen bg-composer-bg">
      <AgentConversationWorkspace {...args} />
    </div>
  )
};
