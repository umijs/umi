import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'classPropertiesLoose',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyBabelPresetOpts((memo) => {
    memo.classPropertiesLoose = {};
    return memo;
  });
};
