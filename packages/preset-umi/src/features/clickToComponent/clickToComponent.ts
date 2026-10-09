import { winPath } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'clickToComponent',
    config: {
      schema({ zod }) {
        return zod.object({
          editor: zod
            .string()
            .describe(
              '默认情况下，点击将默认编辑器为vscode, 你可以设置编辑器 vscode 或者 vscode-insiders',
            )
            .optional(),
        });
      },
    },
    enableBy: api.env === 'development' ? api.EnableBy.config : () => false,
  });

  api.modifyConfig((memo) => {
    const pkgPath = dirname(require.resolve('click-to-react-component'));
    memo.alias['click-to-react-component'] = pkgPath;
    return memo;
  });

  api.modifyAppData((memo) => {
    const pkgPath = dirname(require.resolve('click-to-react-component'));
    memo.clickToComponent = {
      pkgPath,
      version: '1.0.8',
    };
    return memo;
  });

  api.onGenerateFiles({
    name: 'clickToComponent',
    fn: () => {
      // Normalize CWD to ensure consistency across platforms
      const CWD = winPath(api.paths.cwd);
      const EDITOR = api.config.clickToComponent.editor || 'vscode';

      api.writeTmpFile({
        path: 'runtime.tsx',
        content: `
import { ClickToComponent } from 'click-to-react-component';
import React from 'react';

// Use JSON.stringify to safely inject values as valid JS string literals
// This prevents Windows backslashes (e.g. C:\\Users) from breaking the string syntax
const CWD = ${JSON.stringify(CWD)};
const EDITOR = ${JSON.stringify(EDITOR)};

const normalize = (p = '') => String(p).replace(/\\\\/g, '/');

const isAbsoluteLike = (p) => {
  // URL / scheme: file://, vscode://, http:// ...
  if (/^[a-zA-Z][a-zA-Z\\d+.-]*:\\/\\//.test(p)) return true;

  // Unix absolute
  if (p.startsWith('/')) return true;

  // Windows drive absolute (after normalize => C:/...)
  if (/^[a-zA-Z]:\\//.test(p)) return true;

  // UNC (after normalize => //server/share)
  if (p.startsWith('//')) return true;

  return false;
};

const pathModifier = (path) => {
  const p = normalize(path);

  if (isAbsoluteLike(p)) return p;

  // avoid double-prefix when upstream already returned cwd-relative normalized path
  if (p.startsWith(CWD)) return p;

  return (CWD + '/' + p).replace(/\\/+/g, '/');
};

export function rootContainer(container, opts) {
  return React.createElement(
    (props) => {
      return (
        <>
          <ClickToComponent
            editor={EDITOR}
            pathModifier={pathModifier}
          />
          {props.children}
        </>
      );
    },
    opts,
    container,
  );
}
        `.trimStart(),
      });
    },
  });

  api.addRuntimePlugin(() => [
    winPath(join(api.paths.absTmpPath, 'plugin-clickToComponent/runtime.tsx')),
  ]);
};
