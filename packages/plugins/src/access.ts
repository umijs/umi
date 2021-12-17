import { join } from 'path';
import { IApi } from 'umi';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  // TODO: route access
  api.describe({
    config: {
      schema(joi) {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(async () => {
    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';
import accessFactory from '@/access';
import { useModel } from '@@/plugin-model';
import { AccessContext } from './context';

function Provider(props) {
  const { initialState } = useModel('@@initialState');
  const access = React.useMemo(() => accessFactory(initialState), [initialState]);
  return (
    <AccessContext.Provider value={access}>
      { props.children }
    </AccessContext.Provider>
  );
}

export function accessProvider(container) {
  return <Provider>{ container }</Provider>;
}
      `,
    });

    // index.ts
    api.writeTmpFile({
      path: 'index.ts',
      content: `
import React from 'react';
import { AccessContext } from './context';

export const useAccess = () => {
  return React.useContext(AccessContext);
};
      `,
    });

    // context.ts
    api.writeTmpFile({
      path: 'context.ts',
      content: `
import React from 'react';
export const AccessContext = React.createContext<any>(null);
      `,
    });
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  api.addTmpGenerateWatcherPaths(() => [
    join(api.paths.absSrcPath, 'access.ts'),
    join(api.paths.absSrcPath, 'access.js'),
  ]);
};
