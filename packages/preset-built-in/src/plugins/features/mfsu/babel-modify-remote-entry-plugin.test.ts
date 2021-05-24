import { transform } from '@babel/core';
import { Opts } from './babel-modify-remote-entry-plugin';

function transformWithPlugin(code: string, opts: Opts) {
  const filename = 'file.js';
  return transform(code, {
    filename,
    plugins: [[require.resolve('./babel-modify-remote-entry-plugin.ts'), opts]],
  })!.code;
}

xtest('normal', () => {
  expect(
    transformWithPlugin(
      `
    (()=>{
      __webpack_require__.l = ()=>{
          script.src = url;
      }

      const foo = ()=>{
        script.src = url;
      }

      const obj = {};

      obj.fn = ()=>{}
    })();
  `,
      {
        hash: '123',
      },
    ),
  ).toEqual(
    `
    (()=>{
      __webpack_require__.l = ()=>{
          script.src = url + "?hash=123";
      }

      const foo = ()=>{
        script.src = url;
      }

      const obj = {};

      obj.fn = ()=>{}
    })();
    `.trim(),
  );
});
