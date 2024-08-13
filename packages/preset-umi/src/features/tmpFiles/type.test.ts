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

type Route = { id: string; path: string; parentId?: string };

type JoinPath<T extends Route, TPath extends string = ''> = TPath extends '' ? T['path'] : `${T['path']}/${TPath}`;

export type AllPath<TOrigin extends Route, T extends Route = TOrigin, TPath extends string = ''> = T extends any
    ? T['parentId'] extends string
        ? AllPath<TOrigin, Extract<TOrigin, { id: T['parentId'] }>, JoinPath<T, TPath>>
        : JoinPath<T, TPath>
    : never;

type Routes = typeof routes;

export type Result = AllPath<Routes[keyof Routes]>;
