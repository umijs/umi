import { Config, EnableBy, getConfigRoutes } from '@umijs/core';
import { join } from 'path';
import type { IApi } from '../../types';
import exportStatic from './exportStatic';

function setup(extraRoutePaths: unknown, routes = {}) {
  const config = { exportStatic: { extraRoutePaths } };
  const appData = { routes, exportHtmlData: [] };
  const api = {
    EnableBy,
    config,
    appData,
    describe: jest.fn(),
    onCheck: jest.fn(),
    modifyExportHTMLFiles: jest.fn(),
    onGenerateFiles: jest.fn(),
    addRuntimePlugin: jest.fn(),
    writeTmpFile: jest.fn(),
  };

  exportStatic(api as unknown as IApi);
  const [
    {
      config: { schema },
    },
  ] = api.describe.mock.calls[0];

  return {
    validate: () =>
      Config.validateConfig({ config, schemas: { exportStatic: schema } }),
    generate: api.onGenerateFiles.mock.calls[0][0],
    appData,
  };
}

test.each([
  { name: 'an array', extraRoutes: (paths: unknown[]) => paths },
  {
    name: 'an async function',
    extraRoutes: (paths: unknown[]) => async () => paths,
  },
])('exports extra route objects from $name', async ({ extraRoutes }) => {
  const { validate, generate, appData } = setup(
    extraRoutes(['/news/1', { path: '/news/2', prerender: false }]),
  );

  validate();
  await generate();

  expect(appData.exportHtmlData).toEqual([
    {
      route: { path: '/news/1' },
      file: join('news', '1', 'index.html'),
      prerender: true,
    },
    {
      route: { path: '/news/2' },
      file: join('news', '2', 'index.html'),
      prerender: false,
    },
  ]);
});

test.each([{ prerender: false }, { path: '/news/1', prerender: 'false' }])(
  'rejects a malformed extra route object: %j',
  (route) => {
    expect(setup([route]).validate).toThrow('Invalid value for exportStatic');
  },
);

test('exports index routes without a path and skips descendants of splats', async () => {
  const routes = getConfigRoutes({
    routes: [
      { path: '/docs', routes: [{ index: true, component: 'intro' }] },
      { path: '/files/*', routes: [{ path: 'edit', component: 'editor' }] },
      { path: '*', component: 'not-found' },
    ],
  });
  const { generate, appData } = setup([], routes);
  await generate();
  expect(appData.exportHtmlData.map(({ file }) => file)).toEqual([
    join('docs', 'index.html'),
    '404.html',
  ]);
});

test('skips plugin splat routes with missing or stale resolved paths', async () => {
  const { generate, appData } = setup([], {
    fallback: { id: 'fallback', path: '*' },
    docs: { id: 'docs', path: '*', absPath: '/docs' },
  });

  await generate();

  expect(appData.exportHtmlData).toEqual([]);
});
