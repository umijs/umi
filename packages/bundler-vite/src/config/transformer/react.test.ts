import react from './react';

jest.mock('@vitejs/plugin-react', () => ({
  __esModule: true,
  default: () => [
    { name: 'vite:react-babel' },
    { enforce: 'pre' },
    { name: 'vite:react-refresh' },
  ],
}));

test('test react plugin & transform umi babel to vite babel', () => {
  const plugins = react({}, {}).plugins;
  expect(plugins).toEqual(
    expect.arrayContaining([
      expect.arrayContaining([
        expect.objectContaining({
          name: 'vite:react-babel',
        }),
        expect.objectContaining({
          enforce: 'pre',
        }),
        expect.objectContaining({
          name: 'vite:react-refresh',
        }),
      ]),
    ]),
  );
});
