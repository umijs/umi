import { IServicePluginAPI, PluginAPI } from '@umijs/core';

export { defineConfig } from './defineConfig';
export * from './service/service';
export type IApi = PluginAPI & IServicePluginAPI;
