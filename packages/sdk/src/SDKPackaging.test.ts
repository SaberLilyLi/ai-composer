import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as rootSdk from "./index";
import * as reactSdk from "./react";
import * as vueSdk from "./vue";
import * as coreSdk from "./core";

describe("SDK packaging", () => {
  it("exposes enterprise package subpaths", () => {
    const currentDir = fileURLToPath(new URL(".", import.meta.url));
    const packageJson = JSON.parse(readFileSync(resolve(currentDir, "../package.json"), "utf8")) as {
      name: string;
      exports: Record<string, unknown>;
    };
    expect(packageJson.name).toBe("@company/ai-studio-sdk");
    expect(packageJson.exports["./react"]).toBeTruthy();
    expect(packageJson.exports["./vue"]).toBeTruthy();
    expect(packageJson.exports["./core"]).toBeTruthy();
  });

  it("keeps the root public API limited to enterprise entry points", () => {
    expect("createAiStudio" in rootSdk).toBe(true);
    expect("SchemaValidator" in rootSdk).toBe(true);
    expect("WorkspaceFactory" in rootSdk).toBe(true);
    expect("PluginManager" in rootSdk).toBe(true);
    expect("requestAgentChat" in rootSdk).toBe(false);
    expect("requestAgentImage" in rootSdk).toBe(false);
    expect("getAgentRuntimeConfig" in rootSdk).toBe(false);
    expect("LegacyChatProvider" in rootSdk).toBe(false);
    expect("LegacyImageProvider" in rootSdk).toBe(false);
  });

  it("keeps react and vue public APIs limited to supported UI surfaces", () => {
    expect("AiComposer" in reactSdk).toBe(true);
    expect("ConversationView" in reactSdk).toBe(true);
    expect("WorkflowTimeline" in reactSdk).toBe(true);
    expect("AiStudioProvider" in reactSdk).toBe(true);
    expect("useAiStudio" in reactSdk).toBe(true);
    expect("AgentConversationWorkspace" in reactSdk).toBe(false);
    expect("AiStudioWorkspace" in reactSdk).toBe(false);
    expect("AiStudioDevtools" in reactSdk).toBe(false);

    expect("AiComposer" in vueSdk).toBe(true);
    expect("ConversationView" in vueSdk).toBe(true);
    expect("WorkflowTimeline" in vueSdk).toBe(true);
    expect("AiStudioProvider" in vueSdk).toBe(true);
    expect("useAiStudio" in vueSdk).toBe(true);
    expect("AgentConversationWorkspace" in vueSdk).toBe(false);
    expect("AiStudioWorkspace" in vueSdk).toBe(false);
    expect("AiStudioDevtools" in vueSdk).toBe(false);
  });

  it("retains reference workspace types on the core entry without leaking runtime helpers", () => {
    expect("createAiStudio" in coreSdk).toBe(true);
    expect("SchemaValidator" in coreSdk).toBe(true);
    expect("WorkspaceFactory" in coreSdk).toBe(true);
    expect("PluginManager" in coreSdk).toBe(true);
    expect("ConversationRuntime" in coreSdk).toBe(true);
    expect("GPTProvider" in coreSdk).toBe(true);
    expect("GPTImageProvider" in coreSdk).toBe(true);
    expect("requestAgentChat" in coreSdk).toBe(false);
    expect("requestAgentImage" in coreSdk).toBe(false);
    expect("getAgentRuntimeConfig" in coreSdk).toBe(false);
    expect("LegacyChatProvider" in coreSdk).toBe(false);
    expect("LegacyImageProvider" in coreSdk).toBe(false);
  });
});
