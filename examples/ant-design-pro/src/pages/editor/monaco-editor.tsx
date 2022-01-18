import * as X from 'monaco-editor';
import React from 'react';
import MonacoEditor from '../../components/MonacoEditor';

export default () => {
  console.log(X);
  return (
    <div>
      <h1>monaco-editor</h1>
      <MonacoEditor
        language="javascript"
        value={`alert(2);

function foo() {}`}
      />
    </div>
  );
};
