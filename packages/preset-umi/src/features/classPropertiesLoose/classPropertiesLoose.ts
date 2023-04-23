import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'classPropertiesLoose',
    config: {
      schema({ zod }) {
        return zod
          .union([zod.boolean(), zod.object({})])
          .describe(
            '设置 babel class-properties 启用 loose \n @doc https://umijs.org/docs/api/config#classpropertiesloose',
          );
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyBabelPresetOpts((memo) => {
    memo.classPropertiesLoose = {};
    return memo;
  });
};
