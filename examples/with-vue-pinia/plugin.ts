import type { IApi } from 'umi';

export default function (api: IApi) {
  api.registerPlugins([
    {
      id: `custom: config-viteLegacy`,
      key: 'viteLegacy',
      config: {
        schema({ zod }) {
          return zod.object({});
        },
      },
    },
  ]);
}
