import type { ComposerTheme, ThemeTokenName } from "@company/ai-composer-shared";

export const workspaceKinds = ["chat", "image", "agent"] as const;
export type WorkspaceKind = (typeof workspaceKinds)[number];

export const featureNames = ["upload", "workflow", "history", "streaming", "plugins"] as const;
export type FeatureName = (typeof featureNames)[number];

export interface ThemeSchema {
  mode: ComposerTheme;
  tokens: Partial<Record<ThemeTokenName, string>>;
}

export interface FeatureSchema {
  upload: boolean;
  workflow: boolean;
  history: boolean;
  streaming: boolean;
  plugins: boolean;
}

export interface ProviderSchema {
  provider: string;
  apiKey: string;
  baseUrl: string;
  chatModel: string;
  imageModel: string;
  timeout: number;
  maxRetries: number;
}

export interface WorkspaceSchema {
  workspace: WorkspaceKind;
  provider: string;
  chatModel: string;
  imageModel: string;
  features: FeatureName[];
  theme: ThemeSchema;
  providerConfig: ProviderSchema;
}

export interface WorkspaceSchemaInput {
  workspace?: WorkspaceKind;
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  chatModel?: string;
  imageModel?: string;
  timeout?: number;
  maxRetries?: number;
  features?: FeatureName[] | Partial<FeatureSchema>;
  theme?: Partial<ThemeSchema>;
}

export type ProviderSchemaInput = Partial<ProviderSchema>;
export type FeatureSchemaInput = FeatureName[] | Partial<FeatureSchema> | undefined;
export type ThemeSchemaInput = Partial<ThemeSchema> | undefined;

export interface SchemaValidationResult<TSchema> {
  valid: boolean;
  errors: string[];
  value?: TSchema;
}
