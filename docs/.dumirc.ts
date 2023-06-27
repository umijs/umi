import { defineConfig } from 'dumi';
import { version } from '../lerna.json';

const OG_HOME = 'https://umijs.org/images/og-home.png';

const UMI_DESCRIPTION =
  'Umi是可扩展的企业级前端应用框架。Umi 以路由为基础的，同时支持配置式路由和约定式路由，保证路由的功能完备，并以此进行功能扩展。然后配以生命周期完善的插件体系，覆盖从源码到构建产物的每个生命周期，支持各种功能扩展和业务需求。';

export default defineConfig({
  outputPath: '../dist',
  metas: [
    { property: 'og:image', content: OG_HOME },
    { property: 'og:url', content: 'https://umijs.org/' },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: 'Umi' },
    { property: 'og:description', content: UMI_DESCRIPTION },
    { property: 'twitter:image', content: OG_HOME },
    { property: 'twitter:site', content: 'https://umijs.org/' },
    { property: 'twitter:creator', content: 'Umi' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:title', content: 'Umi' },
    { property: 'twitter:description', content: UMI_DESCRIPTION },
    { property: 'fb:app_id', content: '922985738798968' },
  ],
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
  theme: {
    '@s-sidebar-width': '216px',
  },
  // ssr: {},
  ...(process.env.NODE_ENV === 'development' ? {} : { ssr: {} }),
  sitemap: { hostname: 'https://umijs.org/' },
});
