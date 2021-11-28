import { transform } from '@umijs/bundler-utils/compiled/babel/core';

interface IOpts {
  code: string;
  filename?: string;
  opts?: any;
}

function doTransform(opts: IOpts): string {
  return transform(opts.code, {
    filename: opts.filename || 'foo.js',
    plugins: [[require.resolve('./babelPlugin.ts'), opts.opts || {}]],
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
