import { join } from 'path';
import { readdirSync } from 'fs';
import { fork } from 'child_process';
import { winPath } from 'umi-utils';
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

const fixtures = join(winPath(__dirname), 'fixtures');

describe('build', () => {
  beforeAll(async () => {
    const dirs = readdirSync(fixtures).filter(dir => dir.charAt(0) !== '.');

    const buildPromise = dirs.map(dir => build({ cwd: join(fixtures, dir) }));
    await Promise.all(buildPromise);
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

  it('ssr-styles', async () => {
    const render = server({
      root: join(fixtures, 'ssr-styles', 'dist'),
    });

    const { ssrHtml: indexHtml } = await render({
      req: {
        url: '/',
      },
    });

    expect(indexHtml).toMatchSnapshot();

    const { ssrHtml: newsHtml } = await render({
      req: {
        url: '/news',
      },
    });
    expect(newsHtml).toMatchSnapshot();
  });
});
