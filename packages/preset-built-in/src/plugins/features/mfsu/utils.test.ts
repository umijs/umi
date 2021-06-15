import { rimraf } from '@umijs/utils';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { dependenceDiff, figureOutExport, getExportStatement } from './utils';

test('dependenceDiff', () => {
  expect(
    dependenceDiff(
      {
        antd: '4.0.0',
      },
      {
        antd: '3.0.0',
      },
    ),
  ).toEqual('MODIFY');
  expect(
    dependenceDiff(
      {
        antd: '4.0.0',
      },
      {
        antd: '4.0.0',
        lodash: '0.0.0',
      },
    ),
  ).toEqual('ADD');
  expect(
    dependenceDiff(
      {
        antd: '4.0.0',
        lodash: '0.0.0',
      },
      {
        antd: '4.0.0',
      },
    ),
  ).toEqual('REMOVE');
  expect(
    dependenceDiff(
      {
        antd: '4.0.0',
        lodash: '0.0.0',
      },
      {
        antd: '3.0.0',
      },
    ),
  ).toEqual('MODIFY');
});

test('get export statement', () => {
  expect(getExportStatement('react', true)).toEqual(
    'import _ from "react";\nexport default _;\nexport * from "react";',
  );
  expect(getExportStatement('react', false)).toEqual(
    'import * as _ from "react";\nexport default _;\nexport * from "react";',
  );
});

test('figure out export', async () => {
  const testPath = join(__dirname, '.umi-test');
  const testNodeModules = join(testPath, 'node_modules');
  rimraf.sync(testPath);
  mkdirSync(testPath);
  mkdirSync(testNodeModules);

  // test package name import
  mkdirSync(join(testNodeModules, 'foo'));
  writeFileSync(
    join(testNodeModules, 'foo', 'package.json'),
    JSON.stringify({
      module: 'index.js',
    }),
  );
  writeFileSync(
    join(testNodeModules, 'foo', 'index.js'),
    `
    export default 'A';
  `,
  );
  expect(await figureOutExport(testPath, 'foo')).toEqual(
    `import _ from "foo";\nexport default _;\nexport * from "foo";`,
  );
  writeFileSync(
    join(testNodeModules, 'foo', 'index.js'),
    `
    exports = {a:'A'};
  `,
  );
  expect(await figureOutExport(testPath, 'foo')).toEqual(
    `import * as _ from "foo";\nexport default _;\nexport * from "foo";`,
  );
  // esm: test abs path import
  let asbPath = join(testNodeModules, 'bar', 'bar.js');
  mkdirSync(join(testNodeModules, 'bar'));
  writeFileSync(asbPath, 'export default "A";');
  expect(await figureOutExport(testPath, asbPath)).toEqual(
    `import _ from "${asbPath}";\nexport default _;\nexport * from "${asbPath}";`,
  );

  // import file without ext.
  mkdirSync(join(testNodeModules, 'xxx'));
  asbPath = join(testNodeModules, 'xxx', 'runtime.js');
  writeFileSync(asbPath, 'export default "EXPORT"');
  expect(await figureOutExport(testPath, 'xxx/runtime')).toEqual(
    `import _ from "${asbPath}";\nexport default _;\nexport * from "${asbPath}";`,
  );

  // direct reference
  mkdirSync(join(testNodeModules, 'yyy'));
  mkdirSync(join(testNodeModules, 'yyy', 'dist'));
  asbPath = resolve(testNodeModules, 'yyy', 'dist', 'index.js');
  writeFileSync(asbPath, 'exports.a = "1";');
  expect(await figureOutExport(testPath, asbPath)).toEqual(
    `import * as _ from "${asbPath}";\nexport default _;\nexport * from "${asbPath}";`,
  );
});
