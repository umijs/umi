'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.all('/restapi/*', controller.home.api);
  router.get('*', controller.home.index);
};
