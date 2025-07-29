import path from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'stagewise',
    config: {
      schema(zod) {
        return zod.any();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(() => {
    const stagewiseToolbarPath = path.join(
      path.dirname(require.resolve('@stagewise/toolbar')),
      '..',
    );

    api.writeTmpFile({
      path: 'stagewise.ts',
      content: `
import { initToolbar } from '${stagewiseToolbarPath}';
const stagewiseConfig = ${JSON.stringify(api.config.stagewise, null, 2)};
function setupStagewise() {
  // Only initialize once and only in development mode
  if (process.env.NODE_ENV === 'development') {
    initToolbar(stagewiseConfig);
  }
}
setupStagewise();
      `,
    });
  });

  api.addEntryImports(() => {
    if (api.name !== 'dev' && api.name !== 'setup') {
      return [];
    }
    return [{ source: '@@/plugin-stagewise/stagewise.ts' }];
  });
};
