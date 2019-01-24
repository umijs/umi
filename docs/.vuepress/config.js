module.exports = {
  title: 'UmiJS',
  locales: {
    '/': {
      lang: 'en-US',
      description: '🌋 Pluggable enterprise-level react application framework.',
    },
    '/zh/': {
      lang: 'zh-CN',
      description: '🌋 可插拔的企业级 react 应用框架。',
    },
  },
  serviceWorker: {},
  themeConfig: {
    repo: 'umijs/umi',
    lastUpdated: 'Last Updated',
    editLinks: true,
    docsDir: 'docs',
    serviceWorker: {
      updatePopup: {
        message: 'New content is available.',
        buttonText: 'Refresh',
      },
    },
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',
        editLinkText: 'Edit this page on GitHub',
        nav: [
          { text: 'Guide', link: '/guide/' },
          { text: 'Config', link: '/config/' },
          { text: 'API', link: '/api/' },
          { text: 'Plugin', link: '/plugin/' },
          { text: 'v1', link: 'https://v1.umijs.org/' },
          { text: 'Changelog', link: 'https://github.com/umijs/umi/releases' },
        ],
        sidebar: {
          '/guide/': [
            {
              title: 'Guide',
              collapsable: false,
              children: [
                '',
                'getting-started',
                'create-umi-app',
                'examples',
                'app-structure',
                'router',
                'navigate-between-pages',
                'config',
                'html-template',
              ],
            },
            {
              title: 'Advanced',
              collapsable: false,
              children: [
                'mock-data',
                'with-dva',
                'load-on-demand',
                'runtime-config',
                'block',
                'deploy',
              ],
            },
            {
              title: 'Reference',
              collapsable: false,
              children: ['faq', 'migration', 'env-variables'],
            },
          ],
          '/config/': [''],
          '/api/': [''],
          '/plugin/': [
            {
              title: 'Plugin',
              collapsable: false,
              children: [''],
            },
            {
              title: 'Offcial Plugins',
              collapsable: false,
              children: ['umi-plugin-react'],
            },
            {
              title: 'Develop Plugin',
              collapsable: false,
              children: ['develop'],
            },
          ],
        },
      },
      '/zh/': {
        selectText: '选择语言',
        label: '简体中文',
        editLinkText: '在 GitHub 上编辑此页',
        nav: [
          { text: '指南', link: '/zh/guide/' },
          { text: '配置', link: '/zh/config/' },
          { text: 'API', link: '/zh/api/' },
          { text: '插件', link: '/zh/plugin/' },
          { text: 'v1', link: 'https://v1.umijs.org/' },
          { text: '发布日志', link: 'https://github.com/umijs/umi/releases' },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              title: '指南',
              collapsable: false,
              children: [
                '',
                'getting-started',
                'create-umi-app',
                'examples',
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
              children: [
                'mock-data',
                'with-dva',
                'load-on-demand',
                'runtime-config',
                'block',
                'deploy',
              ],
            },
            {
              title: '参考',
              collapsable: false,
              children: ['faq', 'migration', 'env-variables'],
            },
          ],
          '/zh/config/': [''],
          '/zh/api/': [''],
          '/zh/plugin/': [
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
    },
  },
};
