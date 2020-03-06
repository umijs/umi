function getMenus(opts: { lang?: string; base: '/docs'| '/plugins' }) {
  const menus = {
    '/plugins': [
      {
        title: 'Presets',
        children: ['/plugins/preset-react'],
      },
      {
        title: 'Plugins',
        children: [
          '/plugins/plugin-access',
          '/plugins/plugin-analytics',
          '/plugins/plugin-antd',
          '/plugins/plugin-crossorigin',
          '/plugins/plugin-dva',
          '/plugins/plugin-initial-state',
          '/plugins/plugin-layout',
          '/plugins/plugin-locale',
          '/plugins/plugin-model',
          '/plugins/plugin-qiankun',
          '/plugins/plugin-request',
          '/plugins/plugin-webpack-5',
        ],
      },
      {
        title: 'Plugin Develop',
        'title_zh-CN': '插件开发',
        children: ['/plugins/api', '/plugins/test'],
      },
    ],
    '/docs': [
      {
        title: 'VERSION 3.X',
        children: [],
      },
      {
        title: 'Introduce',
        'title_zh-CN': '介绍',
        children: [
          '/docs/README',
          '/docs/how-umi-works',
          '/docs/getting-started',
        ],
      },
      {
        title: 'Umi Basic',
        'title_zh-CN': 'Umi 基础',
        children: [
          '/docs/directory-structure',
          '/docs/config',
          '/docs/runtime-config',
          '/docs/routing',
          '/docs/convention-routing',
          '/docs/plugin',
          // '/docs/navigate-between-pages',
          '/docs/html-template',
          '/docs/mock',
          '/docs/env-variables',
        ],
      },
      {
        title: 'Styles and Assets',
        'title_zh-CN': '样式和资源文件',
        children: ['/docs/assets-css', '/docs/assets-image'],
      },
      {
        title: 'Umi Advanced',
        'title_zh-CN': 'Umi 进阶',
        children: ['/docs/load-on-demand', '/docs/deployment', '/docs/ssr'],
      },
      {
        title: 'Upgrade to Umi 3',
        'title_zh-CN': '升级到 Umi 3',
        path: '/docs/upgrade-to-umi-3',
      },
      {
        title: 'CONTRIBUTING',
        'title_zh-CN': '贡献',
        path: '/docs/contributing',
      },
      {
        title: 'FAQ',
        path: '/docs/faq',
      },
    ],
  };
  return (menus[opts.base] as []).map((menu: any) => {
    if (!opts.lang) return menu;
    return {
      ...menu,
      title: menu[`title_${opts.lang}`] || menu.title,
    };
  });
}

export default {
  favicon: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  mode: 'site',
  title: 'UmiJS',
  resolve: {
    includes: ['./docs'],
    previewLangs: [],
  },
  menus: {
    '/zh-CN/docs': getMenus({ lang: 'zh-CN', base: '/docs' }),
    '/docs': getMenus({ base: '/docs' }),
    '/zh-CN/plugins': getMenus({ lang: 'zh-CN', base: '/plugins' }),
    '/plugins': getMenus({ base: '/plugins' }),
  },
  navs: [
    null,
    {
      title: 'v2.x',
      path: 'https://v2.umijs.org',
    },
    {
      title: 'GitHub',
      path: 'https://github.com/umijs/umi',
    },
  ],
  exportStatic: {},
  analytics: {
    ga: 'UA-149864185-1',
  },
};
