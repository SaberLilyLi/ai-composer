import type { Meta, StoryObj } from "@storybook/react";
import type { ComposerAttachment } from "../core/types";
import { AiComposer } from "./AiComposer";

const IMAGE_PLACEHOLDER =
  "\u8f93\u5165\u60f3\u6cd5\u3001\u811a\u672c\uff0c'/' \u4f7f\u7528\u6280\u80fd\uff0c@ \u8c03\u7528\u53c2\u8003\uff0c\u548c Agent \u4e00\u8d77\u521b\u4f5c";

const createMockImageAttachment = (
  id: string,
  name: string,
  background: string
): ComposerAttachment => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="220" viewBox="0 0 160 220"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${background}" offset="0"/><stop stop-color="#0f1117" offset="1"/></linearGradient></defs><rect width="160" height="220" rx="22" fill="url(#g)"/><circle cx="122" cy="48" r="22" fill="rgba(255,255,255,0.22)"/><path d="M18 168L68 112L102 148L128 126L142 168H18Z" fill="rgba(255,255,255,0.28)"/><rect x="18" y="22" width="76" height="12" rx="6" fill="rgba(255,255,255,0.18)"/></svg>`;
  const previewUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return {
    id,
    file: new File(["mock"], name, { type: "image/png" }),
    name,
    size: 256000,
    type: "image/png",
    previewUrl,
    status: "ready"
  };
};

const mockImages = [
  createMockImageAttachment("img-1", "sports-car-red.png", "#5b1f1f"),
  createMockImageAttachment("img-2", "sports-car-black.png", "#262b39"),
  createMockImageAttachment("img-3", "offroad-reference.png", "#496a3f"),
  createMockImageAttachment("img-4", "interior-detail.png", "#6b5a40"),
  createMockImageAttachment("img-5", "wheel-reference.png", "#344454"),
  createMockImageAttachment("img-6", "lighting-reference.png", "#455a6b"),
  createMockImageAttachment("img-7", "side-profile.png", "#4d3f36"),
  createMockImageAttachment("img-8", "rear-view.png", "#263240"),
  createMockImageAttachment("img-9", "material-board.png", "#56616c"),
  createMockImageAttachment("img-10", "motion-reference.png", "#284b59")
];

const meta = {
  title: "Composer/AiComposer",
  component: AiComposer,
  parameters: {
    layout: "centered"
  }
} satisfies Meta<typeof AiComposer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Describe what you want AI to do..."
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-6">
      <AiComposer {...args} />
    </div>
  )
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
    placeholder: "Ask the model anything..."
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-6" data-theme="dark">
      <AiComposer {...args} />
    </div>
  )
};

export const WithUpload: Story = {
  args: {
    placeholder: "Add context and attach files...",
    uploadOptions: {
      accept: [".pdf", "image/*"],
      maxFiles: 3,
      maxFileSize: 5 * 1024 * 1024
    }
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-6">
      <AiComposer {...args} />
    </div>
  )
};

export const WithMentionAndCommand: Story = {
  args: {
    placeholder: "Type @ to mention an agent, or / for a command...",
    mentions: [
      { id: "design", label: "Design Agent", value: "design", description: "Visual product specialist" },
      { id: "research", label: "Research Agent", value: "research", description: "Discovery and analysis" },
      { id: "support", label: "Support Agent", value: "support", description: "Customer issue triage" }
    ],
    commands: [
      { id: "summarize", label: "Summarize", value: "summarize", description: "Shorten the response" },
      { id: "translate", label: "Translate", value: "translate", description: "Switch output language" },
      { id: "rewrite", label: "Rewrite", value: "rewrite", description: "Improve clarity and tone" }
    ]
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-6">
      <AiComposer {...args} />
    </div>
  )
};

export const ImageConversationMode: Story = {
  args: {
    theme: "dark",
    defaultAttachments: mockImages.slice(0, 5),
    defaultValue: "",
    placeholder: IMAGE_PLACEHOLDER
  },
  render: (args) => (
    <div className="min-h-[320px] bg-composer-bg p-8" data-theme="dark">
      <AiComposer {...args} />
    </div>
  )
};

export const OneImageCompact: Story = {
  args: {
    defaultAttachments: mockImages.slice(0, 1),
    defaultValue: "",
    placeholder: IMAGE_PLACEHOLDER
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-6">
      <AiComposer {...args} />
    </div>
  )
};

export const ManyImagesCompact: Story = {
  args: {
    defaultAttachments: mockImages.slice(0, 5),
    defaultValue: "",
    placeholder: IMAGE_PLACEHOLDER
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-6">
      <AiComposer {...args} />
    </div>
  )
};

export const ManyImagesCompactDark: Story = {
  args: {
    theme: "dark",
    defaultAttachments: mockImages.slice(0, 5),
    defaultValue: "",
    placeholder: IMAGE_PLACEHOLDER
  },
  render: (args) => (
    <div className="w-[760px] bg-composer-bg p-6" data-theme="dark">
      <AiComposer {...args} />
    </div>
  )
};
