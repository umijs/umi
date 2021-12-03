import { IServicePluginAPI, PluginAPI } from '@umijs/core';

export type IApi = PluginAPI & IServicePluginAPI;
export * from './service/service';
