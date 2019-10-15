import replaceContent from './replaceContent';

describe('replaceContentCamelCase', () => {
  it('normal', () => {
    expect(
      replaceContent(
        `
ROUTE_PATH
BLOCK_NAME
PAGE_NAME
PAGE_NAME_UPPER_CAMEL_CASE
BLOCK_NAME_CAMEL_CASE
ROUTE_PATH_foo
ROUTE_PATH-bar
    `,
        {
          path: '/FooBar',
        },
      ).trim(),
    ).toEqual(
      `
/foobar
foobar
foobar
FooBar
fooBar
/foobar_foo
/foobar-bar
    `.trim(),
    );
  });
});

describe('replaceContent', () => {
  it('normal', () => {
    expect(
      replaceContent(
        `
ROUTE_PATH
BLOCK_NAME
PAGE_NAME
PAGE_NAME_UPPER_CAMEL_CASE
BLOCK_NAME_CAMEL_CASE
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
fooandbar
bar
Bar
fooAndbar
/foo/bar_foo
/foo/bar-bar
    `.trim(),
    );
  });
});
