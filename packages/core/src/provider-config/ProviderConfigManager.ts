export interface ProviderConfig {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  options?: Record<string, unknown>;
}

export class ProviderConfigManager {
  private configs = new Map<string, ProviderConfig>();

  registerConfig(config: ProviderConfig): void {
    this.configs.set(config.provider, { ...config });
  }

  getConfig(provider: string): ProviderConfig | undefined {
    const config = this.configs.get(provider);
    return config ? { ...config, options: config.options ? { ...config.options } : undefined } : undefined;
  }

  setConfig(provider: string, config: Partial<Omit<ProviderConfig, "provider">>): void {
    const current = this.configs.get(provider) ?? { provider };
    this.configs.set(provider, {
      ...current,
      ...config,
      provider,
      options: config.options ? { ...config.options } : current.options
    });
  }

  removeConfig(provider: string): boolean {
    return this.configs.delete(provider);
  }
}
