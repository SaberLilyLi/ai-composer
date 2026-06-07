import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentConversationWorkspace } from "./AgentConversationWorkspace";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AgentConversationWorkspace runtime integration", () => {
  it("sends chat requests through the runtime-driven workspace flow", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "qwen3.7-plus",
        choices: [{ message: { content: "hello from runtime" } }]
      })
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AgentConversationWorkspace
        config={{
          apiKey: "test-key",
          baseUrl: "https://example.com",
          chatModel: "qwen3.7-plus",
          imageModel: "wan2.7-image-pro",
          ui: {
            modeSwitch: {
              enabled: true,
              modes: ["chat", "image"]
            }
          }
        }}
      />
    );

    const input = screen.getByLabelText("AI Composer Input");
    await user.type(input, "hello");
    await user.keyboard("{Enter}");

    await waitFor(() => expect(screen.getByText("hello from runtime")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalled();
  });
});
