import fs from 'fs';
import { join } from 'path';
import { IApi } from 'umi';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.alternatives().try(
          Joi.object(),
          Joi.boolean().invalid(true),
        );
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onGenerateFiles(async () => {
    // allow enable access without access file
    const hasAccessFile = ['js', 'jsx', 'ts', 'tsx'].some((ext) =>
      fs.existsSync(join(api.paths.absSrcPath, `access.${ext}`)),
    );

    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';${
        hasAccessFile
          ? `
import accessFactory from '@/access';
import { useModel } from '@@/plugin-model';
`
          : ''
      }
import { AccessContext } from './context';

function Provider(props) {${
        hasAccessFile
          ? `
  const { initialState } = useModel('@@initialState');
  const access = React.useMemo(() => accessFactory(initialState), [initialState]);
`
          : `
  const access = {};
`
      }
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
import React, { PropsWithChildren } from 'react';
import { AccessContext } from './context';
import type { IRoute } from 'umi';

export const useAccess = () => {
  return React.useContext(AccessContext);
};

export interface AccessProps {
  accessible: boolean;
  fallback?: React.ReactNode;
}
export const Access: React.FC<PropsWithChildren<AccessProps>> = (props) => {
  if (process.env.NODE_ENV === 'development' && typeof props.accessible !== 'boolean') {
    throw new Error('[access] the \`accessible\` property on <Access /> should be a boolean');
  }

  return <>{ props.accessible ? props.children : props.fallback }</>;
};

export const useAccessMarkedRoutes = (routes: IRoute[]) => {
  const access = useAccess();
  const markdedRoutes: IRoute[] = React.useMemo(() => {
    const process = (route, parentAccessCode, parentRoute) => {
      let accessCode = route.access;
      // 用父级的路由检测父级的 accessCode
      let detectorRoute = route;
      if (!accessCode && parentAccessCode) {
        accessCode = parentAccessCode;
        detectorRoute = parentRoute;
      }

      // set default status
      route.unaccessible = ${api.config.access.strictMode ? 'true' : 'false'};

      // check access code
      if (typeof accessCode === 'string') {
        const detector = access[accessCode];

        if (typeof detector === 'function') {
          route.unaccessible = !detector(detectorRoute);
        } else if (typeof detector === 'boolean') {
          route.unaccessible = !detector;
        } else if (typeof detector === 'undefined') {
          route.unaccessible = true;
        }
      }

      // check children access code
      if (route.children?.length) {
        const isNoAccessibleChild = !route.children.reduce((hasAccessibleChild, child) => {
          process(child, accessCode, route);

          return hasAccessibleChild || !child.unaccessible;
        }, false);

        // make sure parent route is unaccessible if all children are unaccessible
        if (isNoAccessibleChild) {
          route.unaccessible = true;
        }
      }

      // check children access code
      if (route.routes?.length) {
        const isNoAccessibleChild = !route.routes.reduce((hasAccessibleChild, child) => {
          process(child, accessCode, route);

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
  }, [routes.length, access]);

  return markdedRoutes;
}
      `,
    });

    // context.ts
    api.writeTmpFile({
      path: 'context.ts',
      content: `
import React from 'react';${
        hasAccessFile
          ? `
import { AccessInstance } from './types.d';

export const AccessContext = React.createContext<AccessInstance>(null);
`
          : `
export const AccessContext = React.createContext<any>(null);
`
      }
      `,
    });

    // types.d.ts
    api.writeTmpFile({
      path: 'types.d.ts',
      content: hasAccessFile
        ? `
import accessFactory from '@/access';

export type AccessInstance = ReturnType<typeof accessFactory>;
`
        : 'export {}',
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
