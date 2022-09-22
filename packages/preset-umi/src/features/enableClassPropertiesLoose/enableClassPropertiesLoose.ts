import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'enableClassPropertiesLoose',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyBabelPresetOpts((memo) => {
    memo.enableClassPropertiesLoose = {};
    return memo;
  });
};
