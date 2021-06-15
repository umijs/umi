import { rimraf, winPath } from '@umijs/utils';
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
  const testPath = winPath(join(__dirname, '.umi-test'));
  const testNodeModules = winPath(join(testPath, 'node_modules'));
  rimraf.sync(testPath);
  mkdirSync(testPath);
  mkdirSync(testNodeModules);

  // test package name import
  mkdirSync(winPath(join(testNodeModules, 'foo')));
  writeFileSync(
    winPath(join(testNodeModules, 'foo', 'package.json')),
    JSON.stringify({
      module: 'index.js',
    }),
  );
  writeFileSync(
    winPath(join(testNodeModules, 'foo', 'index.js')),
    `
    export default 'A';
  `,
  );
  expect(await figureOutExport(testPath, 'foo')).toEqual(
    `import _ from "foo";\nexport default _;\nexport * from "foo";`,
  );
  writeFileSync(
    winPath(join(testNodeModules, 'foo', 'index.js')),
    `
    exports = {a:'A'};
  `,
  );
  expect(await figureOutExport(testPath, 'foo')).toEqual(
    `import * as _ from "foo";\nexport default _;\nexport * from "foo";`,
  );
  // abs path import
  let asbPath = winPath(resolve(testNodeModules, 'bar'));
  mkdirSync(winPath(join(testNodeModules, 'bar')));
  writeFileSync(winPath(join(asbPath, 'bar.js')), 'export default "A";');
  expect(
    await figureOutExport(
      testPath,
      winPath(resolve(testNodeModules, 'bar/bar.js')),
    ),
  ).toEqual(
    `import _ from "${winPath(
      join(asbPath, 'bar.js'),
    )}";\nexport default _;\nexport * from "${winPath(
      join(asbPath, 'bar.js'),
    )}";`,
  );

  // import file without ext.
  mkdirSync(winPath(join(testNodeModules, 'xxx')));
  asbPath = winPath(join(testNodeModules, 'xxx', 'runtime.js'));
  writeFileSync(asbPath, 'export default "EXPORT"');
  expect(await figureOutExport(testPath, 'xxx/runtime')).toEqual(
    `import _ from "${asbPath}";\nexport default _;\nexport * from "${asbPath}";`,
  );

  // direct reference
  mkdirSync(winPath(join(testNodeModules, 'yyy')));
  mkdirSync(winPath(join(testNodeModules, 'yyy', 'dist')));
  asbPath = winPath(resolve(testNodeModules, 'yyy', 'dist', 'index.js'));
  writeFileSync(asbPath, 'exports.a = "1";');
  expect(await figureOutExport(testPath, asbPath)).toEqual(
    `import * as _ from "${asbPath}";\nexport default _;\nexport * from "${asbPath}";`,
  );
});
