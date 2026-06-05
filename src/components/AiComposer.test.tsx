import { cleanup, render, screen } from "@testing-library/react";
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

  it("submits on Enter and enables stop state", async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();

    render(<AiComposer onSend={handleSend} />);

    const input = screen.getByLabelText("AI Composer Input");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");

    expect(handleSend).toHaveBeenCalledWith("hello", { attachments: [] });
    expect(screen.getByRole("button", { name: "Stop" })).toHaveProperty("disabled", false);
    expect(screen.getByText("Generating...")).toBeTruthy();
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

    render(<AiComposer onSend={() => undefined} onStop={handleStop} />);

    const input = screen.getByLabelText("AI Composer Input");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Stop" }));

    expect(handleStop).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Ready")).toBeTruthy();
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
});
