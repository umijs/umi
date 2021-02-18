import BabelRegister from './BabelRegister';

beforeEach(() => {
  jest.resetModules();
});

test('normal', () => {
  const args: any[] = [];
  jest.doMock('@umijs/deps/compiled/babel/register', () => {
    return (opts: object) => {
      args.push(opts);
    };
  });
  new BabelRegister().register();
  expect(args[0].only).toEqual([]);
});

test('setOnlyMap', () => {
  const args: any[] = [];
  jest.doMock('@umijs/deps/compiled/babel/register', () => {
    return (opts: object) => {
      args.push(opts);
    };
  });
  const br = new BabelRegister();
  br.setOnlyMap({
    key: 'foo',
    value: ['a', 'b'],
  });
  br.setOnlyMap({
    key: 'foo',
    value: ['b', 'c'],
  });
  br.setOnlyMap({
    key: 'bar',
    value: ['c', 'd'],
  });
  expect(args[0].only).toEqual(['a', 'b']);
  expect(args[1].only).toEqual(['b', 'c']);
  expect(args[2].only).toEqual(['b', 'c', 'd']);
});
