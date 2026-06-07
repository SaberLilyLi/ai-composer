import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const runtimeDir = resolve(root, ".generated-runtime");
const coreSourceDir = resolve(root, "../packages/core/src");

mkdirSync(runtimeDir, { recursive: true });

writeRuntimeModule(
  resolve(coreSourceDir, "schema/types.ts"),
  resolve(runtimeDir, "schema-types.mjs")
);
writeRuntimeModule(
  resolve(coreSourceDir, "json-schema.ts"),
  resolve(runtimeDir, "json-schema.mjs"),
  (source) => source.replace('from "./schema"', 'from "./schema-types.mjs"')
);
writeRuntimeModule(
  resolve(coreSourceDir, "DocumentationGenerator.ts"),
  resolve(runtimeDir, "DocumentationGenerator.mjs"),
  (source) => source.replace('from "./json-schema"', 'from "./json-schema.mjs"')
);

const { DocumentationGenerator } = await import(pathToFileURL(resolve(runtimeDir, "DocumentationGenerator.mjs")).href);

const generator = new DocumentationGenerator();
const schema = {
  workspace: "agent",
  provider: "openai",
  chatModel: "gpt-5.5",
  imageModel: "gpt-image-2",
  features: ["upload", "workflow", "history", "plugins"]
};
const pages = generator.generateSitePages(schema);

for (const [file, content] of Object.entries(pages)) {
  const target = join(root, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${content}\n`);
}

process.stdout.write(`Generated ${Object.keys(pages).length} documentation pages.\n`);

function writeRuntimeModule(inputPath, outputPath, transform = (value) => value) {
  const source = transform(readFileSync(inputPath, "utf8"));
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    }
  });

  writeFileSync(outputPath, result.outputText);
}
