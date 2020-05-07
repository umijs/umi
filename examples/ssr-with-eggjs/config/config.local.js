'use strict';

module.exports = (appInfo) => {
  const config = (exports = {});
  config.logger = {
    level: 'NONE',
    consoleLevel: 'DEBUG',
  };
  return config;
};
