import { featureNames, workspaceKinds } from "./schema-types.mjs";
export class SchemaExporter {
    exportAll() {
        return {
            workspace: this.exportWorkspaceSchema(),
            provider: this.exportProviderSchema(),
            feature: this.exportFeatureSchema(),
            theme: this.exportThemeSchema()
        };
    }
    exportWorkspaceSchema() {
        return {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            $id: "https://company.local/schemas/workspace.schema.json",
            title: "WorkspaceSchema",
            type: "object",
            additionalProperties: false,
            required: ["workspace", "provider", "chatModel", "imageModel", "features", "theme", "providerConfig"],
            properties: {
                workspace: {
                    type: "string",
                    enum: [...workspaceKinds]
                },
                provider: {
                    type: "string",
                    minLength: 1
                },
                chatModel: {
                    type: "string",
                    minLength: 1
                },
                imageModel: {
                    type: "string",
                    minLength: 1
                },
                features: {
                    type: "array",
                    uniqueItems: true,
                    items: {
                        type: "string",
                        enum: [...featureNames]
                    }
                },
                theme: {
                    $ref: "#/definitions/ThemeSchema"
                },
                providerConfig: {
                    $ref: "#/definitions/ProviderSchema"
                }
            },
            definitions: {
                ThemeSchema: this.exportThemeSchema(),
                ProviderSchema: this.exportProviderSchema()
            }
        };
    }
    exportProviderSchema() {
        return {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            $id: "https://company.local/schemas/provider.schema.json",
            title: "ProviderSchema",
            type: "object",
            additionalProperties: false,
            required: ["provider", "apiKey", "baseUrl", "chatModel", "imageModel", "timeout", "maxRetries"],
            properties: {
                provider: { type: "string", minLength: 1 },
                apiKey: { type: "string" },
                baseUrl: { type: "string", minLength: 1 },
                chatModel: { type: "string", minLength: 1 },
                imageModel: { type: "string", minLength: 1 },
                timeout: { type: "number", minimum: 1 },
                maxRetries: { type: "number", minimum: 0 }
            }
        };
    }
    exportFeatureSchema() {
        return {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            $id: "https://company.local/schemas/feature.schema.json",
            title: "FeatureSchema",
            type: "object",
            additionalProperties: false,
            required: [...featureNames],
            properties: Object.fromEntries(featureNames.map((feature) => [feature, { type: "boolean" }]))
        };
    }
    exportThemeSchema() {
        return {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            $id: "https://company.local/schemas/theme.schema.json",
            title: "ThemeSchema",
            type: "object",
            additionalProperties: false,
            required: ["mode", "tokens"],
            properties: {
                mode: {
                    type: "string",
                    enum: ["light", "dark", "auto"]
                },
                tokens: {
                    type: "object",
                    additionalProperties: {
                        type: "string"
                    }
                }
            }
        };
    }
    introspect(schema) {
        const document = this.exportAll()[schema];
        return {
            name: document.title,
            properties: Object.keys(document.properties),
            required: document.required ?? []
        };
    }
}
