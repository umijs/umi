import { IApi } from '@umijs/types';
import { readFileSync } from 'fs';

export default (api: IApi) => {
  api.describe({
    key: 'bundledDevTool',
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.addBeforeMiddewares(() => {
    return (req, res, next) => {
      if (req.path === '/@@umi/devScript.js') {
        res.end(
          readFileSync(
            require.resolve('@umijs/bundler-webpack/dist/webpackHotDevClient'),
            'utf-8',
          ),
        );
      } else {
        next();
      }
    };
  });

  api.addHTMLHeadScripts(() => ['/@@/umi/devScript.js']);
};
