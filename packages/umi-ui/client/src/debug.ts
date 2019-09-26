import debug from 'debug';

export enum DEBUG {
  UmiUI = 'umiui',
  BaseUI = 'BaseUI',
  UIPlugin = 'UIPlugin',
}

const uiDebug = debug(DEBUG.UmiUI);

export const pluginDebug = uiDebug.extend(DEBUG.UIPlugin);

export default uiDebug.extend(DEBUG.BaseUI);
