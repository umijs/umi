import { defineConfig } from 'dumi';
import { version } from '../lerna.json';

export default defineConfig({
  logo: 'https://gw.alipayobjects.com/zos/bmw-prod/598d14af-4f1c-497d-b579-5ac42cd4dd1f/k7bjua9c_w132_h130.png',
  resolve: {
    codeBlockMode: 'passive',
  },
  favicons: [
    'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  ],
  define: {
    'process.env.UMI_VERSION': version,
  },
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
          title: '介绍',
          link: '/docs/introduce/introduce',
        },
        {
          title: '指南',
          link: '/docs/guides/getting-started',
        },
        {
          title: 'API',
          link: '/docs/api/api',
        },
        {
          title: 'Umi Max',
          link: '/docs/max/introduce',
        },
        {
          title: '博客',
          link: '/blog/umi-4-rc',
        },
      ],
    },
  },
  ...(process.env.NODE_ENV === 'development' ? {} : { ssr: {} }),
  sitemap: { hostname: 'https://umijs.org/' },
});
