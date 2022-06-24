import createImports from './babel-plugin-import';

function pathToVersion(): string {
  return '1.2.3';
}

const handleImports = createImports({
  style: true,
  libraryDirectory: 'es',
  libraryName: 'antd',
});

test('babel-plugin-import: no imports', () => {
  expect(
    handleImports({
      imports: [],
      mfName: 'mf',
      alias: {},
      rawCode: '',
      pathToVersion,
    }),
  ).toEqual([]);
});

test('babel-plugin-import: with alias', () => {
  expect(
    handleImports({
      imports: [
        // prettier-ignore
        {n: "antd", s: 26, e: 30, ss: 0, se: 31, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: { antd: '/project/node_modules/antd' },
      rawCode: 'import {Model, Row} from "antd";',
      pathToVersion,
    }),
  ).toEqual(
    // prettier-ignore
    [
        { replaceValue: `mf//project/node_modules/antd/es/model`,       value: '/project/node_modules/antd/es/model',       version: '1.2.3', isMatch: true,},
        { replaceValue: `mf//project/node_modules/antd/es/model/style`, value: '/project/node_modules/antd/es/model/style', version: '1.2.3', isMatch: true,},

        { replaceValue: `mf//project/node_modules/antd/es/row`,         value: '/project/node_modules/antd/es/row',         version: '1.2.3', isMatch: true,},
        { replaceValue: `mf//project/node_modules/antd/es/row/style`,   value: '/project/node_modules/antd/es/row/style',   version: '1.2.3', isMatch: true,},
    ],
  );
});

test('babel-plugin-import: 2 components import', () => {
  expect(
    handleImports({
      imports: [
        // prettier-ignore
        {n: "antd", s: 26, e: 30, ss: 0, se: 31, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: {},
      rawCode: 'import {Model, Row} from "antd";',
      pathToVersion,
    }),
  ).toEqual(
    // prettier-ignore
    [
            {replaceValue: `mf/antd/es/model`,       value: 'antd/es/model',       version: '1.2.3', isMatch: true,},
            {replaceValue: `mf/antd/es/model/style`, value: 'antd/es/model/style', version: '1.2.3', isMatch: true,},
            {replaceValue: `mf/antd/es/row`,         value: 'antd/es/row',         version: '1.2.3', isMatch: true,},
            {replaceValue: `mf/antd/es/row/style`,   value: 'antd/es/row/style',   version: '1.2.3', isMatch: true,},
        ],
  );
});

test('babel-plugin-import: default import', () => {
  expect(
    handleImports({
      imports: [
        // prettier-ignore
        {n: "antd", s: 18, e: 22, ss: 0, se: 23, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: {},
      rawCode: 'import antd from "antd";',
      pathToVersion,
    }),
  ).toEqual(
    // prettier-ignore
    [
            {replaceValue: 'mf/antd/es', value: 'antd/es', version: '1.2.3', isMatch: true,},
            {replaceValue: 'mf/antd/es/style', value: 'antd/es/style', version: '1.2.3', isMatch: true,},
    ],
  );
});

test('babel-plugin-import: namespaces import', () => {
  expect(() =>
    handleImports({
      imports: [
        // prettier-ignore
        {n: "antd", s: 22, e: 26, ss: 0, se: 27, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: {},
      rawCode: 'import * as ant from "antd";',
      pathToVersion,
    }),
  ).toThrow();
});

test('babel-plugin-import: 2 components import', () => {
  expect(
    createImports({
      style: 'css',
      libraryDirectory: 'es',
      libraryName: 'antd',
    })({
      imports: [
        // prettier-ignore
        {n: "antd", s: 26, e: 30, ss: 0, se: 31, d: -1, a: -1},
      ],
      mfName: 'mf',
      alias: {},
      rawCode: 'import {Model, Row} from "antd";',
      pathToVersion,
    }),
  ).toEqual(
    // prettier-ignore
    [
      {replaceValue: `mf/antd/es/model`,           value: 'antd/es/model',           version: '1.2.3', isMatch: true,},
      {replaceValue: `mf/antd/es/model/style/css`, value: 'antd/es/model/style/css', version: '1.2.3', isMatch: true,},
      {replaceValue: `mf/antd/es/row`,             value: 'antd/es/row',             version: '1.2.3', isMatch: true,},
      {replaceValue: `mf/antd/es/row/style/css`,   value: 'antd/es/row/style/css',   version: '1.2.3', isMatch: true,},
    ],
  );
});
