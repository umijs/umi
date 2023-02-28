import type { IApi } from '../../types';

/**
 * plugin for disable built-in react-helmet-async
 */
export default (api: IApi) => {
  api.describe({
    config: {
      schema: (Joi) => Joi.boolean(),
    },
  });

  api.modifyDefaultConfig((memo) => {
    // delete alias for resolve real react-helmet-async
    // because features/configPlugins alias it to an empty module
    // and helmet will unavailable expectedly when this plugin is disabled
    delete memo.alias['react-helmet-async'];

    return memo;
  });
};
