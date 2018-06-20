module.exports = {
  title: 'UmiJS',
  description: '🚀 极快的类 Next.js 的 React 应用框架。',
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
  themeConfig: {
    repo: 'umijs/umi',
    lastUpdated: 'Last Updated',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    docsDir: 'docs',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '配置', link: '/config/' },
      { text: 'API', link: '/api/' },
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
            'add-404-page',
            'mock-data',
            'html-template',
            'with-dva',
            'load-on-demand',
            'deploy',
            'env-variables',
            'faq',
          ],
        },
      ],
      '/config/': [''],
      '/api/': [''],
    },
  },
};
