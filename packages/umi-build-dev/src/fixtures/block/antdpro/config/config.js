import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';

const testTargets = {
  ie: 11,
};

export default {
  routes: pageRoutes,
  targets: {
    // a temporary fix for https://github.com/jquery/esprima/issues/1927
    // will remove comment after esprima new version release
    // ...testTargets,
  },
  chainWebpack: webpackPlugin,
};
