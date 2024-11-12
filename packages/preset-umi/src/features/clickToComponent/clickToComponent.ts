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
      api.writeTmpFile({
        path: 'runtime.tsx',
        content: `
import { ClickToComponent } from 'click-to-react-component';
import React from 'react';

const pathModifier = (path) => {
  return path.startsWith('${api.paths.cwd}') ? path : '${
          api.paths.cwd
        }/' + path;
}

export function rootContainer(container, opts) {
  return React.createElement(
    (props) => {
      return (
        <>
          <ClickToComponent editor="${
            api.config.clickToComponent.editor || 'vscode'
          }" pathModifier={pathModifier} />
          {props.children}
        </>
      );
    },
    opts,
    container,
  );
}
    `,
      });
    },
  });

  api.addRuntimePlugin(() => [
    winPath(join(api.paths.absTmpPath, 'plugin-clickToComponent/runtime.tsx')),
  ]);
};
