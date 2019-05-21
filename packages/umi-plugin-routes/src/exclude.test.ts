import exclude from './exclude';

describe('umi-plugin-routes:exclude', () => {
  it('function', () => {
    expect(
      exclude(
        [{ foo: 1 }, { bar: 1 }],
        [
          route => {
            return 'foo' in route;
          },
        ],
      ),
    ).toEqual([{ bar: 1 }]);
  });

  it('regexp', () => {
    expect(exclude([{ component: 'a' }, { component: 'b' }, { component: 'c' }], [/a|b/])).toEqual([
      { component: 'c' },
    ]);
  });

  it('regexp (ignore arrow function)', () => {
    expect(
      exclude([{ component: '() => a' }, { component: 'b' }, { component: 'c' }], [/a|b/]),
    ).toEqual([{ component: '() => a' }, { component: 'c' }]);
  });

  it('support nested routes', () => {
    expect(
      exclude(
        [{ foo: 1 }, { bar: 1, routes: [{ foo: 1 }, { bar: 1 }] }],
        [
          route => {
            return 'foo' in route;
          },
        ],
      ),
    ).toEqual([{ bar: 1, routes: [{ bar: 1 }] }]);
  });
});
