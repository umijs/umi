import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
  css?: string;
  umiImportItems?: string[];
  reactImportItems?: string[];
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [
      [
        require.resolve('./babelPlugin.ts'),
        {
          opts: opts.opts?.opts,
          css: opts.css || 'less',
          umiImportItems: opts.umiImportItems,
          reactImportItems: opts.reactImportItems,
        },
      ],
    ],
  })!.code as string;
}

test('import', () => {
  expect(
    doTransform({
      code: `Button;`,
      opts: {
        opts: {
          identifierToLib: { Button: 'antd' },
        },
      },
    }),
  ).toEqual(`import { Button as _Button } from "antd";\n_Button;`);
});

// FIXME: one import for one identifier
test('multiple imports', () => {
  expect(
    doTransform({
      code: `Button;Button;`,
      opts: {
        opts: {
          identifierToLib: { Button: 'antd' },
        },
      },
    }),
  ).toEqual(`import { Button as _Button } from "antd";\n_Button;\n_Button;`);
});

test('import default', () => {
  expect(
    doTransform({
      code: `Foo;`,
      opts: {
        opts: {
          defaultToLib: { Foo: '@/components/Foo' },
        },
      },
    }),
  ).toEqual(`import _Foo from "@/components/Foo";\n_Foo;`);
});

test('multiple import default', () => {
  expect(
    doTransform({
      code: `Foo;Foo;`,
      opts: {
        opts: {
          defaultToLib: { Foo: '@/components/Foo' },
        },
      },
    }),
  ).toEqual(`import _Foo from "@/components/Foo";\n_Foo;\n_Foo;`);
});

test('import namespace', () => {
  expect(
    doTransform({
      code: `antd;`,
      opts: {
        opts: {
          namespaceToLib: { antd: 'antd' },
        },
      },
    }),
  ).toEqual(`import * as _antd from "antd";\n_antd;`);
});

test('multiple import namespace', () => {
  expect(
    doTransform({
      code: `antd;antd;`,
      opts: {
        opts: {
          namespaceToLib: { antd: 'antd' },
        },
      },
    }),
  ).toEqual(`import * as _antd from "antd";\n_antd;\n_antd;`);
});

test('import with objs', () => {
  expect(
    doTransform({
      code: `techui.QrCode;`,
      opts: {
        opts: {
          withObjs: { techui: { importFrom: 'techui', members: ['QrCode'] } },
        },
      },
    }),
  ).toEqual(`import { QrCode as _QrCode } from "techui";\n_QrCode;`);
});

test('multiple import with objs', () => {
  expect(
    doTransform({
      code: `techui.QrCode;techui.QrCode;`,
      opts: {
        opts: {
          withObjs: { techui: { importFrom: 'techui', members: ['QrCode'] } },
        },
      },
    }),
  ).toEqual(`import { QrCode as _QrCode } from "techui";\n_QrCode;\n_QrCode;`);
});

test('import do not support member expression', () => {
  expect(
    doTransform({
      code: `a.Button;`,
      opts: {
        opts: {
          identifierToLib: { Button: 'antd' },
        },
      },
    }),
  ).toEqual(`a.Button;`);
});

test('import do not support object property', () => {
  expect(
    doTransform({
      code: `const a = { Button: 1 };`,
      opts: {
        opts: {
          identifierToLib: { Button: 'antd' },
        },
      },
    }),
  ).toEqual(`const a = {\n  Button: 1\n};`);
});

test('import styles', () => {
  expect(
    doTransform({
      code: `styles.btn;`,
      opts: {
        opts: { withObjs: {} },
      },
      filename: 'index.tsx',
    }),
  ).toEqual(`import _styles from "./index.less";\n_styles.btn;`);
});

test('multiple import styles', () => {
  expect(
    doTransform({
      code: `styles.btn;styles.btn;`,
      opts: {
        opts: { withObjs: {} },
      },
      filename: 'index.tsx',
    }),
  ).toEqual(`import _styles from "./index.less";\n_styles.btn;\n_styles.btn;`);
});

test('import styles css', () => {
  expect(
    doTransform({
      code: `styles.btn`,
      opts: {
        opts: { withObjs: {} },
      },
      filename: 'index.tsx',
      css: 'css',
    }),
  ).toEqual(`import _styles from "./index.css";\n_styles.btn;`);
});

test('import umi', () => {
  expect(
    doTransform({
      code: `Link`,
      opts: {
        opts: {},
      },
      umiImportItems: ['Link'],
    }),
  ).toEqual(`import { Link as _Link } from "umi";\n_Link;`);
});

test('multiple import umi', () => {
  expect(
    doTransform({
      code: `Link;Link;`,
      opts: {
        opts: {},
      },
      umiImportItems: ['Link'],
    }),
  ).toEqual(`import { Link as _Link } from "umi";\n_Link;\n_Link;`);
});

test('import React', () => {
  expect(
    doTransform({
      code: `React;useState();`,
      opts: { opts: {} },
      reactImportItems: ['useState'],
    }),
  ).toEqual(
    `import { useState as _useState } from "react";\nimport _React from "react";\n_React;\n\n_useState();`,
  );
});

test('multiple import React', () => {
  expect(
    doTransform({
      code: `React;useState();React;useState();`,
      opts: { opts: {} },
      reactImportItems: ['useState'],
    }),
  ).toEqual(
    `import { useState as _useState } from "react";\nimport _React from "react";\n_React;\n\n_useState();\n\n_React;\n\n_useState();`,
  );
});
