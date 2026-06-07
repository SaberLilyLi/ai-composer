#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { SchemaValidator, type WorkspaceKind } from "@company/ai-composer-core";

export interface CliInitOptions {
  cwd?: string;
  workspace?: WorkspaceKind;
}

export function createWorkspaceScaffold(options: CliInitOptions = {}): string[] {
  const cwd = resolve(options.cwd ?? process.cwd());
  const workspace = options.workspace ?? "chat";
  const validator = new SchemaValidator();
  const schema = validator.normalize("workspace", {
    workspace,
    provider: "openai",
    features: workspace === "chat" ? ["upload", "streaming"] : ["upload", "workflow", "history"]
  });
  const outputDir = join(cwd, ".ai-studio");

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "workspace.schema.json"), JSON.stringify(schema, null, 2));
  writeFileSync(
    join(outputDir, "provider.config.json"),
    JSON.stringify(
      {
        provider: schema.providerConfig.provider,
        apiKey: "",
        baseUrl: schema.providerConfig.baseUrl,
        chatModel: schema.providerConfig.chatModel,
        imageModel: schema.providerConfig.imageModel
      },
      null,
      2
    )
  );
  writeFileSync(
    join(outputDir, "ai-studio.ts"),
    [
      "import { createAiStudio } from \"@company/ai-studio-sdk/core\";",
      "",
      "export const studio = createAiStudio(",
      JSON.stringify(
        {
          workspace: schema.workspace,
          provider: schema.provider,
          chatModel: schema.chatModel,
          imageModel: schema.imageModel,
          features: schema.features
        },
        null,
        2
      ),
      ");"
    ].join("\n")
  );

  return [
    join(outputDir, "workspace.schema.json"),
    join(outputDir, "provider.config.json"),
    join(outputDir, "ai-studio.ts")
  ];
}

function parseWorkspace(args: string[]): WorkspaceKind {
  const explicit = args.find((arg) => arg === "chat" || arg === "image" || arg === "agent");
  const option = args.find((arg) => arg.startsWith("--workspace="))?.split("=")[1];

  if (option === "chat" || option === "image" || option === "agent") {
    return option;
  }

  return explicit ?? "chat";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , command, ...args] = process.argv;

  if (command === "init") {
    const files = createWorkspaceScaffold({
      workspace: parseWorkspace(args)
    });
    process.stdout.write(`Created AI Studio scaffold:\n${files.join("\n")}\n`);
  } else {
    process.stdout.write("Usage: npx ai-studio init [chat|image|agent]\n");
  }
}
