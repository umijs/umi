function getMenus(lang?: string) {
  const menus = [
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
        '/docs/routing',
        '/docs/convention-routing',
        // '/docs/plugin',
        // '/docs/navigate-between-pages',
        // '/docs/html-template',
        '/docs/runtime-config',
        '/docs/mock',
        '/docs/env-variables',
      ],
    },
    {
      title: '样式和资源文件',
      'title_zh-CN': '样式和资源文件',
      children: ['/docs/assets-css', '/docs/assets-image'],
    },
    {
      title: 'Umi Advanced',
      'title_zh-CN': 'Umi 进阶',
      children: [],
    },
    {
      title: 'API',
      path: '/docs/api',
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
  ];
  return menus.map(menu => {
    if (!lang) return menu;
    return {
      ...menu,
      title: menu[`title_${lang}`] || menu.title,
    };
  });
}

export default {
  doc: {
    mode: 'site',
    title: 'UmiJS',
    include: ['./docs'],
    previewLangs: [],
    menus: {
      '/zh-CN/docs': getMenus('zh-CN'),
      '/docs': getMenus(),
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
  },
  exportStatic: {},
};
