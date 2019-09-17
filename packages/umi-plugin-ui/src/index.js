export default api => {
  require('./plugins/dashboard/index').default(api);
  require('./plugins/configuration/index').default(api);
  require('./plugins/tasks/index').default(api);
  require('./plugins/blocks/index').default(api);
};
