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

export enum IApplyPluginsType {
  add = 'add',
  modify = 'modify',
  addAsync = 'addAsync',
  modifyAsync = 'modifyAsync',
  event = 'event',
  eventAsync = 'eventAsync',
}
