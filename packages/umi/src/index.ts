import { IServicePluginAPI, PluginAPI } from '@umijs/core';

export { run } from './cli/cli';
export { RUNTIME_TYPE_FILE_NAME } from './constants';
export { defineConfig } from './defineConfig';
export { defineMock } from './defineMock';
export * from './service/service';
export type IApi = PluginAPI & IServicePluginAPI;
