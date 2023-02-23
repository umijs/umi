import path from 'path';
import { build } from './build';

const fixtures = path.join(__dirname, '../../../fixtures/prepare-build');

test('build', async () => {
  const res = await build({
    entryPoints: [path.join(fixtures, 'normal/index.ts')],
  });
  const text = res.outputFiles![0].text;
  expect(text).toContain(`import "foo"`);
  expect(text).toContain(`import "foo/bar"`);
  expect(text).toContain(`import "foo/bar.ts"`);
  expect(text).toContain(`import "./a.ext-must-not-exist"`);
  expect(text).toContain(`import "./a.html"`);
  expect(text).toContain(`var bar = "bar"`);
  expect(text).toContain(`var foo = "foo"`);
});

test('build with alias', async () => {
  const res = await build({
    entryPoints: [path.join(fixtures, 'with-alias/index.ts')],

    config: {
      alias: {
        react: '/project/node_modules/react',
        request: 'request-umi',
        'home-made': './lib/home-made.ts',
        umi: '@@/export.ts',
        '@@': '/project/src/.umi',
      },
    },
  });
});
