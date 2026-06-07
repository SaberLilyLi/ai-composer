import type { ComposerTheme, ThemeTokenName } from "@company/ai-composer-shared";
import {
  featureNames,
  workspaceKinds,
  type FeatureName,
  type FeatureSchema,
  type FeatureSchemaInput,
  type ProviderSchema,
  type ProviderSchemaInput,
  type SchemaValidationResult,
  type ThemeSchema,
  type ThemeSchemaInput,
  type WorkspaceSchema,
  type WorkspaceSchemaInput
} from "./schema";

export type SchemaKind = "workspace" | "provider" | "feature" | "theme";
type SchemaMap = {
  workspace: WorkspaceSchema;
  provider: ProviderSchema;
  feature: FeatureSchema;
  theme: ThemeSchema;
};
type SchemaInputMap = {
  workspace: WorkspaceSchemaInput | undefined;
  provider: ProviderSchemaInput | undefined;
  feature: FeatureSchemaInput;
  theme: ThemeSchemaInput;
};

const DEFAULT_PROVIDER = "openai";
const DEFAULT_CHAT_MODEL = "gpt-5.5";
const DEFAULT_IMAGE_MODEL = "gpt-image-2";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_THEME_MODE: ComposerTheme = "auto";
const DEFAULT_THEME_TOKENS: Partial<Record<ThemeTokenName, string>> = {};

export class SchemaValidator {
  defaults<TKey extends SchemaKind>(kind: TKey, input?: SchemaInputMap[TKey]): SchemaMap[TKey] {
    if (kind === "provider") {
      return createProviderSchema(input as ProviderSchemaInput | undefined) as SchemaMap[TKey];
    }

    if (kind === "feature") {
      return createFeatureSchema(input as FeatureSchemaInput) as SchemaMap[TKey];
    }

    if (kind === "theme") {
      return createThemeSchema(input as ThemeSchemaInput) as SchemaMap[TKey];
    }

    return createWorkspaceSchema(input as WorkspaceSchemaInput | undefined) as SchemaMap[TKey];
  }

  normalize<TKey extends SchemaKind>(kind: TKey, input?: SchemaInputMap[TKey]): SchemaMap[TKey] {
    return this.defaults(kind, input);
  }

  validate<TKey extends SchemaKind>(kind: TKey, input?: SchemaInputMap[TKey]): SchemaValidationResult<SchemaMap[TKey]> {
    const value = this.normalize(kind, input);
    const errors = validateSchema(kind, value);

    return {
      valid: errors.length === 0,
      errors,
      value: errors.length === 0 ? value : undefined
    };
  }
}

function createWorkspaceSchema(input?: WorkspaceSchemaInput): WorkspaceSchema {
  const providerConfig = createProviderSchema({
    provider: input?.provider,
    apiKey: input?.apiKey,
    baseUrl: input?.baseUrl,
    chatModel: input?.chatModel,
    imageModel: input?.imageModel,
    timeout: input?.timeout,
    maxRetries: input?.maxRetries
  });

  return {
    workspace: workspaceKinds.includes(input?.workspace ?? "agent") ? (input?.workspace ?? "agent") : "agent",
    provider: providerConfig.provider,
    chatModel: providerConfig.chatModel,
    imageModel: providerConfig.imageModel,
    features: toFeatureList(input?.features),
    theme: createThemeSchema(input?.theme),
    providerConfig
  };
}

function createProviderSchema(input?: ProviderSchemaInput): ProviderSchema {
  return {
    provider: typeof input?.provider === "string" && input.provider ? input.provider : DEFAULT_PROVIDER,
    apiKey: typeof input?.apiKey === "string" ? input.apiKey : "",
    baseUrl: typeof input?.baseUrl === "string" && input.baseUrl ? input.baseUrl.replace(/\/$/, "") : DEFAULT_BASE_URL,
    chatModel: typeof input?.chatModel === "string" && input.chatModel ? input.chatModel : DEFAULT_CHAT_MODEL,
    imageModel: typeof input?.imageModel === "string" && input.imageModel ? input.imageModel : DEFAULT_IMAGE_MODEL,
    timeout: typeof input?.timeout === "number" && Number.isFinite(input.timeout) ? Math.max(1, Math.floor(input.timeout)) : 30000,
    maxRetries: typeof input?.maxRetries === "number" && Number.isFinite(input.maxRetries) ? Math.max(0, Math.floor(input.maxRetries)) : 2
  };
}

function createFeatureSchema(input?: FeatureSchemaInput): FeatureSchema {
  const normalized = Array.isArray(input) ? input : undefined;
  const objectInput = !Array.isArray(input) && input ? input : undefined;

  return {
    upload: normalized ? normalized.includes("upload") : objectInput?.upload ?? true,
    workflow: normalized ? normalized.includes("workflow") : objectInput?.workflow ?? true,
    history: normalized ? normalized.includes("history") : objectInput?.history ?? false,
    streaming: normalized ? normalized.includes("streaming") : objectInput?.streaming ?? true,
    plugins: normalized ? normalized.includes("plugins") : objectInput?.plugins ?? false
  };
}

function createThemeSchema(input?: ThemeSchemaInput): ThemeSchema {
  return {
    mode: input?.mode === "light" || input?.mode === "dark" || input?.mode === "auto" ? input.mode : DEFAULT_THEME_MODE,
    tokens: input?.tokens ? { ...DEFAULT_THEME_TOKENS, ...input.tokens } : DEFAULT_THEME_TOKENS
  };
}

function toFeatureList(input?: FeatureSchemaInput): FeatureName[] {
  const normalized = createFeatureSchema(input);

  return featureNames.filter((feature) => normalized[feature]);
}

function validateSchema(kind: SchemaKind, value: WorkspaceSchema | ProviderSchema | FeatureSchema | ThemeSchema): string[] {
  if (kind === "workspace") {
    return validateWorkspaceSchema(value as WorkspaceSchema);
  }

  if (kind === "provider") {
    return validateProviderSchema(value as ProviderSchema);
  }

  if (kind === "feature") {
    return validateFeatureSchema(value as FeatureSchema);
  }

  return validateThemeSchema(value as ThemeSchema);
}

function validateWorkspaceSchema(schema: WorkspaceSchema): string[] {
  const errors: string[] = [];

  if (!workspaceKinds.includes(schema.workspace)) {
    errors.push(`Unsupported workspace "${schema.workspace}".`);
  }

  if (!schema.provider.trim()) {
    errors.push("Provider is required.");
  }

  if (!schema.chatModel.trim()) {
    errors.push("chatModel is required.");
  }

  if (!schema.imageModel.trim()) {
    errors.push("imageModel is required.");
  }

  const invalidFeatures = schema.features.filter((feature) => !featureNames.includes(feature));

  if (invalidFeatures.length > 0) {
    errors.push(`Unsupported features: ${invalidFeatures.join(", ")}.`);
  }

  errors.push(...validateProviderSchema(schema.providerConfig));
  errors.push(...validateThemeSchema(schema.theme));
  return unique(errors);
}

function validateProviderSchema(schema: ProviderSchema): string[] {
  const errors: string[] = [];

  if (!schema.provider.trim()) {
    errors.push("provider is required.");
  }

  if (!schema.baseUrl.trim()) {
    errors.push("baseUrl is required.");
  }

  if (!schema.chatModel.trim()) {
    errors.push("chatModel is required.");
  }

  if (!schema.imageModel.trim()) {
    errors.push("imageModel is required.");
  }

  if (schema.timeout <= 0) {
    errors.push("timeout must be greater than 0.");
  }

  if (schema.maxRetries < 0) {
    errors.push("maxRetries must be 0 or greater.");
  }

  return errors;
}

function validateFeatureSchema(schema: FeatureSchema): string[] {
  return Object.entries(schema)
    .filter(([, value]) => typeof value !== "boolean")
    .map(([key]) => `${key} must be a boolean.`);
}

function validateThemeSchema(schema: ThemeSchema): string[] {
  const errors: string[] = [];

  if (schema.mode !== "light" && schema.mode !== "dark" && schema.mode !== "auto") {
    errors.push(`Unsupported theme mode "${schema.mode}".`);
  }

  return errors;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
