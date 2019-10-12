import { routeExists, genBlockName, depthRouterConfig } from './util';

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
  const routes = [
    {
      path: '/',
      component: 'Layout/index',
      indexRoute: {
        redirect: '/project',
      },
      routes: [
        {
          path: '/login',
          component: 'Login/index',
        },
        {
          path: '/project',
          component: 'Project/index',
        },
        {
          path: '/project/new',
          component: 'Project/AddProject',
        },
        {
          path: '/project/:projectId',
          component: 'Project/Layout',
          routes: [
            {
              path: 'edit',
              component: 'Project/EditProject',
            },
            {
              path: 'safeModel',
              indexRoute: {
                redirect: 'virtualDataSet',
              },
              routes: [
                {
                  path: 'virtualDataSet',
                  hasLayout: true,
                  component: 'Project/virtualDataSet/index',
                },
                {
                  path: 'virtualDataSet/new',
                  component: 'Project/virtualDataSet/addVirtualDataSet',
                },
                {
                  path: 'virtualDataSet/:sampleId',
                  component: 'Project/virtualDataSet/detail',
                },
                {
                  path: 'virtualFuse',
                  component: 'Project/virtualDataSet/virtualFuse',
                },
                {
                  path: 'sampleset',
                  hasLayout: true,
                  component: 'Project/securityModels/sampleset/index',
                },
                {
                  path: 'sampleset/:samplesetId',
                  component: 'Project/securityModels/sampleset/DataSetDetail',
                },
                {
                  path: 'sampleset/:samplesetId/filter',
                  component: 'Project/securityModels/sampleset/FilterSetting',
                },
                {
                  path: 'securityModel',
                  hasLayout: true,
                  component: 'Project/securityModels/securityModel/index',
                },
                {
                  path: 'securityModel/new',
                  component: 'Project/securityModels/securityModel/AddModel',
                },
                {
                  path: 'securityModel/:modelId/edit',
                  component: 'Project/securityModels/securityModel/AddModel',
                },
                {
                  path: 'securityModel/:modelId',
                  component: 'Project/securityModels/securityModel/ModelDetail',
                },
              ],
            },
          ],
        },
        {
          path: 'data',
          component: 'Data/index',
        },
        {
          path: 'data/new',
          component: 'Data/AddData',
        },
        {
          path: 'data/:dataId',
          component: 'Data/DataDetail',
        },
        {
          path: 'data/:dataId/edit',
          component: 'Data/EditData',
        },
      ],
    },
  ];
  console.dir(JSON.stringify(depthRouterConfig(routes), null, 2));
});
