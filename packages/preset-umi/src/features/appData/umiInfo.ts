import type { IApi } from '../../types';

export default (api: IApi) => {
  api.addEntryCode(() => [
    `
    if (typeof window !== 'undefined') {
      window.g_umi = {
        version: '${api.appData.umi.version}',
      };
    }
    export const g_umi = ${api.appData.umi.version};
    `,
  ]);
};
