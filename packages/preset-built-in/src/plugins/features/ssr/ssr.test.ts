import { join } from 'path';
import { Service } from '@umijs/core';
import { onBuildComplete } from './ssr';

const fixtures = join(__dirname, 'fixtures');

test('onBuildComplete normal', async () => {
  const cwd = join(fixtures, 'normal');

  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index')],
  });
  await service.init();
  const api = service.getPluginAPI({
    service,
    id: 'test',
    key: 'test',
  });
  const stats = {
    stats: [
      {
        compilation: {
          chunks: [
            {
              name: 'umi',
              files: ['umi.6f4c357e.css', 'umi.e1837763.js'],
            },
          ],
        },
      },
    ],
  };

  const buildComplete = onBuildComplete(api, true);
  const serverContent = await buildComplete({
    err: null,
    stats,
  });
  expect(serverContent).toContain('/umi.6f4c357e.css');
  expect(serverContent).toContain('/umi.e1837763.js');
});
