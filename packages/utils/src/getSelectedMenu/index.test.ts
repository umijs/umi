import getSelectedMenu from './index';
import transformationRoute from '../transformationRoute';

const routes = [
  {
    path: '/welcome',
    name: 'welcome',
    exact: true,
    unaccessible: false,
  },
  {
    path: '/admin',
    name: 'admin',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        exact: true,
        unaccessible: false,
      },
    ],
  },
  {
    name: 'list.table.result',
    path: '/list/:id',
    exact: true,
    unaccessible: false,
  },
  {
    name: 'list.table-list',
    path: '/list',
    exact: true,
    unaccessible: false,
  },
  { path: '/', redirect: '/welcome', exact: true, unaccessible: false },
];

const { menuData } = transformationRoute(routes, false, ({ id }) => {
  if (id === 'menu.list.table-list') return '查询表格';
  if (id === 'menu.list.table.result') return '数据详情';
  if (id === 'menu.admin') return '管理页';
  if (id === 'menu.admin.sub-page') return '二级管理页';
  if (id === 'menu.welcome') return '欢迎';
  return id;
});

test('normal', () => {
  const openMenuItems = getSelectedMenu('/admin/sub-page', menuData);
  expect(openMenuItems.length).toEqual(2);

  expect(openMenuItems[0].name).toEqual('管理页');
  expect(openMenuItems[1].name).toEqual('二级管理页');
});

test('var path', () => {
  const openMenuItems = getSelectedMenu('/list/1234', menuData);
  expect(openMenuItems.length).toEqual(2);
  expect(openMenuItems[0].name).toEqual('查询表格');
  expect(openMenuItems[1].name).toEqual('数据详情');
});
