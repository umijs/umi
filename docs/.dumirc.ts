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
  exportStatic: {
    ignorePreRenderError: true,
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
          activePath: '/docs/introduce',
        },
        {
          title: '指南',
          link: '/docs/guides/getting-started',
          activePath: '/docs/guides',
        },
        {
          title: 'API',
          link: '/docs/api/api',
          activePath: '/docs/api',
        },
        {
          title: 'Umi Max',
          link: '/docs/max/introduce',
          activePath: '/docs/max',
        },
        {
          title: '博客',
          link: '/blog/umi-4-rc',
          activePath: '/blog',
        },
      ],
    },
    sidebar: {
      '/docs/guides': [
        {
          children: [
            {
              title: '快速上手',
              link: '/docs/guides/getting-started',
            },
            {
              title: '开发环境',
              link: '/docs/guides/prepare',
            },
            {
              title: '目录结构',
              link: '/docs/guides/directory-structure',
            },
            {
              title: '路由',
              link: '/docs/guides/routes',
            },
            {
              title: '插件',
              link: '/docs/guides/use-plugins',
            },
            {
              title: 'Mock',
              link: '/docs/guides/mock',
            },
            {
              title: '代理',
              link: '/docs/guides/proxy',
            },
            {
              title: '样式',
              link: '/docs/guides/styling',
            },
            {
              title: '路由数据加载',
              link: '/docs/guides/client-loader',
            },
            {
              title: 'TypeScript',
              link: '/docs/guides/typescript',
            },
            {
              title: '环境变量',
              link: '/docs/guides/env-variables',
            },
            {
              title: '脚手架',
              link: '/docs/guides/boilerplate',
            },
            {
              title: '微生成器',
              link: '/docs/guides/generator',
            },
            {
              title: '编码规范',
              link: '/docs/guides/lint',
            },
            {
              title: '调试',
              link: '/docs/guides/debug',
            },
            {
              title: '测试',
              link: '/docs/guides/test',
            },
            {
              title: '开发插件',
              link: '/docs/guides/plugins',
            },
            {
              title: '使用 Vue',
              link: '/docs/guides/use-vue',
            },
            {
              title: 'MPA 模式',
              link: '/docs/guides/mpa',
            },
            // 暂不开放
            // {
            //   title: 'MFSU',
            //   link: 'docs/guides/mfsu',
            // },
          ],
        },
      ],
      '/docs/max': [
        {
          children: [
            {
              title: 'Umi Max 简介',
              link: '/docs/max/introduce',
            },
            {
              title: '布局与菜单',
              link: '/docs/max/layout-menu',
            },
            {
              title: 'antd',
              link: '/docs/max/antd',
            },
            {
              title: '图表',
              link: '/docs/max/charts',
            },
            {
              title: '数据流',
              link: '/docs/max/data-flow',
            },
            {
              title: '请求',
              link: '/docs/max/request',
            },
            {
              title: '权限',
              link: '/docs/max/access',
            },
            {
              title: '国际化',
              link: '/docs/max/i18n',
            },
            {
              title: '微前端',
              link: '/docs/max/micro-frontend',
            },
            {
              title: 'styled-components',
              link: '/docs/max/styled-components',
            },
            {
              title: 'react-query',
              link: '/docs/max/react-query',
            },
            {
              title: 'valtio',
              link: '/docs/max/valtio',
            },
            {
              title: 'dva',
              link: '/docs/max/dva',
            },
            {
              title: '站点统计',
              link: '/docs/max/analytics',
            },
          ],
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
