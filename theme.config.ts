// @ts-ignore
import UmiLogo from './packages/plugin-docs/client/theme-doc/icons/umi.png';

export default {
  title: 'UmiJS',
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
          title: 'Umi Pro',
          children: [
            'pro/api',
            'pro/config',
            'pro/layout-menu',
            'pro/antd',
            'pro/charts',
            'pro/data-flow',
            'pro/request',
            'pro/access',
            'pro/i18n',
            'pro/micro-frontend',
            'pro/bacon',
          ],
        },
      ],
    },
    { path: '/blog', title: 'Blog', type: 'nav' },
  ],
};
