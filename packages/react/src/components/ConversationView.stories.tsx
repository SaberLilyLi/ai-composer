import type { Meta, StoryObj } from "@storybook/react";
import { ConversationView } from "./ConversationView";

const meta = {
  title: "Composer/ConversationView",
  component: ConversationView,
  parameters: {
    layout: "centered"
  }
} satisfies Meta<typeof ConversationView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    messages: [
      {
        id: "user-1",
        role: "user",
        content: "Create **three** campaign image directions.",
        createdAt: 1
      },
      {
        id: "assistant-1",
        role: "assistant",
        content: "- Premium product close-up\n- Lifestyle scene\n- Editorial studio layout",
        status: "success",
        createdAt: 2,
        attachments: [
          {
            id: "image-1",
            type: "image",
            url: "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='420'%20height='420'%3E%3Crect%20width='420'%20height='420'%20fill='%2322252d'/%3E%3Ccircle%20cx='210'%20cy='180'%20r='96'%20fill='%2335c6ff'/%3E%3C/svg%3E",
            name: "direction.png",
            mimeType: "image/svg+xml"
          }
        ]
      },
      {
        id: "system-1",
        role: "system",
        content: "Generation stopped.",
        createdAt: 3
      }
    ]
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-8" data-theme="dark">
      <ConversationView {...args} />
    </div>
  )
};
