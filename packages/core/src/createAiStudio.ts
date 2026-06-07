import { DocumentationGenerator } from "./DocumentationGenerator";
import { createDevtoolsSnapshot, type DevtoolsSnapshot } from "./devtools";
import type { AiStudioPlugin } from "./PluginManager";
import { SchemaValidator } from "./SchemaValidator";
import { WorkspaceFactory, type WorkspaceInstance } from "./WorkspaceFactory";
import type { WorkspaceSchema, WorkspaceSchemaInput } from "./schema";
import { SchemaExporter } from "./json-schema";

export interface AiStudioConfig extends WorkspaceSchemaInput {
  plugins?: AiStudioPlugin[];
}

export interface AiStudio {
  schema: WorkspaceSchema;
  workspace: WorkspaceInstance;
  validator: SchemaValidator;
  documentation: DocumentationGenerator;
  schemaExporter: SchemaExporter;
  devtools: {
    snapshot: () => DevtoolsSnapshot;
  };
}

export function createAiStudio(config: AiStudioConfig = {}): AiStudio {
  const validator = new SchemaValidator();
  const schema = validator.normalize("workspace", config);
  const workspace = new WorkspaceFactory(validator).createWorkspace(schema, {
    plugins: config.plugins
  });

  return {
    schema,
    workspace,
    validator,
    documentation: new DocumentationGenerator(),
    schemaExporter: new SchemaExporter(),
    devtools: {
      snapshot: () => createDevtoolsSnapshot(workspace)
    }
  };
}
