export enum PluginType {
  preset = 'preset',
  plugin = 'plugin',
}

export enum ServiceStage {
  uninitiialized,
  constructor,
  initPresets,
  initPlugins,
  initHooks,
  validateUserConfig,
  run,
}
