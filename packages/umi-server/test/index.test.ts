import { join } from 'path';
import { readdirSync } from 'fs';
import { fork } from 'child_process';
import { winPath } from 'umi-utils';
import server from '..';

async function build({ cwd }) {
  return new Promise((resolve, reject) => {
    const umiPath = join(winPath(__dirname), '..', '..', 'umi', 'bin', 'umi');
    const env = {
      UMI_UI: 'none',
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
        process.exit(code);
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
      publicPath: '/',
    });
    const { ssrHtml } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatch(/Hello UmiJS SSR/);
  });

  it('ssr commonjs require', async () => {
    const serverCjs = require('..');
    const render = serverCjs({
      root: join(fixtures, 'ssr', 'dist'),
      publicPath: '/',
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
      publicPath: '/',
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

  it('ssr-dynamicImport', async () => {
    const render = server({
      root: join(fixtures, 'ssr-dynamicImport', 'dist'),
      publicPath: '/',
    });
    const { ssrHtml, chunkMap } = await render({
      req: {
        url: '/',
      },
    });
    expect(ssrHtml).toMatchSnapshot();
    expect(chunkMap).toEqual({
      css: [],
      js: ['umi.js', 'p__index.async.js'],
    });

    const renderPostProcessHtml = server({
      root: join(fixtures, 'ssr-dynamicImport', 'dist'),
      publicPath: '/',
      postProcessHtml: (html, { load }) => {
        const $ = load(html);
        $('html').attr('lang', 'zh');
        return $.html();
      },
    });
    const { ssrHtml: ssrHtmlPostProcessHtml } = await renderPostProcessHtml({
      req: {
        url: '/',
      },
    });
    expect(ssrHtmlPostProcessHtml).toMatchSnapshot();
  });
});
