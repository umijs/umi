import {
  apply,
  applyForEach,
  compose,
  getItem,
  init,
  mergeConfigAsync,
  mergeConfig,
  use,
} from './runtimePlugin';

describe('runtimePlugin', () => {
  it('getItem', () => {
    init({
      validKeys: ['foo'],
    });
    use({ foo: 'bar' });
    use({ foo: 'baz' });
    expect(getItem('foo')).toEqual(['bar', 'baz']);
  });

  it('getItem empty', () => {
    init({
      validKeys: ['foo'],
    });
    expect(getItem('foo')).toEqual([]);
  });

  it('getItem invalid key', () => {
    init({
      validKeys: ['foo'],
    });
    expect(() => {
      getItem('bar');
    }).toThrow(/Invalid key bar/);
  });

  it('use with invalid key', () => {
    init();
    expect(() => {
      use({ foo: 'bar' });
    }).toThrow(/Invalid key foo/);
  });

  it('apply', () => {
    init({
      validKeys: ['foo'],
    });
    use({
      foo(memo) {
        return `${memo}1`;
      },
    });
    use({
      foo(memo) {
        return `${memo}2`;
      },
    });
    expect(
      apply('foo', {
        initialValue: '0',
      }),
    ).toEqual('012');
  });

  it('apply with args', () => {
    init({
      validKeys: ['foo'],
    });
    use({
      foo(memo, { foo }) {
        return `${memo}1${foo}`;
      },
    });
    expect(
      apply('foo', {
        initialValue: '0',
        args: {
          foo: 'bar',
        },
      }),
    ).toEqual('01bar');
  });

  it('applyForEach', () => {
    init({
      validKeys: ['foo'],
    });
    const ret = [];
    use({
      foo(memo) {
        ret.push(`${memo}1`);
      },
    });
    use({
      foo(memo) {
        ret.push(`${memo}2`);
      },
    });
    applyForEach('foo', {
      initialValue: '0',
    });
    expect(ret).toEqual(['01', '02']);
  });

  it('compose', () => {
    init({
      validKeys: ['foo'],
    });
    const ret = [];
    use({
      foo(memo) {
        ret.push(1);
        memo();
      },
    });
    use({
      foo(memo) {
        ret.push(2);
        memo();
      },
    });
    const a = compose(
      'foo',
      {
        initialValue: () => {
          ret.push('a');
        },
      },
    );
    a();
    expect(ret).toEqual([2, 1, 'a']);
  });

  it('compose empty', () => {
    init({
      validKeys: ['foo'],
    });
    const ret = [];
    const a = compose(
      'foo',
      {
        initialValue: () => {
          ret.push('a');
        },
      },
    );
    a();
    expect(ret).toEqual(['a']);
  });

  it('mergeConfig', () => {
    init({
      validKeys: ['foo'],
    });
    use({
      foo: { a: 1, b: 2 },
    });
    use({
      foo: { a: 2, c: 3 },
    });
    expect(mergeConfig('foo')).toEqual({
      a: 2,
      b: 2,
      c: 3,
    });
  });

  it('mergeConfig invalid plain object', () => {
    init({
      validKeys: ['foo'],
    });
    use({
      foo: 1,
    });
    use({
      foo: { a: 2, c: 3 },
    });
    expect(() => {
      mergeConfig('foo');
    }).toThrow(/Config is not plain object/);
  });

  it('mergeAsyncConfig', async () => {
    init({
      validKeys: ['foo'],
    });
    use({
      foo: Promise.resolve({ a: 1, b: 2 }),
    });
    use({
      foo: { a: 2, c: 3 },
    });
    expect(await mergeConfigAsync('foo')).toEqual({
      a: 2,
      b: 2,
      c: 3,
    });
  });
});
