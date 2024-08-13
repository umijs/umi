/* eslint-disable @typescript-eslint/no-unused-vars */
const routes = {
    '1': { path: '/', redirect: '/app', id: '1' },
    '2': { path: '/user/login', id: '2' },
    '3': { path: '/app', id: '3' },
    '4': { path: 'a', parentId: '3', id: '4' },
    '5': { path: 'b', parentId: '4', id: '5' },
    '6': { path: 'c', parentId: '3', id: '6' },
    '7': { path: '*', redirect: '/app', id: '7' },
} as const;

type Route = { id?: string; path: string; parentId?: string; isLayout?: boolean };

type JoinPath<TRoutePath extends string, TPath extends string = ''> = TPath extends ''
    ? TRoutePath
    : TRoutePath extends ''
      ? TPath
      : `${TRoutePath}/${TPath extends `/${infer rest}` ? rest : TPath}`;

export type AllPath<
    TOrigin extends Route,
    TRoute extends Route = TOrigin,
    TPath extends string = '',
> = TRoute extends any
    ? Extract<TOrigin, { id: TRoute['id'] }>['isLayout'] extends true
        ? never
        : TRoute['parentId'] extends string
          ? Extract<TOrigin, { id: TRoute['parentId'] }>['isLayout'] extends true
              ? AllPath<TOrigin, { path: '' }, JoinPath<TRoute['path'], TPath>>
              : AllPath<TOrigin, Extract<TOrigin, { id: TRoute['parentId'] }>, JoinPath<TRoute['path'], TPath>>
          : JoinPath<TRoute['path'], TPath>
    : never;

type Routes = typeof routes;

export type Result = AllPath<Routes[keyof Routes]>;
