import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiComposer } from "./AiComposer";

afterEach(() => {
  cleanup();
});

describe("AiComposer", () => {
  it("adds attachments through the attach action", async () => {
    const user = userEvent.setup();
    const handleAttachmentsChange = vi.fn();

    render(
      <AiComposer
        onAttachmentsChange={handleAttachmentsChange}
        uploadOptions={{ accept: ["image/*"], maxFiles: 2, maxFileSize: 1024 * 1024 }}
      />
    );

    const fileInput = screen.getByLabelText("Add image").parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["hello"], "preview.png", { type: "image/png" });

    await user.upload(fileInput, file);

    expect(handleAttachmentsChange).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Remove preview.png" })).toBeTruthy();
  });

  it("opens an image preview when a thumbnail is clicked", async () => {
    const user = userEvent.setup();
    const file = new File(["hello"], "preview.png", { type: "image/png" });

    render(
      <AiComposer
        defaultAttachments={[
          {
            id: "preview",
            file,
            name: "preview.png",
            size: 5,
            type: "image/png",
            previewUrl: "data:image/png;base64,preview",
            status: "ready"
          }
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Preview preview.png" }));

    expect(screen.getByRole("dialog", { name: "Preview preview.png" })).toBeTruthy();
    expect(screen.getAllByAltText("preview.png").length).toBeGreaterThan(1);
  });

  it("shows all image cards in the html stack", () => {
    const attachments = Array.from({ length: 12 }, (_, index) => ({
      id: `image-${index}`,
      file: new File(["image"], `image-${index}.png`, { type: "image/png" }),
      name: `image-${index}.png`,
      size: 5,
      type: "image/png",
      previewUrl: `data:image/png;base64,image-${index}`,
      status: "ready" as const
    }));

    render(<AiComposer defaultAttachments={attachments} />);

    expect(screen.getAllByTestId("image-stack-item")).toHaveLength(12);
    expect(screen.queryByTestId("image-stack-overflow")).toBeNull();
    expect(screen.getByTestId("image-stack-upload")).toBeTruthy();
  });

  it("uses the newest images in the html stack", () => {
    const attachments = Array.from({ length: 5 }, (_, index) => ({
      id: `ordered-image-${index}`,
      file: new File(["image"], `ordered-image-${index}.png`, { type: "image/png" }),
      name: `ordered-image-${index}.png`,
      size: 5,
      type: "image/png",
      previewUrl: `data:image/png;base64,ordered-image-${index}`,
      status: "ready" as const
    }));

    render(<AiComposer defaultAttachments={attachments} />);

    const cards = screen.getAllByTestId("image-stack-item");
    expect(cards[0].getAttribute("aria-label")).toBe("Preview ordered-image-0.png");
    expect(cards[4].getAttribute("aria-label")).toBe("Preview ordered-image-4.png");
    expect(cards[4].style.zIndex).toBe("5");
  });

  it("expands the image stack only while it is hovered", async () => {
    const user = userEvent.setup();
    const attachments = Array.from({ length: 5 }, (_, index) => ({
      id: `hover-image-${index}`,
      file: new File(["image"], `hover-image-${index}.png`, { type: "image/png" }),
      name: `hover-image-${index}.png`,
      size: 5,
      type: "image/png",
      previewUrl: `data:image/png;base64,hover-image-${index}`,
      status: "ready" as const
    }));

    render(<AiComposer defaultAttachments={attachments} />);

    const stack = screen.getByTestId("image-stack");
    const upload = screen.getByTestId("image-stack-upload");
    const frontCard = screen.getAllByTestId("image-stack-item")[4];
    expect(stack.style.width).toBe("120px");
    expect(screen.getByLabelText("Add image").textContent).toBe("+");

    await user.hover(frontCard);
    await waitFor(() => expect(stack.style.width).toBe("426px"));
    await waitFor(() => expect(upload.style.left).toBe("364px"));
    await waitFor(() => expect(upload.style.width).toBe("62px"));
    await waitFor(() => expect(upload.style.height).toBe("76px"));

    await user.unhover(stack);
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 1000, clientY: 1000 }));
    await waitFor(() => expect(stack.style.width).toBe("120px"));
    await waitFor(() => expect(upload.style.width).toBe("41px"));
  });

  it("does not expand the image stack when the collapsed upload button is hovered", async () => {
    const user = userEvent.setup();
    const attachments = Array.from({ length: 3 }, (_, index) => ({
      id: `upload-hover-image-${index}`,
      file: new File(["image"], `upload-hover-image-${index}.png`, { type: "image/png" }),
      name: `upload-hover-image-${index}.png`,
      size: 5,
      type: "image/png",
      previewUrl: `data:image/png;base64,upload-hover-image-${index}`,
      status: "ready" as const
    }));

    render(<AiComposer defaultAttachments={attachments} />);

    const stack = screen.getByTestId("image-stack");
    const upload = screen.getByTestId("image-stack-upload");

    await user.hover(upload);

    expect(stack.style.width).toBe("120px");
    expect(screen.getByLabelText("Add image").textContent).toBe("+");
  });

  it("removes a selected expanded image from its own stack action", async () => {
    const user = userEvent.setup();
    const attachments = Array.from({ length: 3 }, (_, index) => ({
      id: `remove-image-${index}`,
      file: new File(["image"], `remove-image-${index}.png`, { type: "image/png" }),
      name: `remove-image-${index}.png`,
      size: 5,
      type: "image/png",
      previewUrl: `data:image/png;base64,remove-image-${index}`,
      status: "ready" as const
    }));

    render(<AiComposer defaultAttachments={attachments} />);

    const middleCard = screen.getAllByTestId("image-stack-item")[1];
    await user.hover(middleCard);
    await user.click(screen.getByRole("button", { name: "Remove remove-image-1.png" }));

    expect(screen.queryByRole("button", { name: "Preview remove-image-1.png" })).toBeNull();
    expect(screen.getByRole("button", { name: "Preview remove-image-2.png" })).toBeTruthy();
  });

  it("submits on Enter and disables send by default while waiting", async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();

    render(<AiComposer onSend={handleSend} />);

    const input = screen.getByLabelText("AI Composer Input");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");

    expect(handleSend).toHaveBeenCalledWith("hello", { attachments: [] });
    expect(screen.queryByRole("button", { name: "Stop" })).toBeNull();
    expect(screen.getByRole("button", { name: "Send" })).toHaveProperty("disabled", true);
    expect(screen.getByText("Generating...").className).toContain("sr-only");
  });

  it("shows configurable status text and action hint when enabled", async () => {
    const user = userEvent.setup();

    render(
      <AiComposer
        showStatusText
        statusTextMap={{ generating: "正在生成..." }}
        actionHint="预计 10 秒"
        onSend={() => undefined}
      />
    );

    const input = screen.getByLabelText("AI Composer Input");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");

    expect(screen.getByText("正在生成...").className).not.toContain("sr-only");
    expect(screen.getByText("预计 10 秒")).toBeTruthy();
  });

  it("shows stop state when enabled", async () => {
    const user = userEvent.setup();

    render(<AiComposer showStopButton onSend={() => undefined} />);

    const input = screen.getByLabelText("AI Composer Input");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Stop" })).toHaveProperty("disabled", false);
  });

  it("keeps newline behavior on Shift+Enter", async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();

    render(<AiComposer onSend={handleSend} />);

    const input = screen.getByLabelText("AI Composer Input");
    await user.type(input, "hello");
    await user.keyboard("{Shift>}{Enter}{/Shift}");

    expect(handleSend).not.toHaveBeenCalled();
    expect(input).toHaveProperty("value", "hello\n");
  });

  it("returns to idle when stop is clicked", async () => {
    const user = userEvent.setup();
    const handleStop = vi.fn();

    render(<AiComposer showStopButton onSend={() => undefined} onStop={handleStop} />);

    const input = screen.getByLabelText("AI Composer Input");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Stop" }));

    expect(handleStop).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Ready").className).toContain("sr-only");
  });

  it("reports upload validation errors", async () => {
    const user = userEvent.setup();
    const handleAttachmentError = vi.fn();

    render(
      <AiComposer
        onAttachmentError={handleAttachmentError}
        uploadOptions={{ accept: [".pdf"], maxFiles: 1, maxFileSize: 10 }}
      />
    );

    const fileInput = screen.getByLabelText("Add image").parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(["this file is too large"], "report.pdf", { type: "application/pdf" });

    await user.upload(fileInput, invalidFile);

    expect(handleAttachmentError).toHaveBeenCalled();
  });

  it("hides action options by default", () => {
    render(<AiComposer />);

    expect(screen.queryByRole("combobox", { name: "Model" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Reasoning speed" })).toBeNull();
  });

  it("shows configurable action options when enabled", async () => {
    const user = userEvent.setup();
    const handleActionChange = vi.fn();

    render(
      <AiComposer
        showActionOptions
        actionOptions={[
          {
            id: "model",
            label: "Model",
            value: "qwen-plus",
            options: [
              { label: "Qwen", value: "qwen-plus" },
              { label: "Qwen Max", value: "qwen-max" }
            ]
          },
          {
            id: "reasoning-speed",
            label: "Reasoning speed",
            value: "balanced",
            options: [
              { label: "Fast", value: "fast" },
              { label: "Balanced", value: "balanced" },
              { label: "Deep", value: "deep" }
            ]
          }
        ]}
        onActionOptionChange={handleActionChange}
      />
    );

    const modelSelect = screen.getByRole("combobox", { name: "Model" });
    const speedSelect = screen.getByRole("combobox", { name: "Reasoning speed" });

    expect((modelSelect as HTMLSelectElement).value).toBe("qwen-plus");
    expect((speedSelect as HTMLSelectElement).value).toBe("balanced");

    await user.selectOptions(modelSelect, "qwen-max");

    expect(handleActionChange).toHaveBeenCalledWith("model", "qwen-max");
    expect(speedSelect).toBeTruthy();
  });
});
