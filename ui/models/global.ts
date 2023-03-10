import { proxy } from 'umi';

export const state = proxy({
  menus: [
    {
      name: 'Overview',
      path: '/',
      icon: 'fund-projection-screen-outlined',
    },
    {
      name: 'Configuration',
      path: '/config',
      icon: 'control-outlined',
    },
    {
      name: 'Routes',
      path: '/routes',
      icon: 'cluster-outlined',
    },
    {
      name: 'Doctor',
      path: '/doctor',
      icon: 'medicine-box-outlined',
    },
    {
      name: 'Plugins',
      path: '/plugins',
      icon: 'api-outlined',
    },
    {
      name: 'Imports',
      path: '/imports',
      icon: 'right-square-outlined',
    },
  ],
});

export const actions = {};
