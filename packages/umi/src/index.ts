import { IServicePluginAPI, PluginAPI } from '@umijs/core';
import * as utils from '@umijs/utils';

export type IApi = PluginAPI & IServicePluginAPI;
export * from './service/service';
export { utils };
