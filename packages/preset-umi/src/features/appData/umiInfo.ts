import type { IApi } from '../../types';

export default (api: IApi) => {
  api.addEntryCode(() => [
    `
window.g_umi = {
  version: '${api.appData.umi.version}',
};
  `,
  ]);
};
