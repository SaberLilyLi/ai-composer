import type { ComposerPlugin } from "./types";
import type { ComposerCore } from "./ComposerCore";
import type { ConversationRuntime } from "./ConversationRuntime";
import type { ProviderRegistry } from "./ProviderRegistry";
import type { WorkflowRuntime } from "./WorkflowRuntime";
import type { WorkspaceSchema } from "./schema";

export interface PluginManifest {
  name: string;
  version: string;
  capabilities: string[];
  description?: string;
  permissions?: PluginPermission[];
}

export interface PluginPermission {
  capability: string;
  scope?: string;
  resource?: string;
}

export interface AiStudioPluginContext {
  schema: WorkspaceSchema;
  conversationRuntime: ConversationRuntime;
  workflowRuntime: WorkflowRuntime;
  providerRegistry: ProviderRegistry;
}

export interface AiStudioPlugin {
  manifest: PluginManifest;
  install?(context: AiStudioPluginContext): void | Promise<void>;
  activate?(context: AiStudioPluginContext): void | Promise<void>;
  deactivate?(context: AiStudioPluginContext): void | Promise<void>;
  uninstall?(context: AiStudioPluginContext): void | Promise<void>;
}

export interface PluginRecord {
  manifest: PluginManifest;
  enabled: boolean;
  installed: boolean;
  lastError?: string;
}

export interface PluginSandboxResult {
  ok: boolean;
  error?: Error;
}

export class PluginSandbox {
  async run(
    pluginName: string,
    phase: "install" | "activate" | "deactivate" | "uninstall",
    action: () => void | Promise<void>
  ): Promise<PluginSandboxResult> {
    try {
      await action();
      return { ok: true };
    } catch (error) {
      const runtimeError = error instanceof Error ? error : new Error(`${pluginName} failed during ${phase}.`);
      return {
        ok: false,
        error: runtimeError
      };
    }
  }
}

export class PluginManager {
  private readonly plugins = new Map<string, ComposerPlugin>();
  private readonly studioPlugins = new Map<string, AiStudioPlugin>();
  private readonly pluginState = new Map<string, PluginRecord>();
  private context: AiStudioPluginContext | null = null;
  private readonly sandbox = new PluginSandbox();

  install(plugin: ComposerPlugin, composer: ComposerCore): void {
    if (this.plugins.has(plugin.name)) {
      return;
    }

    plugin.install(composer);
    this.plugins.set(plugin.name, plugin);
  }

  list(): ComposerPlugin[] {
    return Array.from(this.plugins.values());
  }

  setContext(context: AiStudioPluginContext): void {
    this.context = context;
  }

  async registerPlugin(plugin: AiStudioPlugin): Promise<void> {
    const name = plugin.manifest.name;

    if (this.studioPlugins.has(name)) {
      return;
    }

    ensurePluginCapabilities(plugin.manifest);
    ensurePluginPermissions(plugin.manifest);

    this.studioPlugins.set(name, plugin);
    this.pluginState.set(name, {
      manifest: plugin.manifest,
      enabled: false,
      installed: false
    });

    if (this.context) {
      const result = await this.sandbox.run(name, "install", () => plugin.install?.(this.context!));
      this.pluginState.set(name, {
        manifest: plugin.manifest,
        enabled: false,
        installed: result.ok,
        lastError: result.error?.message
      });
    }
  }

  async removePlugin(name: string): Promise<boolean> {
    const plugin = this.studioPlugins.get(name);
    const state = this.pluginState.get(name);

    if (!plugin || !state) {
      return false;
    }

    if (state.enabled && this.context) {
      const deactivateResult = await this.sandbox.run(name, "deactivate", () => plugin.deactivate?.(this.context!));
      state.lastError = deactivateResult.error?.message;
    }

    if (state.installed && this.context) {
      const uninstallResult = await this.sandbox.run(name, "uninstall", () => plugin.uninstall?.(this.context!));
      state.lastError = uninstallResult.error?.message ?? state.lastError;
    }

    this.studioPlugins.delete(name);
    this.pluginState.delete(name);
    return true;
  }

  async enablePlugin(name: string): Promise<boolean> {
    const plugin = this.studioPlugins.get(name);
    const state = this.pluginState.get(name);

    if (!plugin || !state || !this.context) {
      return false;
    }

    if (!state.installed) {
      const installResult = await this.sandbox.run(name, "install", () => plugin.install?.(this.context!));
      state.installed = installResult.ok;
      state.lastError = installResult.error?.message;
    }

    if (!hasRequiredPermissions(plugin.manifest)) {
      state.lastError = `Plugin "${name}" does not declare permissions for all capabilities.`;
      this.pluginState.set(name, state);
      return false;
    }

    if (!state.enabled) {
      const activateResult = await this.sandbox.run(name, "activate", () => plugin.activate?.(this.context!));
      state.enabled = activateResult.ok;
      state.lastError = activateResult.error?.message;
    }

    this.pluginState.set(name, state);
    return state.enabled;
  }

  async disablePlugin(name: string): Promise<boolean> {
    const plugin = this.studioPlugins.get(name);
    const state = this.pluginState.get(name);

    if (!plugin || !state || !this.context || !state.enabled) {
      return false;
    }

    const result = await this.sandbox.run(name, "deactivate", () => plugin.deactivate?.(this.context!));
    state.enabled = false;
    state.lastError = result.error?.message;
    this.pluginState.set(name, state);
    return true;
  }

  listPlugins(): PluginRecord[] {
    return Array.from(this.pluginState.values());
  }
}

function ensurePluginCapabilities(manifest: PluginManifest): void {
  if (manifest.capabilities.length === 0) {
    throw new Error(`Plugin "${manifest.name}" must declare at least one capability.`);
  }
}

function ensurePluginPermissions(manifest: PluginManifest): void {
  if (!manifest.permissions) {
    return;
  }

  for (const permission of manifest.permissions) {
    if (!manifest.capabilities.includes(permission.capability)) {
      throw new Error(`Plugin "${manifest.name}" permission "${permission.capability}" is not declared in capabilities.`);
    }
  }
}

function hasRequiredPermissions(manifest: PluginManifest): boolean {
  return manifest.capabilities.every((capability) =>
    manifest.permissions?.some((permission) => permission.capability === capability)
  );
}
