import target from './target';

test('transform umi targets', () => {
  expect(target({ targets: { chrome: 80, edge: 11 } }, {}).build).toEqual({
    target: ['chrome80', 'edge11'],
  });
});

test('filter ie browsers', () => {
  expect(target({ targets: { chrome: 80, ie: 11 } }, {}).build).toEqual({});
});

test('empty target - config', () => {
  expect(target({ targets: {} }, {})).toEqual({
    build: { target: [] },
    plugins: [],
  });
});

test('old browser - config', () => {
  const plugins = target({ targets: { ie: 11 } }, {}).plugins;
  expect(plugins).toEqual(
    expect.arrayContaining([
      expect.arrayContaining([
        expect.objectContaining({ name: 'vite:legacy-config' }),
      ]),
    ]),
  );
});
