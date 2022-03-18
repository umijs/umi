// @ts-ignore
import UmiLogo from './packages/plugin-docs/client/theme-doc/icons/umi.png';

export default {
  title: 'UmiJS',
  description: '插件化的企业级前端应用框架',
  logo: UmiLogo,
  github: 'https://github.com/umijs/umi',
  i18n: [
    { locale: 'en-US', text: 'English' },
    { locale: 'zh-CN', text: '简体中文' },
  ],
  searchHotKey: {
    macos: '⌘+k',
    windows: 'ctrl+k',
  },
  navs: [
    {
      path: '/docs',
      title: 'Docs',
      type: 'nav',
      children: [
        {
          title: 'Tutorials',
          children: ['tutorials/getting-started', 'tutorials/blog'],
        },
        {
          title: 'API',
          children: [
            'api/api',
            'api/config',
            'api/runtime-config',
            'api/commands',
            'api/plugin-api',
          ],
        },
        {
          title: 'Introduce',
          children: [
            'introduce/introduce',
            'introduce/philosophy',
            'introduce/contributing',
            'introduce/upgrade-to-umi-4',
          ],
        },
        {
          title: 'Guides',
          children: [
            'guides/prepare',
            'guides/directory-structure',
            'guides/routes',
            // 'guides/api-routes',
            'guides/mock',
            'guides/proxy',
            'guides/styling',
            'guides/typescript',
            'guides/deployment',
            'guides/env-variables',
            'guides/errors',
            'guides/mfsu',
            // 'guides/ssr',
            // 'guides/ssg',
            'guides/performance',
            'guides/compile-speed',
            'guides/bundle-mode',
            'guides/boilerplate',
            'guides/generator',
            'guides/lint',
            'guides/test',
            'guides/plugins',
          ],
        },
        {
          title: 'Umi Max',
          children: [
            'max/api',
            'max/config',
            'max/layout-menu',
            'max/antd',
            'max/charts',
            'max/data-flow',
            'max/request',
            'max/access',
            'max/i18n',
            'max/micro-frontend',
            'max/bacon',
          ],
        },
      ],
    },
    {
      path: '/blog',
      title: 'Blog',
      type: 'nav',
      children: [
        {
          title: 'Blog',
          children: [
            'umi-4-rc',
            'mfsu-faster-than-vite',
            'mfsu-independent-usage',
          ],
        },
      ],
    },
  ],
  announcement: {
    title: 'Umi4 即将推出!!!',
    link: 'https://github.com/umijs/umi-next',
  },
};
