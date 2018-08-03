import assert from 'assert';

export default function(api) {
  const { config } = api.service;

  api._registerConfig(() => {
    return api => {
      return {
        name: 'base',
        validate(val) {
          assert(
            typeof val === 'string',
            `base should be String, but got ${val}`,
          );
        },
        onChange() {
          api.service.restart(/* why */ 'Config base Changed');
        },
      };
    };
  });

  api.chainWebpackConfig(webpackConfig => {
    if (config.base) {
      webpackConfig.resolve.alias.set(
        'process.env.BASE_URL',
        process.env.BASE_URL,
      );
    }
  });
}
