import transformIEAR, { IEAR_REG_EXP } from './transformIEAR';

describe('transform path for import/export/await-import/require', () => {
  it('match cases', () => {
    const cases = [
      "import normal from '/normal';",
      "import Upper from '/uppper';",
      "import $_Pl from '/mixed-var';",
      "import * as NS from '/ns';",
      "import type * as type from '/type';",
      "import { member1, member2 as b } from '/member';",
      "import mixed, { member1, member2 as b, type c } from '/mixed';",
      `import {
        breakline,
        type a,
        member as b
      }
      from
      '/breakline';`,
      ";import semic from '/semic';",
      'import double_quotes from "/double_quotes";',
      "import escape from '/I_am'_escape';",
      "import '/.umi/a'",
      "export * from '/export-all';",
      "export { member } from '/export-member';",
      "export { default as d, member1, member2 as b } from '/export-mixed';",
      "await import('/import');",
      "require('/require');",
    ];

    expect(cases.join('\n').match(IEAR_REG_EXP)).toHaveLength(cases.length);
  });

  it('unmatch cases', () => {
    const cases = [
      "import pkg from 'pkg';",
      "import relative from './relative';",
      "import alias from '@@/alias';",
      "import http from 'http://www.example.com';",
      "export * from 'pkg';",
      "export { member } from './relative';",
      "export { default as d } from '@@/alias';",
      "a.import('/member-import');",
      "require.resolve('/require-resolve');",
      "{ someKey: '/path/to/some/key' }",
      "// import comment from '/comment';",
      `import invalidQuotes from '/invalid";`,
      "import * as a, { member } from '/error-syntax';",
    ];

    expect(cases.join('\n').match(IEAR_REG_EXP)).toBeNull();
  });

  it('some syntax eror cases still be matched (unhandled)', () => {
    const cases = [
      "export * as b from '/error-syntax';",
      "import type a, from '/error-syntax';",
      "import from '/error-syntax';",
      "import { a-b45*Y } from '/error-syntax';",
    ];

    expect(cases.join('\n').match(IEAR_REG_EXP)).toHaveLength(cases.length);
  });

  it('transform .umi & node_modules', () => {
    const cases = [
      "import module from '/path/to/.umi/plugin-tmp';",
      "import pkg from '/path/to/node_modules/pkg';",
      "import sibling from '/path/to/.umi/plugin-self/sibling.ts';",
    ];

    expect(
      transformIEAR(
        {
          content: cases.join('\n'),
          path: '/path/to/.umi/plugin-self/index.ts',
        },
        { paths: { absTmpPath: '/path/to/.umi' }, cwd: '/path/to' } as any,
      ),
    ).toEqual(
      cases
        .join('\n')
        .replace('/path/to/.umi', '..')
        .replace('/path/to/.umi/plugin-self', '.')
        .replace('/path/to/node_modules', '@fs/node_modules'),
    );
  });
});
