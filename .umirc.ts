// Config for dumi
import { defineConfig } from 'umi';

function getMenus(opts: { lang?: string; base: '/docs' | '/plugins' }) {
  const menus = {
    '/plugins': [
      {
        title: 'Presets',
        children: ['/plugins/preset-react'],
      },
      {
        title: 'Plugins',
        children: [
          '/plugins/plugin-access',
          '/plugins/plugin-analytics',
          '/plugins/plugin-antd',
          '/plugins/plugin-crossorigin',
          '/plugins/plugin-dva',
          '/plugins/plugin-esbuild',
          '/plugins/plugin-helmet',
          '/plugins/plugin-initial-state',
          '/plugins/plugin-layout',
          '/plugins/plugin-locale',
          '/plugins/plugin-model',
          '/plugins/plugin-preact',
          '/plugins/plugin-qiankun',
          '/plugins/plugin-request',
          '/plugins/plugin-sass',
        ],
      },
      {
        title: 'Plugin Develop',
        'title_zh-CN': '插件开发',
        children: ['/plugins/api', '/plugins/best-practice'],
      },
    ],
    '/docs': [
      {
        title: 'VERSION 3.X',
        children: [],
      },
      {
        title: 'Introduce',
        'title_zh-CN': '介绍',
        children: [
          '/docs/README',
          '/docs/how-umi-works',
          '/docs/getting-started',
        ],
      },
      {
        title: 'Umi Basic',
        'title_zh-CN': 'Umi 基础',
        children: [
          '/docs/directory-structure',
          '/docs/config',
          '/docs/runtime-config',
          '/docs/routing',
          '/docs/convention-routing',
          '/docs/plugin',
          '/docs/navigate-between-pages',
          '/docs/html-template',
          '/docs/mock',
          '/docs/env-variables',
          '/docs/cli',
        ],
      },
      {
        title: 'Styles and Assets',
        'title_zh-CN': '样式和资源文件',
        children: ['/docs/assets-css', '/docs/assets-image'],
      },
      {
        title: 'Umi Advanced',
        'title_zh-CN': 'Umi 进阶',
        children: [
          '/docs/load-on-demand',
          '/docs/fast-refresh',
          '/docs/deployment',
          '/docs/use-umi-ui',
          '/docs/ssr',
          '/docs/mfsu',
        ],
      },
      {
        title: 'Upgrade to Umi 3',
        'title_zh-CN': '升级到 Umi 3',
        path: '/docs/upgrade-to-umi-3',
      },
      {
        title: 'CONTRIBUTING',
        'title_zh-CN': '贡献',
        path: '/docs/contributing',
      },
      {
        title: 'FAQ',
        path: '/docs/faq',
      },
    ],
  };
  return (menus[opts.base] as []).map((menu: any) => {
    if (!opts.lang) return menu;
    return {
      ...menu,
      title: menu[`title_${opts.lang}`] || menu.title,
    };
  });
}

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  ssr: {},
  favicon: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  mode: 'site',
  title: 'UmiJS',
  resolve: {
    includes: ['./docs'],
    previewLangs: [],
  },
  menus: {
    '/zh-CN/docs': getMenus({ lang: 'zh-CN', base: '/docs' }),
    '/docs': getMenus({ base: '/docs' }),
    '/zh-CN/plugins': getMenus({ lang: 'zh-CN', base: '/plugins' }),
    '/plugins': getMenus({ base: '/plugins' }),
  },
  navs: [
    null,
    {
      title: 'v2.x',
      path: 'https://v2.umijs.org',
    },
    {
      title: 'GitHub',
      path: 'https://github.com/umijs/umi',
    },
  ],
  polyfill: false,
  nodeModulesTransform: {
    type: 'none',
  },
  exportStatic: {},
  hire: {
    title: '蚂蚁体验技术部正寻觅前端',

    content: `
<p><strong>招聘团队：</strong>蚂蚁体验技术部（玉伯）- 平台前端技术部（偏右）</p>
<p><strong>招聘层级：</strong>P5 ~ P8</p>
<p><strong>\u3000技术栈：</strong>不限</p>
<p><strong>工作城市：</strong>杭州、上海、成都</p>
<p><strong>\u3000内推人：</strong>云谦，微信 sorryccpro</p>
<p><strong>面试效率：</strong>一周面完</p>
<p><strong>团队作品：</strong></p>
<ul style="margin-bottom:8px">
  <li>Ant Design · 西湖区最流行设计语言</li>
  <li>Umi · 企业级前端开发框架</li>
  <li>dumi · React 组件研发工具</li>
  <li>qiankun · 微前端泰斗</li>
  <li>ahooks · React Hooks 库</li>
</ul>
<p style="margin-bottom:16px">有求职意向 or 希望了解蚂蚁情况 or 希望切磋技术 or 职业规划交流的 or 简历评估的，都欢迎加我微信：sorryccpro，备注尊姓大名 + 所在公司 ❤️，或者发简历到邮箱 sorrycc#gmail.com</p>
      `.trim(),
    email: 'sorrycc@gmail.com',
    slogan: '在寻找心仪的工作吗？',
  },
  analytics: isDev
    ? false
    : {
        ga: 'UA-149864185-1',
      },
});
