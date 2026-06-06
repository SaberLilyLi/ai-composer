import type { ComposerPlugin } from "./types";
import type { ComposerCore } from "./ComposerCore";

export class PluginManager {
  private readonly plugins = new Map<string, ComposerPlugin>();

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
}
