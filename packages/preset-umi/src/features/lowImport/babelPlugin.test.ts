import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
  css?: string;
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [
      [
        require.resolve('./babelPlugin.ts'),
        { opts: opts.opts.opts, css: opts.css || 'less' },
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

test('import styles', () => {
  expect(
    doTransform({
      code: `styles.btn`,
      opts: {
        opts: { withObjs: {} },
      },
      filename: 'index.tsx',
    }),
  ).toEqual(`import _styles from "./index.less";\n_styles.btn;`);
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
