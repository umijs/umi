// @ts-nocheck
/* eslint-disable */
import { FrameworkConfiguration, FrameworkLifeCycles } from 'qiankun';
import type { MicroAppRouteMode } from './constants';

type BaseIConfig = any;

export type HistoryType = 'browser' | 'hash';
export type App = {
  name: string;
  entry: string | { scripts: string[]; styles: string[] };
  base?: string | string[];
  history?: HistoryType;
  // 取 entry 时是否需要开启跨域 credentials
  credentials?: boolean;
  props?: any;
} & Partial<Pick<BaseIConfig, 'mountElementId'>>;

export type MicroAppRoute = {
  path: string;
  microApp: string;
  /**
   * prepend 既作为匹配规则，也作为子应用 router.basename
   * match 仅作为匹配规则
   */
  mode: MicroAppRouteMode;
} & Record<string, any>;

export type MasterOptions = {
  enable?: boolean;
  apps?: App[];
  routes?: MicroAppRoute[];
  lifeCycles?: FrameworkLifeCycles<object>;
  masterHistoryType?: HistoryType;
  base?: string;
  // 关联路由标记的别名，默认 microApp
  routeBindingAlias?: string;
  // 导出的组件别名，默认 MicroApp
  exportComponentAlias?: string;
  // MicroApp 寻址时使用的应用名唯一键，默认是 name
  appNameKeyAlias?: string;
  // 预加载应用阈值
  prefetchThreshold?: number;
} & FrameworkConfiguration;

export type SlaveOptions = {
  enable?: boolean;
  devSourceMap?: boolean;
  keepOriginalRoutes?: boolean | string;
  shouldNotModifyRuntimePublicPath?: boolean;
  shouldNotModifyDefaultBase?: boolean;
  // library name 是否增加 -[name] 应对多 chunk 场景
  shouldNotAddLibraryChunkName?: boolean;
};
