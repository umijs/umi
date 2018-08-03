import assert from 'assert';

export default function(api) {
  const { config } = api.service;

  api.register('_modifyConfigPlugins', ({ memo }) => {
    memo.push(api => {
      return {
        name: 'base',
        validate(val) {
          assert(
            typeof val === 'string',
            `base should be String, but got ${val}`,
          );
        },
        onChange() {
          api.service.dev.restart(/* why */ 'Config base Changed');
        },
      };
    });
    return memo;
  });

  if (config.base) {
    api.chainWebpackConfig(webpackConfig => {
      webpackConfig.resolve.alias.set(
        'process.env.BASE_URL',
        process.env.BASE_URL,
      );
    });
  }
}
