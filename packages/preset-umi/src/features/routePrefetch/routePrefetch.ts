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
    return `window.__umi_route_prefetch__ = true;`;
  });
};
