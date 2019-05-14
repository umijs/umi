import { watcherIgnoreRegExp } from './FilesGenerator';

describe('FilesGenerator', () => {
  it('watcherIgnoreRegExp', () => {
    expect(
      watcherIgnoreRegExp.test('/Users/use/code/ant/umi2/examples/func-test/src/pages/test3.js'),
    ).toBe(false);
    expect(
      watcherIgnoreRegExp.test('/Users/use/code/ant/umi2/examples/func-test/src/pages/_mock.js'),
    ).toBe(true);
    expect(
      watcherIgnoreRegExp.test(
        '/Users/use/code/ant/umi2/examples/func-test/src/pages/.umi/test.js',
      ),
    ).toBe(true);
    expect(
      watcherIgnoreRegExp.test('/Users/use/code/ant/umi2/examples/func-test/src/pages/.gitignore'),
    ).toBe(true);
  });
});
