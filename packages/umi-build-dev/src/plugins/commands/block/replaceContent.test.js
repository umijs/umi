import replaceContent from './replaceContent';

describe('replaceContent', () => {
  it('normal', () => {
    expect(
      replaceContent(
        `
ROUTE_PATH
BLOCK_NAME
PAGE_NAME
PAGE_NAME_UPPER_CAMEL_CASE
ROUTE_PATH_foo
ROUTE_PATH-bar
    `,
        {
          path: '/foo/bar',
        },
      ).trim(),
    ).toEqual(
      `
/foo/bar
foo-bar
bar
Bar
/foo/bar_foo
/foo/bar-bar
    `.trim(),
    );
  });
});
