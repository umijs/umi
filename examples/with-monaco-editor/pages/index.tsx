import * as monaco from 'monaco-editor';
import React, { useEffect } from 'react';
export default () => {
  useEffect(() => {
    monaco.editor.create(document.getElementById('root')!, {
      value: `const str:string = 'hello,world';
console.log(str)`,
      language: 'typescript',
    });
  });
  return <div></div>;
};
