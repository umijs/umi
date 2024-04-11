import type { IApi } from '../../types';

export default (api: IApi) => {
  api.addEntryCode(() => [
    `
typeof window !== 'undefined' ? window.g_umi = {
  version: '${api.appData.umi.version}',
} : '';
  `,
  ]);
};
