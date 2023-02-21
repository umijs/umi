import { proxy } from 'umi';

export const state = proxy({
  menus: [
    { name: 'Overview', path: '/' },
    { name: 'Configuration', path: '/config' },
    { name: 'Routes', path: '/routes' },
    { name: 'Doctor', path: '/doctor' },
    { name: 'Plugins', path: '/plugins' },
  ],
});

export const actions = {};
