import middlewaresPlugin from './middlewares';

test('registers middlewares through the public Vite server API', () => {
  const first = jest.fn();
  const second = jest.fn();
  const use = jest.fn();
  const plugin = middlewaresPlugin([[first, second]]);

  (plugin.configureServer as Function)({ middlewares: { use } });

  expect(use.mock.calls).toEqual([[first], [second]]);
});

test('resolves compiler middleware factories', () => {
  const middleware = jest.fn();
  const factory = ({ compiler }: { compiler: unknown }) => {
    expect(compiler).toBeUndefined();
    return middleware;
  };
  const use = jest.fn();
  const plugin = middlewaresPlugin([factory]);

  (plugin.configureServer as Function)({ middlewares: { use } });

  expect(use).toHaveBeenCalledWith(middleware);
});
