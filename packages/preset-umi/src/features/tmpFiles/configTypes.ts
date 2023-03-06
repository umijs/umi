import joi from '@umijs/utils/compiled/@hapi/joi';
import { z } from '@umijs/utils/compiled/zod';
// @ts-ignore
import joi2Types from '../../../compiled/joi2types';
import { IApi } from '../../types';
import { zod2string } from './zod2string';

// Need to be excluded function type declared in `IConfig`
// function type will intersect invalid : (() => any) & (IConfig['key']) -> never
// issue: https://github.com/umijs/umi/issues/9657
const FILTER_KEYS = ['chainWebpack'];

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    const { service } = api;

    let properties: any = {};
    let zodProperties: any = {};
    let hasZodSchemas = false;
    Object.keys(service.configSchemas).forEach((key) => {
      if (FILTER_KEYS.includes(key)) {
        return;
      }

      const schemaFn = service.configSchemas[key];
      if (typeof schemaFn !== 'function') {
        return;
      }

      const schema = schemaFn(joi, z);
      if (joi.isSchema(schema)) {
        properties[key] = schema;
      } else if ('safeParse' in schema) {
        zodProperties[key] = schema;
        hasZodSchemas = true;
      }
    });

    const interfaceName = hasZodSchemas
      ? 'IConfigFromPluginsJoi'
      : 'IConfigFromPlugins';

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
      path: `core/${hasZodSchemas ? 'joiPluginConfig' : 'pluginConfig'}.d.ts`,
      content,
    });
    if (!hasZodSchemas) return;

    const typeContent: string = `
import { z } from "@umijs/utils/compiled/zod";
import { IConfigFromPluginsJoi } from "./joiPluginConfig";

const IConfig = ${zod2string(z.object(zodProperties))};

type IConfigTypes = z.infer<typeof IConfig>;

export type IConfigFromPlugins = IConfigFromPluginsJoi & IConfigTypes;
    `;
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/pluginConfig.ts',
      content: typeContent,
    });
  });
};
