// @ts-nocheck
/* eslint-disable */

export const defaultMasterRootId = 'root-master';
export const defaultHistoryType = 'browser';
export const qiankunStateForSlaveModelNamespace = '@@qiankunStateForSlave';
export const qiankunStateFromMasterModelNamespace = '@@qiankunStateFromMaster';
export enum MicroAppRouteMode {
  /**
   * 既作为匹配规则，也作为子应用 router.basename
   */
  PREPEND = 'prepend',
  /**
   * 仅作为匹配规则
   */
  MATCH = 'match',
}

export const defaultMicroAppRouteMode = MicroAppRouteMode.PREPEND;
