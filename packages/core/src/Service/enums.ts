export enum PluginType {
  preset = 'preset',
  plugin = 'plugin',
}

export enum ServiceStage {
  uninitiialized,
  constructor,
  init,
  initPresets,
  initPlugins,
  initHooks,
  pluginReady,
  getConfig,
  getPaths,
  run,
}

export enum ConfigChangeType {
  reload = 'reload',
  regenerateTmpFiles = 'regenerateTmpFiles',
}

export enum ApplyPluginsType {
  add = 'add',
  modify = 'modify',
  event = 'event',
}

export enum EnableBy {
  register = 'register',
  config = 'config',
}
