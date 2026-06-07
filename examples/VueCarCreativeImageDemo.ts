import { defineComponent, h, ref } from "vue";
import { AiComposer, ConversationView } from "@company/ai-studio-sdk/vue";
import { ConversationRuntime, GPTImageProvider, GPTProvider } from "@company/ai-studio-sdk/core";
import type { Attachment, Message } from "@company/ai-studio-sdk";

export interface VueCarCreativeImageDemoProps {
  apiKey: string;
  baseUrl?: string;
  chatModel?: string;
  imageModel?: string;
}

interface CreativeImageResult {
  id: string;
  prompt: string;
  url: string;
}

function createMessage(role: Message["role"], content: string, attachments: Attachment[] = []): Message {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    attachments,
    createdAt: Date.now(),
    status: "success"
  };
}

function buildCarPrompt(input: string, previousImage?: CreativeImageResult): string {
  if (!previousImage) {
    return [
      "Create a commercial used-car marketing image.",
      "Keep the vehicle realistic and suitable for an automotive listing.",
      "Use premium lighting, clean background, and strong resale appeal.",
      `User request: ${input}`
    ].join("\n");
  }

  return [
    "Edit the previous used-car creative image according to the user's follow-up request.",
    "Keep the same vehicle identity and preserve commercial listing realism.",
    `Previous prompt: ${previousImage.prompt}`,
    `Follow-up request: ${input}`
  ].join("\n");
}

export const VueCarCreativeImageDemo = defineComponent({
  name: "VueCarCreativeImageDemo",
  props: {
    apiKey: { type: String, required: true },
    baseUrl: { type: String, default: "https://api.openai.com/v1" },
    chatModel: { type: String, default: "gpt-5.5" },
    imageModel: { type: String, default: "gpt-image-2" }
  },
  setup(props) {
    const messages = ref<Message[]>([
      createMessage(
        "assistant",
        "Describe the used-car creative image you want to generate. You can continue asking for edits after the first image."
      )
    ]);
    const images = ref<CreativeImageResult[]>([]);
    const isGenerating = ref(false);
    const value = ref("");
    const lastImage = ref<CreativeImageResult | undefined>(undefined);
    const conversationRuntime = new ConversationRuntime(
      new GPTProvider({
        provider: "openai",
        apiKey: props.apiKey,
        baseUrl: props.baseUrl,
        model: props.chatModel
      })
    );
    const imageProvider = new GPTImageProvider({
      provider: "openai",
      apiKey: props.apiKey,
      baseUrl: props.baseUrl,
      model: props.imageModel
    });

    const send = async (nextValue: string) => {
      const trimmedValue = nextValue.trim();
      if (!trimmedValue || isGenerating.value) {
        return;
      }

      isGenerating.value = true;
      value.value = "";
      messages.value = messages.value.concat(createMessage("user", trimmedValue));

      try {
        const previousImage = lastImage.value;
        const prompt = buildCarPrompt(trimmedValue, previousImage);
        const assistantPlan = await conversationRuntime.send(prompt);
        const imageResult = previousImage
          ? await imageProvider.editImage({
              prompt: assistantPlan.content,
              attachments: [previousImage.url]
            })
          : await imageProvider.generateImage({
              prompt: assistantPlan.content
            });
        const nextImage: CreativeImageResult = {
          id: `car-image-${Date.now()}`,
          prompt: assistantPlan.content,
          url: imageResult.images[0]
        };
        const attachment: Attachment = {
          id: nextImage.id,
          type: "image",
          url: nextImage.url,
          name: "car-creative-image.png",
          mimeType: "image/png"
        };

        lastImage.value = nextImage;
        images.value = images.value.concat(nextImage);
        messages.value = messages.value.concat(
          createMessage(
            "assistant",
            previousImage ? "Generated the updated used-car creative image." : "Generated the used-car creative image.",
            [attachment]
          )
        );
      } catch (error) {
        messages.value = messages.value.concat(
          createMessage("assistant", error instanceof Error ? error.message : "Failed to generate the car creative image.")
        );
      } finally {
        isGenerating.value = false;
      }
    };

    return () =>
      h("section", { class: "grid min-h-screen grid-cols-[minmax(0,1fr)_360px] gap-6 bg-composer-bg p-6 text-composer-text" }, [
        h("main", { class: "flex min-h-0 flex-col" }, [
          h("div", { class: "min-h-0 flex-1 overflow-y-auto pb-6" }, [h(ConversationView, { messages: messages.value })]),
          h(AiComposer, {
            value: value.value,
            loading: isGenerating.value,
            placeholder: "Example: Generate a premium creative image for a white 2021 BMW 3 Series in an urban night scene.",
            uploadOptions: { accept: ["image/*"], maxFiles: 4 },
            "onUpdate:value": (nextValue: string) => {
              value.value = nextValue;
            },
            onSend: (nextValue: string) => {
              void send(nextValue);
            },
            onStop: () => conversationRuntime.abort()
          })
        ]),
        h("aside", { class: "min-h-0 overflow-y-auto border-l border-composer-softBorder pl-6" }, [
          h("h2", { class: "mb-4 text-sm font-semibold text-composer-text" }, "Image results"),
          h(
            "div",
            { class: "space-y-4" },
            images.value.map((image) =>
              h("article", { key: image.id, class: "overflow-hidden rounded-lg border border-composer-softBorder bg-composer-input" }, [
                h("img", { src: image.url, alt: "Used car creative result", class: "aspect-square w-full object-cover" }),
                h("div", { class: "space-y-3 p-3" }, [
                  h("p", { class: "line-clamp-3 text-xs leading-5 text-composer-muted" }, image.prompt),
                  h(
                    "a",
                    {
                      href: image.url,
                      download: "car-creative-image.png",
                      class: "inline-flex w-full items-center justify-center rounded-md bg-composer-brand px-3 py-2 text-sm font-medium text-composer-sendText"
                    },
                    "Download"
                  )
                ])
              ])
            )
          )
        ])
      ]);
  }
});
