export default (api: any) => {
  api.describe({
    key: 'p2',
    enableBy: api.EnableBy.config,
  });
  api.modifyConfig((config: any) => {
    config.p1 = {};
    return config;
  });
};
