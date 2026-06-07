import { describe, expect, it } from "vitest";
import { featureNames, workspaceKinds } from "./schema";

describe("schema contracts", () => {
  it("exposes supported workspace kinds", () => {
    expect(workspaceKinds).toEqual(["chat", "image", "agent"]);
  });

  it("exposes supported enterprise features", () => {
    expect(featureNames).toContain("upload");
    expect(featureNames).toContain("workflow");
  });
});
