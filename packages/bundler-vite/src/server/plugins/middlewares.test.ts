import middlewaresPlugin from './middlewares';

test('registers middlewares in a configureServer post hook', () => {
  const first = jest.fn();
  const second = jest.fn();
  const use = jest.fn();
  const plugin = middlewaresPlugin([[first, second]]);

  expect(plugin.enforce).toBe('pre');

  const postHook = (plugin.configureServer as Function)({
    config: { base: '/' },
    middlewares: { use },
  });

  expect(use).toHaveBeenCalledTimes(1);

  postHook();

  expect(use).toHaveBeenCalledTimes(3);
});

test('resolves compiler middleware factories', () => {
  const middleware = jest.fn();
  const factory = ({ compiler }: { compiler: unknown }) => {
    expect(compiler).toBeUndefined();
    return middleware;
  };
  const use = jest.fn();
  const plugin = middlewaresPlugin([factory]);

  const postHook = (plugin.configureServer as Function)({
    config: { base: '/' },
    middlewares: { use },
  });
  postHook();

  expect(use).toHaveBeenCalledTimes(2);
});

test('restores the original URL while running Umi middlewares', () => {
  const middleware = jest.fn((req, _res, next) => {
    expect(req.url).toBe('/nested/route');
    next();
  });
  const use = jest.fn();
  const plugin = middlewaresPlugin([middleware]);
  const postHook = (plugin.configureServer as Function)({
    config: { base: '/' },
    middlewares: { use },
  });
  const req = { url: '/nested/route' };
  const next = jest.fn();

  use.mock.calls[0][0](req, {}, jest.fn());
  req.url = '/index.html';
  postHook();
  use.mock.calls[1][0](req, {}, next);

  expect(middleware).toHaveBeenCalledTimes(1);
  expect(req.url).toBe('/index.html');
  expect(next).toHaveBeenCalledWith(undefined);
});

test('preserves the base-stripped URL seen after Vite base middleware', () => {
  const middleware = jest.fn((req, _res, next) => {
    expect(req.url).toBe('/nested/route?foo=bar');
    next();
  });
  const use = jest.fn();
  const plugin = middlewaresPlugin([middleware]);
  const postHook = (plugin.configureServer as Function)({
    config: { base: '/base/' },
    middlewares: { use },
  });
  const req = { url: '/base/nested/route?foo=bar' };

  use.mock.calls[0][0](req, {}, jest.fn());
  req.url = '/index.html';
  postHook();
  use.mock.calls[1][0](req, {}, jest.fn());

  expect(middleware).toHaveBeenCalledTimes(1);
});
