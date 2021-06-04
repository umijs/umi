import { Service } from '@umijs/core';
import { IApi } from '@umijs/types';
import { promises } from 'fs';
import { join } from 'path';
import { onBuildComplete } from './ssr';

const fixtures = join(__dirname, 'fixtures');

test('onBuildComplete normal', async () => {
  const writeFileSpy = jest
    .spyOn(promises, 'writeFile')
    // @ts-ignore
    .mockImplementation(async (_, content) => {
      return content;
    });
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

  const buildComplete = onBuildComplete(api as IApi);
  await buildComplete({
    err: null,
    stats,
  });
  const serverContent = await writeFileSpy.mock.results[0].value;
  expect(writeFileSpy).toHaveBeenCalled();
  expect(serverContent).toContain('\\u002Fumi.6f4c357e.css');
  expect(serverContent).toContain('\\u002Fumi.e1837763.js');

  writeFileSpy.mockClear();
});
