import { winPath } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'clickToComponent',
    config: {
      schema(joi) {
        return joi.object({
          editor: joi.string(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  const pkgPath = dirname(require.resolve('click-to-react-component'));
  api.modifyConfig((memo) => {
    memo.alias['click-to-react-component'] = pkgPath;
    return memo;
  });

  api.modifyAppData((memo) => {
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
export function rootContainer(container, opts) {
return React.createElement(
  (props) => {
    return (
      <>
        <ClickToComponent editor="${
          api.config.clickToComponent.editor || 'vscode'
        }"/>
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
