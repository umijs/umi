import { defineConfig } from 'dumi';

export default defineConfig({
  favicons: [
    'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  ],
  themeConfig: {
    name: 'UmiJS',
    socialLinks: {
      github: 'https://github.com/umijs/umi',
    },
    footer: '',
    nav: {
      mode: 'override',
      value: [
        {
          title: 'Docs',
          link: '/docs/introduce-introduce',
        },
        {
          title: 'Blog',
          link: '/blog/umi-4-rc',
        },
        {
          link: 'https://v3.umijs.org',
          title: 'v3.x',
        },
      ]
    },
  },
});
