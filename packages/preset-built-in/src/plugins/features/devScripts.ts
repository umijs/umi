import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'devScripts',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy() {
      return api.env === 'development';
    },
  });

  api.addBeforeMiddlewares(async () => {
    const scripts = await api.applyPlugins({
      key: 'addDevScripts',
      type: api.ApplyPluginsType.add,
      initialValue: [],
    });
    return (req, res, next) => {
      if (req.path.includes('@@/devScripts.js')) {
        res.end(scripts.join('\n'));
      } else {
        next();
      }
    };
  });

  api.addHTMLHeadScripts(async () => {
    const scripts = await api.applyPlugins({
      key: 'addDevScripts',
      type: api.ApplyPluginsType.add,
      initialValue: [],
    });
    return scripts.length
      ? [
          {
            src: `${api.config.publicPath}@@/devScripts.js`,
          },
        ]
      : [];
  });
};
