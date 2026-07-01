import { ConfigPlugin, withEntitlementsPlist } from '@expo/config-plugins';

type PluginProps = {
  appGroup: string;
};

const plugin: ConfigPlugin<PluginProps> = (config, props) => {
  return withEntitlementsPlist(config, (cfg) => {
    const groups = cfg.modResults['com.apple.security.application-groups'] as string[] | undefined;
    cfg.modResults['com.apple.security.application-groups'] = Array.from(
      new Set([...(groups ?? []), props.appGroup])
    );
    // Family Controls entitlement for Screen Time APIs
    // Value is boolean in entitlements
    (cfg.modResults as any)['com.apple.developer.family-controls'] = true;
    return cfg;
  });
};

export default plugin;


