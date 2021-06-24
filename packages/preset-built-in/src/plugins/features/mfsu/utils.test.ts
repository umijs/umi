import { rimraf, winPath } from '@umijs/utils';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { cjsModeEsmParser, figureOutExport } from './utils';

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
    `import _ from "foo";\nexport default _;\nexport * from "foo";`,
  );
  // abs path import
  let asbPath = winPath(resolve(testNodeModules, 'bar'));
  mkdirSync(asbPath);
  writeFileSync(
    winPath(join(asbPath, 'bar.js')),
    'export default function func(){return;};',
  );
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
    `import _ from "${asbPath}";\nexport default _;\nexport * from "${asbPath}";`,
  );
});

test('cjs mode esm', () => {
  const file = `
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  Object.defineProperty(exports, "aaaa", {
    value: true
  });

  Object.defineProperty(    exports    ,      "bbbb"    , {
    value: true
  });


  Object.defineProperty(    fooooo    ,      "bbbb"    , {
    value: true
  });

  exports.Foo = void 0;

  exports.default = "123123";

  exports {Love};

  exportsILoveYou = "1";
  
  `;

  expect(cjsModeEsmParser(file)).toEqual([
    '__esModule',
    'aaaa',
    'bbbb',
    'Foo',
    'default',
  ]);
});
