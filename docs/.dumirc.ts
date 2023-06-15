import { defineConfig } from 'dumi';

export default defineConfig({
  resolve: {
    codeBlockMode: 'passive',
  },
  favicons: [
    'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  ],
  themeConfig: {
    name: 'UmiJS',
    socialLinks: {
      github: 'https://github.com/umijs/umi',
    },
    footer: 'Open-source MIT Licensed | Copyright © 2017-present',
    nav: {
      mode: 'override',
      value: [
        {
          title: 'Docs',
          link: '/docs/introduce/introduce',
          children: [
            {
              title: 'Turorials',
              link: '/docs/tutorials/getting-started',
            },
            {
              title: 'Introduce',
              link: '/docs/introduce/introduce',
            },
            {
              title: 'Guides',
              link: '/docs/guides/prepare',
            },
            {
              title: 'API',
              link: '/docs/api/api',
            },
            {
              title: 'Umi Max',
              link: '/docs/max/introduce',
            },
          ],
        },
        {
          title: 'Blog',
          link: '/blog/umi-4-rc',
        },
        {
          link: 'https://v3.umijs.org',
          title: 'v3.x',
        },
      ],
    },
  },
});
