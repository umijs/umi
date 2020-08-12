'use strict';
const path = require('path');

module.exports = (appInfo, appConfig = {}) => {
  const assetsDir =
    (appConfig.assets && appConfig.assets.assetsDir) || 'app/web';
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1513765449219_5858';

  // add your config here
  config.middleware = [];

  config.assets = {
    publicPath: '/public',
    devServer: {
      command: 'umi dev',
      env: {
        APP_ROOT: path.join(appInfo.baseDir, assetsDir),
        PORT: '{port}',
        BROWSER: 'none',
        ESLINT: 'none',
        SOCKET_SERVER: 'http://127.0.0.1:{port}',
        PUBLIC_PATH: 'http://127.0.0.1:{port}',
      },
    },
  };

  config.view = {
    mapping: {
      '.html': 'nunjucks',
    },
    defaultViewEngine: 'nunjucks',
  };

  config.proxy = true;

  config.security = {
    csrf: false,
    xframe: {
      enable: false,
    },
  };

  return config;
};
