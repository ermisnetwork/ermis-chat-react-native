type ErmisConfig = {
  resizableCDNHosts: string[];
};
const DEFAULT_GLOBAL_ERMIS_CONFIG = {
  resizableCDNHosts: ['.ermis.network'],
};

/**
 * ErmisChatRN - Global config for the RN Chat SDK
 * This config is used to enable/disable features and options for the SDK.
 *
 * @deprecated Use the `resizableCDNHosts` prop in the `Chat` component, instead. ErmisChatRN will not be exposed starting the next major release.
 */
export class ErmisChatRN {
  /**
   * Global config for ErmisChatRN.
   */
  static config: ErmisConfig = DEFAULT_GLOBAL_ERMIS_CONFIG;
  /**
   * Set global config for ErmisChatRN allows you to set wished CDN hosts for resizing images.
   * This function accepts an config object that will be merged with the default config.
   * @example ErmisChatRN.setConfig({ resizableCDNHosts: ['my-custom-cdn.com', 'my-other-cdn.com'] });
   */
  static setConfig(config: Partial<ErmisConfig>) {
    this.config = { ...this.config, ...config };
  }
}
