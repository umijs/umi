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

export enum IApplyPluginsType {
  add = 'add',
  modify = 'modify',
  addAsync = 'addAsync',
  modifyAsync = 'modifyAsync',
  event = 'event',
  eventAsync = 'eventAsync',
}
