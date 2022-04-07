import { join } from 'path';
import { IApi } from 'umi';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
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

    // index.tsx
    api.writeTmpFile({
      path: 'index.tsx',
      content: `
import React from 'react';
import { AccessContext } from './context';
import type { IRoute } from 'umi';

export const useAccess = () => {
  return React.useContext(AccessContext);
};

export interface AccessProps {
  accessible: boolean;
  fallback?: React.ReactNode;
}
export const Access: React.FC<AccessProps> = (props) => {
  if (process.env.NODE_ENV === 'development' && typeof props.accessible !== 'boolean') {
    throw new Error('[access] the \`accessible\` property on <Access /> should be a boolean');
  }

  return <>{ props.accessible ? props.children : props.fallback }</>;
};

export const useAccessMarkedRoutes = (routes: IRoute[]) => {
  const access = useAccess();
  const markdedRoutes: IRoute[] = React.useMemo(() => {
    const process = (route, parentAccessCode) => {
      const accessCode = route.access || parentAccessCode;

      // set default status
      route.unaccessible = ${api.config.access.strictMode ? 'true' : 'false'};

      // check access code
      if (typeof accessCode === 'string') {
        const detector = access[route.access];

        if (typeof detector === 'function') {
          route.unaccessible = !detector(route);
        } else if (typeof detector === 'boolean') {
          route.unaccessible = !detector;
        } else if (typeof detector === 'undefined') {
          route.unaccessible = true;
        }
      }

      // check children access code
      if (route.routes) {
        const isNoAccessibleChild = !route.routes.reduce((hasAccessibleChild, child) => {
          process(child, accessCode);

          return hasAccessibleChild || !child.unaccessible;
        }, false);

        // make sure parent route is unaccessible if all children are unaccessible
        if (isNoAccessibleChild) {
          route.unaccessible = true;
        }
      }

      return route;
    }

    return routes.map(route => process(route));
  }, [routes.length]);

  return markdedRoutes;
}
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
