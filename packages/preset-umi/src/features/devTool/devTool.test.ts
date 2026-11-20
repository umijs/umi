import type { RequestHandler } from '@umijs/bundler-webpack';
import { resolve } from 'path';
import type { IApi } from '../../types';
import devTool from './devTool';

const cwd = resolve('test-project');
const routeFile = resolve(cwd, 'src/pages/index.tsx');
const helperFile = resolve(cwd, 'src/helper.ts');
const workspaceFile = resolve(cwd, '../workspace-shared/index.ts');
const otherWorkspaceFile = resolve(cwd, '../workspace-utils/index.ts');
const hoistedFile = resolve(cwd, '../node_modules/shared/index.js');

function createApi(ui: boolean) {
  const config = {
    hash: true,
    history: { type: 'browser', options: { privateSetting: 'fixture' } },
    define: { privateSetting: 'fixture' },
    mfsu: false,
  };
  const addBeforeMiddlewares = jest.fn<
    unknown,
    [() => Promise<RequestHandler[]>]
  >();
  const api = {
    cwd,
    config,
    userConfig: { ...config, ui },
    appData: {
      cwd,
      bundler: 'webpack',
      bundleStatus: { done: true, progresses: [] },
      framework: 'react',
      umi: { version: '4.7.34', privateSetting: 'fixture' },
      args: { privateSetting: 'fixture' },
      apiRoutes: { index: { __content: 'fixture API route source' } },
      config,
      routes: {
        index: {
          id: 'index',
          path: '/',
          absPath: '/',
          __absFile: routeFile,
          __content: 'fixture route source',
          privateSetting: 'fixture',
        },
      },
      plugins: {
        example: {
          key: 'example',
          path: routeFile,
          config: { privateSetting: 'fixture' },
          time: { register: 2, hooks: { onStart: [1] } },
        },
      },
      prepare: {
        buildResult: {
          outputFiles: [{ text: 'fixture output' }],
          metafile: {
            inputs: {
              [routeFile]: {
                imports: [
                  { path: helperFile, original: 'fixture import' },
                  { path: workspaceFile },
                  { path: otherWorkspaceFile },
                  { path: hoistedFile },
                ],
              },
              [helperFile]: { imports: [] },
              [workspaceFile]: { imports: [] },
              [otherWorkspaceFile]: { imports: [] },
              [hoistedFile]: { imports: [] },
            },
            outputs: { 'dist/index.js': { entryPoint: routeFile } },
          },
        },
      },
      ui: {
        modules: [
          {
            name: 'Example',
            menus: [
              {
                path: '/example',
                name: 'Example',
                icon: 'home',
                url: '/docs?theme=dark#overview',
                privateSetting: 'fixture',
              },
            ],
            privateSetting: 'fixture',
          },
        ],
      },
    },
    addBeforeMiddlewares,
    applyPlugins: ({ initialValue }: { initialValue: unknown }) => initialValue,
    ApplyPluginsType: { modify: 'modify' },
  };

  devTool(api as unknown as IApi);
  return addBeforeMiddlewares.mock.calls[0][0]();
}

function request(middleware: RequestHandler, path: string) {
  const json = jest.fn((value) => JSON.parse(JSON.stringify(value)));
  const end = jest.fn();
  middleware(
    { path } as Parameters<RequestHandler>[0],
    { json, end } as unknown as Parameters<RequestHandler>[1],
    jest.fn(),
  );
  return { json, end };
}

test('returns a minimal diagnostic summary and projected config by default', async () => {
  const [middleware] = await createApi(false);

  expect(
    request(middleware, '/__umi/api/app-data').json.mock.results[0].value,
  ).toStrictEqual({
    bundler: 'webpack',
    framework: 'react',
    umi: { version: '4.7.34' },
    bundleStatus: { done: true },
  });
  expect(
    request(middleware, '/__umi/api/config').json.mock.results[0].value,
  ).toStrictEqual({
    hash: true,
    history: { type: 'browser' },
    mfsu: false,
  });
});

test('projects the display data used by explicitly enabled Umi UI', async () => {
  const [middleware] = await createApi(true);
  const result = request(middleware, '/__umi/api/app-data').json.mock.results[0]
    .value;

  expect(result).toMatchObject({
    config: { hash: true, history: { type: 'browser' }, mfsu: false },
    userConfig: { hash: true, history: { type: 'browser' }, mfsu: false },
    routes: {
      index: {
        id: 'index',
        path: '/',
        absPath: '/',
        file: 'src/pages/index.tsx',
        isLayout: false,
      },
    },
    plugins: {
      example: {
        key: 'example',
        time: { register: 2, hooks: { onStart: [1] } },
      },
    },
    prepare: {
      buildResult: {
        metafile: {
          inputs: {
            'src/pages/index.tsx': {
              imports: [
                { path: 'src/helper.ts' },
                { path: 'external:1/index.ts' },
                { path: 'external:2/index.ts' },
                { path: 'node_modules/external:3/index.js' },
              ],
            },
            'src/helper.ts': { imports: [] },
            'external:1/index.ts': { imports: [] },
            'external:2/index.ts': { imports: [] },
            'node_modules/external:3/index.js': { imports: [] },
          },
        },
      },
    },
    ui: {
      modules: [
        {
          name: 'Example',
          menus: [
            {
              path: '/example',
              name: 'Example',
              icon: 'home',
              url: '/docs?theme=dark#overview',
            },
          ],
        },
      ],
    },
  });
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('fixture');
  expect(serialized).not.toContain(cwd);
  expect(serialized).not.toContain('workspace-shared');
  expect(serialized).not.toContain('workspace-utils');
});

test('continues to report bundle status and respond to readiness checks', async () => {
  const [middleware] = await createApi(false);

  expect(request(middleware, '/__umi/api/status').end).toHaveBeenCalledTimes(1);
  expect(
    request(middleware, '/__umi/api/bundle-status').json.mock.results[0].value,
  ).toStrictEqual({
    bundler: 'webpack',
    bundleStatus: { done: true, progresses: [] },
  });
});
