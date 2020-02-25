export default {
  doc: {
    mode: 'site',
    title: 'UmiJS',
    include: ['./docs'],
    previewLangs: [],
    menus: {
      '/zh-CN/docs': [
        {
          title: '介绍',
          children: ['/docs/README', '/docs/getting-started'],
        },
        {
          title: 'umi 基础',
          children: [
            '/docs/directory-structure',
            '/docs/config.zh-CN',
            '/docs/routing',
            '/docs/convention-routing',
            '/docs/plugin',
            '/docs/navigate-between-pages',
            '/docs/html-template',
            '/docs/runtime-config',
            '/docs/mock',
            '/docs/env-variables',
          ],
        },
        {
          title: '样式和资源文件',
          children: ['/docs/assets-css', '/docs/assets-image'],
        },
        {
          title: 'umi 进阶',
          children: [
            '/docs/assets-css',
            '/docs/assets-image',
            '/docs/deployment',
          ],
        },
        {
          title: 'API 索引',
          path: '/docs/api',
        },
        {
          title: '贡献',
          children: ['/docs/contributing'],
        },
        {
          title: 'FAQ',
          path: '/docs/faq',
        },
      ],
      '/docs': [
        {
          title: '介绍',
          children: ['/docs/README', '/docs/getting-started'],
        },
        {
          title: 'umi 基础',
          children: [
            '/docs/directory-structure',
            '/docs/config.md',
            '/docs/routing',
            '/docs/convention-routing',
            '/docs/plugin',
            '/docs/navigate-between-pages',
            '/docs/html-template',
            '/docs/runtime-config',
            '/docs/mock',
            '/docs/env-variables',
          ],
        },
        {
          title: '样式和资源文件',
          children: ['/docs/assets-css', '/docs/assets-image'],
        },
        {
          title: 'umi 进阶',
          children: [
            '/docs/assets-css',
            '/docs/assets-image',
            '/docs/deployment',
          ],
        },
        {
          title: 'API 索引',
          path: '/docs/api',
        },
        {
          title: '贡献',
          children: ['/docs/contributing'],
        },
        {
          title: 'FAQ',
          path: '/docs/faq',
        },
      ],
    },
  },
  exportStatic: {},
};
