import { isZodSchema } from '@umijs/utils';
import joi from '@umijs/utils/compiled/@hapi/joi';
import { z, ZodSchema } from '@umijs/utils/compiled/zod';
import { zodToTs } from '@umijs/zod2ts';
import { IApi } from '../../types';

// Need to be excluded function type declared in `IConfig`
// function type will intersect invalid : (() => any) & (IConfig['key']) -> never
// issue: https://github.com/umijs/umi/issues/9657
const FILTER_KEYS = ['chainWebpack'];

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    const { service } = api;

    let properties: Record<string, joi.Schema> = {};
    let zodProperties: Record<string, ZodSchema> = {};
    Object.keys(service.configSchemas).forEach((key) => {
      if (FILTER_KEYS.includes(key)) {
        return;
      }

      const schemaFn = service.configSchemas[key];
      if (typeof schemaFn !== 'function') {
        return;
      }

      const schema = schemaFn({ ...joi, zod: z });
      if (joi.isSchema(schema)) {
        properties[key] = schema;
      } else if (isZodSchema(schema)) {
        zodProperties[key] = schema;
      }
    });

    const interfaceName = 'IConfigFromPluginsJoi';

    const joi2Types = require('../../../compiled/joi2types').default;
    const content = await joi2Types(joi.object(properties), {
      interfaceName,
      bannerComment: '// Created by Umi Plugin',
      unknownAny: true,
    }).catch((err: Error) => {
      api.logger.error('Config types generated error', err);
      return Promise.resolve(`export interface ${interfaceName} {}`);
    });

    api.writeTmpFile({
      noPluginDir: true,
      path: `core/pluginConfigJoi.d.ts`,
      content,
    });

    const typeName = `IConfigTypes`;
    const typeString = zodToTs({
      zod: z.object(zodProperties),
      identifier: typeName,
    }).replace(
      // replace to support routes circular reference type
      `routes?: (any | undefined)`,
      `routes?: ${typeName}['routes']`,
    );

    const typeContent: string = `
import { ${interfaceName} } from "./pluginConfigJoi.d";

interface ${typeName} ${typeString};

type PrettifyWithCloseable<T> = {
  [K in keyof T]: T[K] | false;
} & {};

export type IConfigFromPlugins = PrettifyWithCloseable<
  ${interfaceName} & Partial<${typeName}>
>;
    `;
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/pluginConfig.ts',
      content: typeContent,
    });
  });
};
