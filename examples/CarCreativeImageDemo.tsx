import { useMemo, useRef, useState } from "react";
import { AiComposer, ConversationView } from "@company/ai-studio-sdk/react";
import { ConversationRuntime, GPTImageProvider, GPTProvider } from "@company/ai-studio-sdk/core";
import type { Attachment, Message } from "@company/ai-studio-sdk";

interface CarCreativeImageDemoProps {
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

export function CarCreativeImageDemo({
  apiKey,
  baseUrl = "https://api.openai.com/v1",
  chatModel = "gpt-5.5",
  imageModel = "gpt-image-2"
}: CarCreativeImageDemoProps) {
  const [messages, setMessages] = useState<Message[]>([
    createMessage(
      "assistant",
      "Describe the used-car creative image you want to generate. You can continue asking for edits after the first image."
    )
  ]);
  const [images, setImages] = useState<CreativeImageResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const lastImageRef = useRef<CreativeImageResult | undefined>(undefined);

  const conversationRuntime = useMemo(
    () =>
      new ConversationRuntime(
        new GPTProvider({
          provider: "openai",
          apiKey,
          baseUrl,
          model: chatModel
        })
      ),
    [apiKey, baseUrl, chatModel]
  );

  const imageProvider = useMemo(
    () =>
      new GPTImageProvider({
        provider: "openai",
        apiKey,
        baseUrl,
        model: imageModel
      }),
    [apiKey, baseUrl, imageModel]
  );

  const handleSend = async (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue || isGenerating) {
      return;
    }

    setIsGenerating(true);
    const userMessage = createMessage("user", trimmedValue);
    setMessages((current) => current.concat(userMessage));

    try {
      const previousImage = lastImageRef.current;
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

      lastImageRef.current = nextImage;
      setImages((current) => current.concat(nextImage));
      setMessages((current) =>
        current.concat(
          createMessage(
            "assistant",
            previousImage
              ? "Generated the updated used-car creative image."
              : "Generated the used-car creative image.",
            [attachment]
          )
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate the car creative image.";
      setMessages((current) => current.concat(createMessage("assistant", message)));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="grid min-h-screen grid-cols-[minmax(0,1fr)_360px] gap-6 bg-composer-bg p-6 text-composer-text">
      <main className="flex min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">
          <ConversationView messages={messages} />
        </div>
        <AiComposer
          disabled={isGenerating}
          placeholder="Example: Generate a premium creative image for a white 2021 BMW 3 Series in an urban night scene."
          onSend={handleSend}
        />
      </main>

      <aside className="min-h-0 overflow-y-auto border-l border-composer-softBorder pl-6">
        <h2 className="mb-4 text-sm font-semibold text-composer-text">Image results</h2>
        <div className="space-y-4">
          {images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-lg border border-composer-softBorder bg-composer-input">
              <img src={image.url} alt="Used car creative result" className="aspect-square w-full object-cover" />
              <div className="space-y-3 p-3">
                <p className="line-clamp-3 text-xs leading-5 text-composer-muted">{image.prompt}</p>
                <a
                  href={image.url}
                  download="car-creative-image.png"
                  className="inline-flex w-full items-center justify-center rounded-md bg-composer-brand px-3 py-2 text-sm font-medium text-composer-sendText"
                >
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
