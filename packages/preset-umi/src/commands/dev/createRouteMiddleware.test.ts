import type { Compiler, RequestHandler } from '@umijs/bundler-webpack';
import type { IApi } from '../../types';
import { createRouteMiddleware } from './createRouteMiddleware';

function createApi(config: Record<string, any> = { utoopack: {} }) {
  let onCompileDone: ((opts: { stats: any }) => void) | undefined;
  const api = {
    config: {
      publicPath: '/cdn/',
      history: { type: 'browser' },
      base: '/',
      scripts: ['/custom.js'],
      ...config,
    },
    appData: { routes: {} },
    onDevCompileDone: jest.fn((fn: (opts: { stats: any }) => void) => {
      onCompileDone = fn;
    }),
    applyPlugins: jest.fn(
      async ({ initialValue }: { initialValue: any }) => initialValue,
    ),
  };
  return {
    api: api as unknown as IApi,
    compile(stats: any) {
      onCompileDone?.({ stats });
    },
  };
}

function createStats(js: string, css?: string) {
  const assets = [js, css].filter(Boolean);
  return {
    compilation: {
      assets: Object.fromEntries(assets.map((name) => [name, {}])),
    },
    entrypoints: {
      umi: { assets: assets.map((name) => ({ name })), chunks: [] },
    },
  };
}

function request(middleware: RequestHandler) {
  const response = {
    set: jest.fn(),
    end: jest.fn(),
  };
  const html = new Promise<string>((resolve) => {
    response.end.mockImplementation(resolve);
  });
  const completed = middleware(
    { path: '/', headers: { accept: 'text/html' } } as any,
    response as any,
    jest.fn(),
  );
  return { html, completed, response };
}

test.each(['umi.js', 'assets/js/umi.12345678.js'])(
  'renders compiled Utoopack entry %s once after root and before custom scripts',
  async (js) => {
    const { api, compile } = createApi();
    const factory = createRouteMiddleware({ api });
    // The hook must be registered before the bundler constructs its middleware.
    expect(api.onDevCompileDone).toHaveBeenCalledTimes(1);
    compile(createStats(js, 'assets/css/umi.css'));
    const middleware = factory({ compiler: undefined as any });
    const html = await request(middleware).html;

    expect(html.split(`/cdn/${js}`)).toHaveLength(2);
    expect(html.indexOf(`/cdn/${js}`)).toBeGreaterThan(
      html.indexOf('id="root"'),
    );
    expect(html.indexOf(`/cdn/${js}`)).toBeLessThan(html.indexOf('/custom.js'));
    expect(html).toContain('href="/cdn/assets/css/umi.css"');
  },
);

test('waits for first Utoopack compilation for concurrent early requests', async () => {
  const { api, compile } = createApi();
  const middleware = createRouteMiddleware({ api })({
    compiler: undefined as any,
  });
  const first = request(middleware);
  const second = request(middleware);
  await Promise.resolve();
  expect(first.response.end).not.toHaveBeenCalled();
  expect(second.response.end).not.toHaveBeenCalled();
  expect(api.applyPlugins).not.toHaveBeenCalled();

  api.config.headScripts = ['/entry_runtime.js'];
  compile(createStats('assets/umi.js'));
  const htmlFiles = await Promise.all([first.html, second.html]);
  for (const html of htmlFiles) {
    expect(html).toContain('src="/cdn/assets/umi.js"');
    expect(html.indexOf('/entry_runtime.js')).toBeLessThan(
      html.indexOf('id="root"'),
    );
  }
});

test('uses the latest Utoopack compilation for later requests', async () => {
  const { api, compile } = createApi();
  const middleware = createRouteMiddleware({ api })({
    compiler: undefined as any,
  });
  compile(createStats('assets/umi.first.js'));
  expect(await request(middleware).html).toContain('/cdn/assets/umi.first.js');
  compile(createStats('assets/umi.second.js'));
  const html = await request(middleware).html;
  expect(html).toContain('/cdn/assets/umi.second.js');
  expect(html).not.toContain('umi.first.js');
});

test('keeps the Mako dev entry and stylesheet without compile stats', async () => {
  const { api } = createApi({ mako: {} });
  const html = await request(
    createRouteMiddleware({ api })({ compiler: undefined as any }),
  ).html;
  expect(html).toContain('src="/cdn/umi.js"');
  expect(html).toContain('href="/cdn/umi.css"');
});

test('keeps Webpack compiler stats authoritative', async () => {
  const { api, compile } = createApi({});
  let onDone: ((stats: any) => void) | undefined;
  const compiler = {
    hooks: {
      done: { tap: (_name: string, fn: typeof onDone) => (onDone = fn) },
    },
  } as unknown as Compiler;
  const middleware = createRouteMiddleware({ api })({ compiler });
  compile(createStats('unrelated/umi.js'));
  const pending = request(middleware);
  await Promise.resolve();
  expect(pending.response.end).not.toHaveBeenCalled();
  onDone?.(createStats('webpack/umi.js'));
  const html = await pending.html;
  expect(html).toContain('src="/cdn/webpack/umi.js"');
  expect(html).not.toContain('unrelated/umi.js');
});
