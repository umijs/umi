import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    config: {
      schema({ zod }) {
        return zod.object({
          defaultPrefetch: zod
            .enum(['none', 'intent', 'render', 'viewport'])
            .optional(),
          defaultPrefetchTimeout: zod.number().optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.addEntryCodeAhead(() => {
    return `if(typeof window !== 'undefined') window.__umi_route_prefetch__ =
      {
        defaultPrefetch: ${JSON.stringify(
          api.config.routePrefetch.defaultPrefetch || 'none',
        )},
        defaultPrefetchTimeout: ${JSON.stringify(
          api.config.routePrefetch.defaultPrefetchTimeout || 50,
        )},
      };
    `;
  });
};
