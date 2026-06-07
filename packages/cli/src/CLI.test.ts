import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createWorkspaceScaffold } from "./index";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("CLI", () => {
  it("creates enterprise workspace scaffold files", () => {
    const cwd = mkdtempSync(join(tmpdir(), "ai-studio-cli-"));
    tempDirs.push(cwd);

    const files = createWorkspaceScaffold({
      cwd,
      workspace: "agent"
    });

    expect(files).toHaveLength(3);
    expect(existsSync(join(cwd, ".ai-studio", "workspace.schema.json"))).toBe(true);
    expect(readFileSync(join(cwd, ".ai-studio", "workspace.schema.json"), "utf8")).toContain("\"workspace\": \"agent\"");
  });
});
