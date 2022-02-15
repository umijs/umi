import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { autoCssModulesHandler } from './autoCssModules';

interface IOpts {
  code: string;
}

async function doTransform({ code }: IOpts): Promise<string> {
  await init;
  const [imports, exports] = parse(code);
  return autoCssModulesHandler({ code, imports, exports } as any);
}

test('css modules', async () => {
  expect(await doTransform({ code: `import styles from 'a.css';` })).toEqual(
    `import styles from 'a.css?modules';`,
  );
  expect(await doTransform({ code: `import styles from 'a.less';` })).toEqual(
    `import styles from 'a.less?modules';`,
  );
  expect(await doTransform({ code: `import styles from 'a.scss';` })).toEqual(
    `import styles from 'a.scss?modules';`,
  );
  expect(await doTransform({ code: `import styles from 'a.sass';` })).toEqual(
    `import styles from 'a.sass?modules';`,
  );
  expect(await doTransform({ code: `import styles from 'a.stylus';` })).toEqual(
    `import styles from 'a.stylus?modules';`,
  );
  expect(await doTransform({ code: `import styles from 'a.styl';` })).toEqual(
    `import styles from 'a.styl?modules';`,
  );
});

test('no css modules', async () => {
  expect(await doTransform({ code: `import 'a.css';` })).toEqual(
    `import 'a.css';`,
  );
});

test('do not infect non css imports', async () => {
  expect(await doTransform({ code: `import a from 'a';` })).toEqual(
    `import a from 'a';`,
  );
  expect(await doTransform({ code: `import a from 'a.js';` })).toEqual(
    `import a from 'a.js';`,
  );
  expect(await doTransform({ code: `import 'a';` })).toEqual(`import 'a';`);
});
