import { proxy } from 'umi';

interface State {
  menus: Record<string, string>[];
  mode: 'dark' | 'light';
}

export const state: State = proxy({
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
  mode: 'light',
});

export const actions = {
  toggleMode() {
    const mode = state.mode === 'light' ? 'dark' : 'light';
    state.mode = mode;
    // 是否需要 localstorage 保存上次选择 mode
    document.querySelector('html').classList.toggle('dark');
  },
};
