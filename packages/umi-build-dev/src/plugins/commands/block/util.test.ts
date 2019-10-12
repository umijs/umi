import {
  routeExists,
  genBlockName,
  depthRouterConfig,
  genRouterToTreeData,
  reduceData,
} from './util';
import routerConfig from '../../fixtures/util/routerConfig';

test('not exists', () => {
  expect(routeExists('/foo', [{ path: '/bar' }])).toEqual(false);
});

test('exists', () => {
  expect(routeExists('/foo', [{ path: '/bar' }, { path: '/foo' }])).toEqual(true);
});

test('child routes exists', () => {
  expect(routeExists('/foo', [{ routes: [{ path: '/bar' }, { path: '/foo' }] }])).toEqual(true);
});

test('pro routes exists', () => {
  expect(
    routeExists('/welcome', [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/login',
          },
        ],
      },
      {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/',
            component: '../layouts/BasicLayout',
            authority: ['admin', 'user'],
            routes: [
              {
                path: '/',
                redirect: '/welcome',
              },
              {
                path: '/welcome',
                name: 'welcome',
                icon: 'smile',
                component: './Welcome',
              },
              {
                name: 'accountcenter',
                path: '/accountcenter',
                component: './accountcenter',
              },
              {
                component: './404',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
      {
        component: './404',
      },
    ]),
  ).toEqual(true);
});

test('genBlockName test', () => {
  expect(genBlockName('DashboardAnalysis')).toEqual('dashboard/analysis');
});

test('gen router config', () => {
  expect(depthRouterConfig(reduceData(genRouterToTreeData(routerConfig)))).toMatchSnapshot();
});
