import { dirname } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  const configDefaults: Record<string, any> = {
    alias: {
      umi: process.env.UMI_DIR,
      '@umijs/renderer-react': dirname(
        require.resolve('@umijs/renderer-react/package'),
      ),
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
