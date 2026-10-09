import { createUmiSnapshot } from './umiDevframe';

test('Umi inspector snapshot stays live and contains only selected data', () => {
  const routes: Record<string, any> = {
    home: {
      path: '/',
      component: '@/pages/index.tsx',
      customSecret: 'route-secret',
      customCallback: () => 'should not be exposed',
    },
  };
  const api = {
    appData: {
      routes,
      umi: { version: '4.7.21' },
      bundler: 'webpack',
      bundleStatus: {
        done: false,
        progresses: [{ percent: 0.54, status: 'building' }],
      },
    },
    service: {
      plugins: {
        foo: {
          id: 'foo',
          key: 'foo',
          type: 'plugin',
          time: { register: 4, hooks: { onGenerateFiles: [2, 3] } },
          privateSecret: 'plugin-secret',
        },
      },
      skipPluginIds: new Set<string>(),
    },
    config: {
      base: '/',
      history: { type: 'browser' },
      mfsu: false,
      apiToken: 'config-secret',
    },
    pkg: { name: 'example' },
  } as unknown as Parameters<typeof createUmiSnapshot>[0];

  const initial = createUmiSnapshot(api);
  expect(initial.routes[0]).toMatchObject({
    id: 'home',
    path: '/',
    component: '@/pages/index.tsx',
  });
  expect(initial.plugins[0]).toMatchObject({
    id: 'foo',
    registerMs: 4,
    totalMs: 9,
    hooks: { onGenerateFiles: 5 },
  });
  expect(initial.build.progresses[0]).toEqual({
    percent: 54,
    status: 'building',
  });
  expect(JSON.stringify(initial)).not.toMatch(/secret|Callback|apiToken/);

  routes.about = { path: '/about', name: 'About' };
  api.appData.bundleStatus.done = true;
  const updated = createUmiSnapshot(api);
  expect(updated.routes).toHaveLength(2);
  expect(updated.build.compiledOnce).toBe(true);
});
