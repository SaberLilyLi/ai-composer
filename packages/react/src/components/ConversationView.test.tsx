import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Message } from "../core/types";
import { ConversationView } from "./ConversationView";

afterEach(() => {
  cleanup();
});

describe("ConversationView", () => {
  it("renders user, assistant, system messages and markdown", () => {
    const messages: Message[] = [
      {
        id: "user-1",
        role: "user",
        content: "Generate **three** options",
        createdAt: 1
      },
      {
        id: "assistant-1",
        role: "assistant",
        content: "- First\n- Second",
        status: "streaming",
        createdAt: 2
      },
      {
        id: "system-1",
        role: "system",
        content: "Generation stopped.",
        createdAt: 3
      }
    ];

    render(<ConversationView messages={messages} />);

    expect(screen.getByText("three")).toBeTruthy();
    expect(screen.getByText("First")).toBeTruthy();
    expect(screen.getByText("Streaming")).toBeTruthy();
    expect(screen.getByText("Generation stopped.")).toBeTruthy();
  });

  it("renders image and file attachments", () => {
    const messages: Message[] = [
      {
        id: "assistant-1",
        role: "assistant",
        content: "Done",
        createdAt: 1,
        attachments: [
          {
            id: "image-1",
            type: "image",
            url: "data:image/png;base64,preview",
            name: "preview.png",
            mimeType: "image/png"
          },
          {
            id: "file-1",
            type: "file",
            url: "",
            name: "brief.pdf",
            mimeType: "application/pdf"
          }
        ]
      }
    ];

    render(<ConversationView messages={messages} />);

    expect(screen.getByAltText("preview.png")).toBeTruthy();
    expect(screen.getByText("brief.pdf")).toBeTruthy();
  });
});
