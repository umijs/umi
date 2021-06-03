import { transform } from '@babel/core';

function transformWithPlugin(code: string) {
  const filename = 'file.js';
  return transform(code, {
    filename,
    plugins: [[require.resolve('./babel-antd-icon-plugin.ts')]],
  })!.code;
}

test('normal', () => {
  expect(
    transformWithPlugin(
      `
import X from '@ant-design/icons/es/aaa/bbb/DownOutline';
import {Smile} from '@ant-design/icons';
import SmileOutlined from '@ant-design/icons/SmileOutlined';
import CrownOutlined from '@ant-design/icons/CrownOutlined';
import TableOutlined from '@ant-design/icons/es/icons/TableOutlined';
import {AAAA} from 'ddddd';foo;
      `,
    ),
  ).toEqual(
    `
import { DownOutline } from "@ant-design/icons";
import { Smile } from '@ant-design/icons';
import { SmileOutlined } from "@ant-design/icons";
import { CrownOutlined } from "@ant-design/icons";
import { TableOutlined } from "@ant-design/icons";
import { AAAA } from 'ddddd';
foo;
    `.trim(),
  );
});
