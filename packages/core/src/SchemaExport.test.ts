import { describe, expect, it } from "vitest";
import { SchemaExporter } from "./json-schema";

describe("SchemaExporter", () => {
  it("exports enterprise JSON schemas", () => {
    const exporter = new SchemaExporter();
    const workspaceSchema = exporter.exportWorkspaceSchema();

    expect(workspaceSchema.title).toBe("WorkspaceSchema");
    expect(workspaceSchema.properties.workspace).toBeTruthy();
    expect(exporter.introspect("provider").properties).toContain("chatModel");
  });
});
