import { IApi } from '@umijs/types';
import joi2Types from 'joi2types';
import joi from '@hapi/joi';

export default (api: IApi) => {
  api.onGenerateFiles(async () => {
    const { service } = api;
    const properties = Object.keys(service.plugins)
      .map((plugin) => {
        const { config, key } = service.plugins[plugin];
        // recognize as key if have schema config
        if (!config?.schema) return;
        const schema = config.schema(joi);
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
    const content = await joi2Types(joi.object(properties).unknown(), {
      interfaceName: 'IConfigFromPlugins',
      bannerComment: '/** Created by Umi Plugin **/',
    });
    api.writeTmpFile({
      path: 'core/pluginConfig.d.ts',
      content,
    });
  });
};
