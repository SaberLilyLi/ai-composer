import { describe, expect, it, vi } from "vitest";
import { ComposerCore } from "./ComposerCore";
import { CommandPlugin } from "./plugins/CommandPlugin";
import { MentionPlugin } from "./plugins/MentionPlugin";
import { UploadPlugin } from "./plugins/UploadPlugin";

describe("ComposerCore", () => {
  it("trims value and enters generating state when sending", () => {
    const core = new ComposerCore({ value: "  hello world  " });
    const handleSend = vi.fn();
    core.onSend(handleSend);

    const result = core.send();

    expect(result).toBe("hello world");
    expect(handleSend).toHaveBeenCalledWith({ value: "hello world", attachments: [] });
    expect(core.getState().phase).toBe("generating");
  });

  it("does not send when the value is empty", () => {
    const core = new ComposerCore({ value: "   " });
    const handleSend = vi.fn();
    core.onSend(handleSend);

    const result = core.send();

    expect(result).toBeNull();
    expect(handleSend).not.toHaveBeenCalled();
    expect(core.getState().phase).toBe("idle");
  });

  it("returns to idle when stopped", () => {
    const core = new ComposerCore({ value: "hello" });
    core.send();

    const stopResult = core.stop();

    expect(stopResult).toBe(true);
    expect(core.getState().phase).toBe("idle");
  });

  it("adds and removes attachments through the upload plugin", () => {
    const core = new ComposerCore();
    core.use(
      new UploadPlugin({
        accept: ["image/*"],
        maxFiles: 2,
        maxFileSize: 1024 * 1024
      })
    );

    const file = new File(["hello"], "preview.png", { type: "image/png" });
    const addResult = core.addAttachments([file]);

    expect(addResult.added).toHaveLength(1);
    expect(addResult.errors).toHaveLength(0);
    expect(core.getState().attachments).toHaveLength(1);

    const removeResult = core.removeAttachment(core.getState().attachments[0].id);
    expect(removeResult).toBe(true);
    expect(core.getState().attachments).toHaveLength(0);
  });

  it("defaults upload capacity to nine attachments", () => {
    const core = new ComposerCore();
    core.use(new UploadPlugin({ accept: ["image/*"] }));

    const files = Array.from({ length: 10 }, (_, index) => {
      return new File(["hello"], `preview-${index}.png`, { type: "image/png" });
    });

    const addResult = core.addAttachments(files);

    expect(addResult.added).toHaveLength(9);
    expect(addResult.errors).toHaveLength(1);
    expect(addResult.errors[0]?.message).toBe("You can attach up to 9 files.");
    expect(core.getState().attachments).toHaveLength(9);
  });

  it("opens mention context and inserts the selected mention", () => {
    const core = new ComposerCore({ value: "@de" });
    core.use(new MentionPlugin());
    core.setMentionItems([
      { id: "design", label: "Design Agent", value: "design", description: "Visual product specialist" },
      { id: "research", label: "Research Agent", value: "research", description: "Discovery specialist" }
    ]);

    const handleMentionSelect = vi.fn();
    core.onMentionSelect(handleMentionSelect);

    core.syncContext("@de", 3);

    expect(core.getState().context.isOpen).toBe(true);
    expect(core.getState().context.suggestions[0].value).toBe("design");

    const selected = core.selectContextItem();

    expect(selected?.value).toBe("design");
    expect(core.getState().value).toBe("@design");
    expect(handleMentionSelect).toHaveBeenCalledWith({
      item: {
        id: "design",
        label: "Design Agent",
        value: "design",
        description: "Visual product specialist",
        kind: "mention"
      }
    });
  });

  it("opens command context and inserts the selected command", () => {
    const core = new ComposerCore({ value: "/su" });
    core.use(new CommandPlugin());
    core.setCommandItems([
      { id: "summarize", label: "Summarize", value: "summarize", description: "Shorten the response" },
      { id: "translate", label: "Translate", value: "translate", description: "Change the language" }
    ]);

    const handleCommandSelect = vi.fn();
    core.onCommandSelect(handleCommandSelect);

    core.syncContext("/su", 3);

    expect(core.getState().context.isOpen).toBe(true);
    expect(core.getState().context.suggestions[0].value).toBe("summarize");

    const selected = core.selectContextItem();

    expect(selected?.value).toBe("summarize");
    expect(core.getState().value).toBe("/summarize");
    expect(handleCommandSelect).toHaveBeenCalledWith({
      item: {
        id: "summarize",
        label: "Summarize",
        value: "summarize",
        description: "Shorten the response",
        kind: "command"
      }
    });
  });
});
