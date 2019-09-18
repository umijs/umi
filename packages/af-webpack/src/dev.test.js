import { join } from 'path';
import got from 'got';
import dev from './dev';
import getWebpackConfig from './getWebpackConfig';

const fixtures = join(__dirname, 'fixtures');

xtest('normal', async () => {
  process.env.UMI_TEST = true;
  process.env.BROWSER = 'none';
  const cwd = join(fixtures, 'normal');
  return new Promise((resolve, reject) => {
    dev({
      webpackConfig: getWebpackConfig({
        cwd,
        entry: {
          bundle: join(cwd, 'a.js'),
        },
      }),
      cwd,
      onCompileDone({ port, isFirstCompile }) {
        if (isFirstCompile) {
          got(`http://localhost:${port}/bundle.js`).then(res => {
            expect(res.statusCode).toEqual(200);
            resolve();
          });
        }
      },
      onFail(e) {
        reject(e);
      },
    });
  });
});
