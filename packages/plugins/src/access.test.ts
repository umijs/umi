interface IRoute {
  path: string;
  absPath: string;
  file: string;
  id: string;
  parentId?: string;
  [key: string]: any;
}

// mock access
const mockAccess = {
  access: (route: any) => {
    return ['/access'].includes(route.path);
  },
  accessTrue: true,
  accessFalse: false,
  accessFunctionTrue: () => true,
  accessFunctionFalse: () => false,
};
// test routes configuration
const testRoutes: any[] = [
  {
    file: '@/.umi/plugin-layout/Layout.tsx',
    id: 'ant-design-pro-layout',
    isLayout: true,
    path: '/',
    children: [
      {
        id: '1',
        path: '/',
      },
      {
        file: '@/pages/Home/index.tsx',
        id: '2',
        path: '/home',
        name: '首页',
        access: 'accessTrue',
        children: [
          {
            file: '@/pages/Home/index.tsx',
            id: '13',
            path: 'home1',
            name: '首页1',
          },
        ],
      },
      {
        id: '3',
        path: '/access',
        name: '权限演示',
        access: 'access',
        children: [
          {
            file: '@/pages/Home/index.tsx',
            id: '4',
            path: 'home1',
            name: '首页1',
          },
          {
            id: '6',
            path: 'home3',
            name: '首页3',
            children: [
              {
                file: '@/pages/Home/index.tsx',
                id: '7',
                path: 'home1',
                name: '首页1',
              },
            ],
          },
        ],
      },
      {
        id: '9',
        path: 'home9',
        name: '首页9',
        access: 'accessFunctionTrue',
      },
      {
        id: '10',
        path: 'home10',
        name: '首页10',
        access: 'accessFunctionFalse',
      },
      {
        id: '11',
        path: 'home10',
        name: '首页10',
        access: 'accessFalse',
        children: [
          {
            file: '@/pages/Home/index.tsx',
            id: '12',
            path: 'home1',
            name: '首页1',
          },
        ],
      },
    ],
  },
];

// just for test map
const routeMap = {};

// unaccessible marked logic
const useAccessMarkedRoutes = (routes: IRoute[], fixed?: boolean) => {
  const access = mockAccess;
  const markdedRoutes: IRoute[] = (() => {
    const process = fixed
      ? (route: IRoute, parentUnaccessible: boolean) => {
          if (route.access) routeMap[route.access] = route;
          let accessCode = route.access;
          // 用父级的路由检测父级的 accessCode
          let detectorRoute: IRoute | undefined = route;

          // set default status
          route.unaccessible = parentUnaccessible || false;

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
            const isNoAccessibleChild = !route.children.reduce(
              (hasAccessibleChild: boolean, child: IRoute) => {
                (process as any)(child, route.unaccessible);

                return hasAccessibleChild || !child.unaccessible;
              },
              false,
            );

            // make sure parent route is unaccessible if all children are unaccessible
            if (isNoAccessibleChild) {
              route.unaccessible = true;
            }
          }

          return route;
        }
      : (route: IRoute, parentAccessCode?: string, parentRoute?: IRoute) => {
          if (route.access) routeMap[route.access] = route;
          let accessCode = route.access;
          // 用父级的路由检测父级的 accessCode
          let detectorRoute: IRoute | undefined = route;
          if (!accessCode && parentAccessCode) {
            accessCode = parentAccessCode;
            detectorRoute = parentRoute;
          }

          // set default status
          route.unaccessible = false;

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
            const isNoAccessibleChild = !route.children.reduce(
              (hasAccessibleChild: boolean, child: IRoute) => {
                (process as any)(child, accessCode, route);

                return hasAccessibleChild || !child.unaccessible;
              },
              false,
            );

            // make sure parent route is unaccessible if all children are unaccessible
            if (isNoAccessibleChild) {
              route.unaccessible = true;
            }
          }

          return route;
        };

    return routes.map((route) => (process as any)(route));
  })();

  return markdedRoutes;
};

const [newRoute] = useAccessMarkedRoutes(testRoutes, true);
// console.log('newRoute :>> ', JSON.stringify(newRoute, null, 2));

test('accessTrue', () => {
  expect(routeMap['accessTrue'].unaccessible).toEqual(false);
  expect(routeMap['accessTrue'].children[0].unaccessible).toEqual(false);
});
test('accessFunctionTrue', () => {
  expect(routeMap['accessFunctionTrue'].unaccessible).toEqual(false);
});
test('accessFunctionFalse', () => {
  expect(routeMap['accessFunctionFalse'].unaccessible).toEqual(true);
});
test('access false children false', () => {
  expect(routeMap['accessFalse'].unaccessible).toEqual(true);
  expect(routeMap['accessFalse'].children[0].unaccessible).toEqual(true);
});
test('access fuction calc route', () => {
  expect(routeMap['access'].unaccessible).toEqual(false);
  expect(routeMap['access'].children[0].unaccessible).toEqual(false);
  expect(routeMap['access'].children[1].unaccessible).toEqual(false);
  expect(routeMap['access'].children[1].children[0].unaccessible).toEqual(
    false,
  );
});
