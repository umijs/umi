import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.addEntryCodeAhead(() => {
    return `if(typeof window !== 'undefined') window.__umi_route_prefetch__ = true;`;
  });
};
