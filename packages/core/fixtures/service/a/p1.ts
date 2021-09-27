export default (api: any) => {
  api.describe({
    key: 'p1',
    enableBy: api.EnableBy.config,
  });
  api.modifyDefaultConfig((config: any) => {
    return config;
  });
  api.modifyConfig((config: any) => {
    return config;
  });
};
