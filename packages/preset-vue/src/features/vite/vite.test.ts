test('does not load Vite-only plugins while registering the feature', () => {
  const loadedModules: string[] = [];
  const vue = jest.fn(() => ({ name: 'vite:vue' }));
  const vueJsx = jest.fn(() => ({ name: 'vite:vue-jsx' }));

  jest.doMock('../../../compiled/@vitejs/plugin-vue/index.js', () => {
    loadedModules.push('vue');
    return { __esModule: true, default: vue };
  });
  jest.doMock('@vitejs/plugin-vue-jsx', () => {
    loadedModules.push('vue-jsx');
    return { __esModule: true, default: vueJsx };
  });

  let modifyViteConfig: Function | undefined;
  jest.isolateModules(() => {
    const viteFeature = require('./vite').default;
    viteFeature({
      config: { vue: {} },
      describe: jest.fn(),
      modifyViteConfig(fn: Function) {
        modifyViteConfig = fn;
      },
    });
  });

  expect(loadedModules).toEqual([]);
  expect(modifyViteConfig).toEqual(expect.any(Function));
});
