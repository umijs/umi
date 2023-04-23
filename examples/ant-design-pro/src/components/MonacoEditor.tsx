// @ts-ignore
import { language as mysqlLanguage } from 'monaco-editor/esm/vs/basic-languages/mysql/mysql';
// @ts-ignore
// import * as monaco from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useRef, useState } from 'react';

console.log('test mysql', mysqlLanguage);

monaco.languages.registerCompletionItemProvider('javascript', {
  provideCompletionItems: (model: any, position): any => {
    console.log('test', 1);
    const textUntilPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });
    let match = textUntilPosition.match(/(\S+)$/);
    console.log('match', match);
    if (!match) return [];
    const suggestions = [
      {
        label: 'BAR',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: 'BARBAR',
      },
    ];
    return {
      suggestions,
    };
  },
});

// @ts-ignore
export default function (props) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>();

  useEffect(() => {
    const { current } = ref;

    if (editor) {
      editor.dispose();
      const model = editor.getModel();
      if (model) {
        model.dispose();
      }
    }

    if (current) {
      const monacoEditor = monaco.editor.create(current, {
        language: 'javascript',
        value: props.value,
      });
      setEditor(monacoEditor);
      return () => {
        if (monacoEditor) {
          monacoEditor.dispose();
          const model = monacoEditor.getModel();
          if (model) {
            model.dispose();
          }
        }
      };
    }

    return () => {};
  }, [props.language]);

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: 480,
        cursor: 'auto',
      }}
    />
  );
}
