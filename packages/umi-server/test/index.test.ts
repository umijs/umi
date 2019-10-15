import { join } from 'path';
import { fork } from 'child_process';
import { winEOL } from 'umi-utils';
import server from '..';

async function build({ cwd }) {
  return new Promise((resolve, reject) => {
    const umiPath = join(__dirname, '..', 'node_modules', '.bin', 'umi');
    const env = {
      COMPRESS: 'none',
      PROGRESS: 'none',
      COVERAGE: 1,
    };
    const child = fork(umiPath, ['build'], {
      cwd,
      env,
    });
    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('Build failed'));
      } else {
        resolve();
      }
    });
  });
}

const fixtures = join(__dirname, 'fixtures');

describe('build', () => {
  beforeAll(() => {
    require('test-build-result')({
      root: fixtures,
      build({ cwd, dir }) {
        return new Promise((resolve, reject) => {
          build({ cwd });
        });
      },
      replaceContent(content) {
        return winEOL(content.replace(/\/\/ EXTERNAL MODULE[^\n]+/g, '// $EXTERNAL_MODULE$'));
      },
    });
  });
  afterAll(done => {
    done();
  });
  it('ssr', async () => {
    const render = server({
      root: join(fixtures, 'ssr', 'dist'),
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });
});
