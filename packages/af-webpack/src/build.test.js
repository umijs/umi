import { join } from 'path';
import { existsSync } from 'fs';
import build from './build';
import getWebpackConfig from './getWebpackConfig';

const fixtures = join(__dirname, 'fixtures');

xtest('normal', async () => {
  process.env.UMI_TEST = true;
  const cwd = join(fixtures, 'normal');
  return new Promise((resolve, reject) => {
    build({
      webpackConfig: getWebpackConfig({
        cwd,
        entry: {
          bundle: join(cwd, 'a.js'),
        },
      }),
      cwd,
      onSuccess() {
        expect(existsSync(join(cwd, 'dist', 'bundle.js'))).toEqual(true);
        resolve();
      },
      onFail(e) {
        reject(e);
      },
    });
  });
});
