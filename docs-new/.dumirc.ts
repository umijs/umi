import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    name: 'UmiJS',
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
      ]
    },
  },
});
