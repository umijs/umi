import joi from '@umijs/utils/compiled/@hapi/joi';
// @ts-ignore
import joi2Types from '../../../compiled/joi2types';
import { IApi } from '../../types';

// Need to be excluded function type declared in `IConfig`
// function type will intersect invalid : (() => any) & (IConfig['key']) -> never
// issue: https://github.com/umijs/umi/issues/9657
const FILTER_KEYS = ['chainWebpack'];

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    const { service } = api;

    const properties = Object.keys(service.configSchemas).reduce((acc, key) => {
      if (FILTER_KEYS.includes(key)) {
        return acc;
      }

      const schemaFn = service.configSchemas[key];
      if (typeof schemaFn !== 'function') {
        return acc;
      }

      const schema = schemaFn(joi);
      if (!joi.isSchema(schema)) {
        return acc;
      }

      return {
        ...acc,
        [key]: schemaFn(joi),
      };
    }, {});

    const interfaceName = 'IConfigFromPlugins';

    const content = await joi2Types(joi.object(properties), {
      interfaceName,
      bannerComment: '// Created by Umi Plugin',
    }).catch((err: Error) => {
      api.logger.error('Config types generated error', err);
      return Promise.resolve(`export interface ${interfaceName} {}`);
    });

    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/pluginConfig.d.ts',
      content,
    });
  });
};
