import { IApi } from '../../types';

export default (api: IApi) => {
  const configDefaults: Record<string, any> = {
    alias: {
      umi: process.env.UMI_DIR,
      '@umijs/renderer-react': require.resolve('@umijs/renderer-react'),
    },
  };

  for (const key of Object.keys(configDefaults)) {
    api.registerPlugins([
      {
        id: `virtual: config-${key}`,
        key: key,
        config: {
          default: configDefaults[key],
          schema: (joi) => joi.any(),
        },
      },
    ]);
  }
};
