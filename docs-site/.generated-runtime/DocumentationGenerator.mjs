import { SchemaExporter } from "./json-schema.mjs";
export class DocumentationGenerator {
    generateSitePages(schema) {
        const docs = this.generate(schema);
        return {
            "index.md": "# AI Studio SDK\n\nEnterprise documentation site for the AI Studio SDK.\n",
            "getting-started.md": docs.gettingStarted,
            "installation.md": docs.installation,
            "react-guide.md": docs.react,
            "vue-guide.md": docs.vue,
            "schema-guide.md": docs.schema,
            "provider-guide.md": docs.provider,
            "plugin-guide.md": docs.plugin,
            "workspace-guide.md": docs.workspace,
            "examples.md": docs.examples,
            "faq.md": docs.faq,
            "migration-guide.md": docs.migration
        };
    }
    generate(schema) {
        return {
            gettingStarted: this.generateGettingStarted(schema),
            installation: this.generateInstallation(),
            react: this.generateReactDocs(schema),
            vue: this.generateVueDocs(schema),
            provider: this.generateProviderDocs(schema),
            workspace: this.generateWorkspaceDocs(schema),
            examples: this.generateExamplesDocs(),
            faq: this.generateFaqDocs(),
            migration: this.generateMigrationDocs(),
            props: this.generatePropsDocs(schema),
            schema: this.generateSchemaDocs(schema),
            plugin: this.generatePluginDocs()
        };
    }
    generateGettingStarted(schema) {
        return [
            "# Getting Started",
            "",
            "1. Install the SDK package for your framework.",
            "2. Create an AI studio config with `createAiStudio()`.",
            "3. Mount the workspace provider and workspace view.",
            "",
            `Default workspace for this page: \`${schema.workspace}\`.`
        ].join("\n");
    }
    generateInstallation() {
        return [
            "# Installation",
            "",
            "```bash",
            "pnpm add @company/ai-studio-sdk",
            "pnpm add react react-dom",
            "```"
        ].join("\n");
    }
    generateReactDocs(schema) {
        return [
            "# React SDK",
            "",
            "```tsx",
            "import { AiStudioProvider, AiStudioWorkspace } from \"@company/ai-studio-sdk/react\";",
            "import { createAiStudio } from \"@company/ai-studio-sdk/core\";",
            "",
            "const studio = createAiStudio(",
            JSON.stringify({
                workspace: schema.workspace,
                provider: schema.provider,
                chatModel: schema.chatModel,
                imageModel: schema.imageModel,
                features: schema.features
            }, null, 2),
            ");",
            "",
            "export function App() {",
            "  return (",
            "    <AiStudioProvider studio={studio}>",
            "      <AiStudioWorkspace />",
            "    </AiStudioProvider>",
            "  );",
            "}",
            "```"
        ].join("\n");
    }
    generateVueDocs(schema) {
        return [
            "# Vue SDK",
            "",
            "```ts",
            "import { createAiStudio } from \"@company/ai-studio-sdk/core\";",
            "import { AiStudioProvider, AiStudioWorkspace } from \"@company/ai-studio-sdk/vue\";",
            "",
            `const studio = createAiStudio(${JSON.stringify({
                workspace: schema.workspace,
                provider: schema.provider,
                chatModel: schema.chatModel,
                imageModel: schema.imageModel,
                features: schema.features
            })});`,
            "```"
        ].join("\n");
    }
    generatePropsDocs(schema) {
        return [
            "# Workspace Props",
            "",
            `- workspace: ${schema.workspace}`,
            `- provider: ${schema.provider}`,
            `- chatModel: ${schema.chatModel}`,
            `- imageModel: ${schema.imageModel}`,
            `- features: ${schema.features.join(", ") || "none"}`
        ].join("\n");
    }
    generateSchemaDocs(schema) {
        return [
            "# Schema",
            "",
            "```json",
            JSON.stringify(schema, null, 2),
            "```",
            "",
            "## JSON Schema Export",
            "",
            "```json",
            JSON.stringify(new SchemaExporter().exportWorkspaceSchema(), null, 2),
            "```"
        ].join("\n");
    }
    generatePluginDocs() {
        return [
            "# Plugin Manifest",
            "",
            "```json",
            JSON.stringify({
                name: "video",
                version: "1.0.0",
                capabilities: ["video_generate"],
                permissions: [{ capability: "video_generate", scope: "workspace", resource: "workflow" }]
            }, null, 2),
            "```"
        ].join("\n");
    }
    generateProviderDocs(schema) {
        return [
            "# Provider Guide",
            "",
            `- provider: ${schema.provider}`,
            `- chatModel: ${schema.chatModel}`,
            `- imageModel: ${schema.imageModel}`,
            "- runtime provider resolution goes through ProviderRegistry"
        ].join("\n");
    }
    generateWorkspaceDocs(schema) {
        return [
            "# Workspace Guide",
            "",
            `- workspace: ${schema.workspace}`,
            `- features: ${schema.features.join(", ") || "none"}`,
            "- all execution still flows through ConversationRuntime and WorkflowRuntime"
        ].join("\n");
    }
    generateExamplesDocs() {
        return [
            "# Examples",
            "",
            "- React chat example",
            "- React image example",
            "- Vue chat example",
            "- Vue image example",
            "- Plugin example",
            "- Schema example",
            "- CLI example"
        ].join("\n");
    }
    generateFaqDocs() {
        return [
            "# FAQ",
            "",
            "## Does the workspace call providers directly?",
            "No. Runtime remains the only execution chain.",
            "",
            "## Can plugins crash the runtime?",
            "No. Plugin lifecycle execution is wrapped in the sandbox layer."
        ].join("\n");
    }
    generateMigrationDocs() {
        return [
            "# Migration Guide",
            "",
            "1. Replace direct workspace config wiring with `createAiStudio()`.",
            "2. Move provider config into `WorkspaceSchema`.",
            "3. Replace direct plugin lifecycle handling with `PluginManager`."
        ].join("\n");
    }
}
