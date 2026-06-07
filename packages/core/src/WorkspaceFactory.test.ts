import { describe, expect, it } from "vitest";
import { WorkspaceFactory } from "./WorkspaceFactory";

describe("WorkspaceFactory", () => {
  it("creates an agent workspace on top of the unified runtime chain", () => {
    const workspace = new WorkspaceFactory().createWorkspace({
      workspace: "agent",
      provider: "openai",
      chatModel: "gpt-5.5",
      imageModel: "gpt-image-2",
      features: ["upload", "workflow", "history"]
    });

    expect(workspace.kind).toBe("agent");
    expect(workspace.schema.providerConfig.chatModel).toBe("gpt-5.5");
    expect(workspace.providerRegistry.listProviders()).toContain("chat");
    expect(workspace.providerRegistry.listProviders()).toContain("image");
  });
});
