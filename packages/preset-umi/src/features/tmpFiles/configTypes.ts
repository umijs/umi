import joi from '@umijs/core/compiled/@hapi/joi';
// @ts-ignore
import joi2Types from '../../../compiled/joi2types';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    const { service } = api;

    const properties = Object.keys(service.configSchemas)
      .map((key) => {
        const schemaFn = service.configSchemas[key];
        if (typeof schemaFn !== 'function') return;

        const schema = schemaFn(joi);

        if (!joi.isSchema(schema)) {
          return;
        }

        return {
          [key]: schema,
        };
      })
      .reduce(
        (acc, curr) => ({
          ...acc,
          ...curr,
        }),
        {},
      );

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
