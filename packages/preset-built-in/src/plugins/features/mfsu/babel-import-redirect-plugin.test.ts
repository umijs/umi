import { transform } from '@babel/core';
import { IRedirect } from './babel-import-redirect-plugin';

function transformWithPlugin(code: string, opts: IRedirect) {
  const filename = 'file.js';
  return transform(code, {
    filename,
    plugins: [[require.resolve('./babel-import-redirect-plugin.ts'), opts]],
  })!.code;
}

// TODO: 用例不对，待修复
xtest('normal', () => {
  expect(
    transformWithPlugin(
      `import xumi,{Link,Access,ApplyPluginsType} from 'umi'; foo;`,
      {
        umi: {
          Link: 'react-router-dom',
        },
      },
    ),
  ).toEqual(
    `
import xumi, { Access } from "umi";
import { Link } from "react-router-dom";
    `.trim(),
  );
});
