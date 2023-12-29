const express = require('express');
const serverHandler = require('./server-handler');

module.exports = function (api) {
  /**
   * 使用umi中间件免去启动额外的服务
   */
  api.addMiddlewares(() => {
    return [express.json(), serverHandler];
  });
};
