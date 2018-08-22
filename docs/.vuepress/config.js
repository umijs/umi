module.exports = {
  title: 'UmiJS',
  description: '🐠 可插拔的企业级 react 应用框架。',
  // locales: {
  //   '/': {
  //     lang: 'en-US',
  //     description: 'Blazing-fast next.js-like framework for React apps.',
  //   },
  //   '/zh/': {
  //     lang: 'zh-CN',
  //     description: '极快的类 Next.js 的 React 应用框架。',
  //   },
  // },
  serviceWorker: {},
  themeConfig: {
    repo: 'umijs/umi',
    lastUpdated: 'Last Updated',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    docsDir: 'docs',
    serviceWorker: {
      updatePopup: {
        message: 'New content is available.',
        buttonText: 'Refresh',
      },
    },
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '配置', link: '/config/' },
      { text: 'API', link: '/api/' },
      { text: '插件', link: '/plugin/' },
      { text: 'V1 文档', link: 'https://v1.umijs.org/' },
      { text: '发布日志', link: 'https://github.com/umijs/umi/releases' },
    ],
    sidebar: {
      '/guide/': [
        {
          title: '指南',
          collapsable: false,
          children: [
            '',
            'getting-started',
            'examples-and-boilerplates',
            'app-structure',
            'router',
            'navigate-between-pages',
            'config',
            'html-template',
          ],
        },
        {
          title: '进阶',
          collapsable: false,
          children: ['mock-data', 'with-dva', 'load-on-demand', 'deploy'],
        },
        {
          title: '参考',
          collapsable: false,
          children: ['faq', 'migration', 'env-variables'],
        },
      ],
      '/config/': [''],
      '/api/': [''],
      '/plugin/': [
        {
          title: '插件',
          collapsable: false,
          children: [''],
        },
        {
          title: '官方插件',
          collapsable: false,
          children: ['umi-plugin-react'],
        },
        {
          title: '插件开发',
          collapsable: false,
          children: ['develop'],
        },
      ],
    },
  },
};
