'use strict';

module.exports = (appInfo) => {
  const config = (exports = {});
  config.logger = {
    level: 'NONE',
    consoleLevel: 'DEBUG',
  };
  config.assets = {
    devServer: {
      debug: true,
      autoPort: true,
    },
    dynamicLocalIP: false,
  };
  return config;
};
