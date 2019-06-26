import { join } from 'path';
import { winPath } from 'umi-utils';
import { diffPlugins } from './getPlugins';

describe('getPlugins', () => {
  const cwd = winPath(join(__dirname, 'fixtures/Service/plugins-diff'));

  it('diffPlugins pluginsChanged', () => {
    expect(diffPlugins(['./a'], ['./b'], { cwd })).toEqual({
      pluginsChanged: true,
    });
    expect(diffPlugins(['./a'], ['./a', './b'], { cwd })).toEqual({
      pluginsChanged: true,
    });
  });

  it('diffPlugins isEqual', () => {
    expect(diffPlugins(['./a'], ['./a'], { cwd })).toEqual({
      optionChanged: [],
    });
  });

  it('diffPlugins isEqual with options', () => {
    expect(diffPlugins([['./a', { a: 1 }]], [['./a', { a: 1 }]], { cwd })).toEqual({
      optionChanged: [],
    });
  });

  it('diffPlugins isEqual with functions', () => {
    expect(
      diffPlugins(
        [
          [
            './a',
            {
              a() {
                alert(1);
              },
            },
          ],
        ],
        [
          [
            './a',
            {
              a() {
                alert(1);
              },
            },
          ],
        ],
        { cwd },
      ),
    ).toEqual({
      optionChanged: [],
    });
    expect(
      diffPlugins(
        [
          [
            './a',
            () => {
              alert(1);
            },
          ],
        ],
        [
          [
            './a',
            () => {
              alert(1);
            },
          ],
        ],
        { cwd },
      ),
    ).toEqual({
      optionChanged: [],
    });
  });

  it('diffPlugins optionChanged 1', () => {
    expect(
      diffPlugins([['./a', { antd: false }]], [['./a', { antd: true }]], {
        cwd,
      }),
    ).toEqual({
      optionChanged: [
        {
          id: 'user:a.js',
          opts: { antd: false },
        },
      ],
    });
  });

  it('diffPlugins optionChanged 2', () => {
    expect(diffPlugins([['./a', { a: 'b' }]], ['./a'], { cwd })).toEqual({
      optionChanged: [
        {
          id: 'user:a.js',
          opts: { a: 'b' },
        },
      ],
    });
  });

  it('diffPlugins optionChanged 3', () => {
    expect(
      diffPlugins([['./a', { a: 'b' }], './b'], ['./a', ['./b', 'foo']], {
        cwd,
      }),
    ).toEqual({
      optionChanged: [
        {
          id: 'user:a.js',
          opts: { a: 'b' },
        },
        {
          id: 'user:b.js',
          opts: undefined,
        },
      ],
    });
  });
});
