import { IApi } from 'umi';
import { joi2JsonSchema, jsonSchema2Types } from 'joi2types';
import joi from '@hapi/joi';

export default (api: IApi) => {
  const { lodash } = api.utils;
  api.onGenerateFiles(async () => {
    const { service } = api;
    const properties = Object.keys(service.plugins).map(plugin => {
      const { config, key } = service.plugins[plugin];
       // recognize as key if have schema config
      if (!config?.schema) return;
      const schema = config.schema(joi);
      // @ts-ignore
      if (lodash.isEmpty(schema)) {
        return;
      }
      return {
        [key]: joi2JsonSchema(schema, { additionalProperties: false }),
      }
    })
      .filter(config => config)
      .reduce((acc, curr) => ({
        ...acc,
        ...curr,
      }), {});
    const jsonSchema = {
      title: 'IConfigFromPlugins',
      properties,
      additionalProperties: false,
    }
    const content = await jsonSchema2Types(jsonSchema as object, 'IConfigFromPlugins', {
      bannerComment: '/** Created by Umi Plugin **/',
    });
    console.log('write tmp');
    api.writeTmpFile({
      path: 'core/pluginConfig.ts',
      content,
    })
  })
};
