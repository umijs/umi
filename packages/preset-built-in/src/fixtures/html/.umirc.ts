import { IConfig } from '@umijs/types';

export default {
  history: { type: 'memory' },
  mountElementId: '',
  routes: [{ path: '/', component: 'index' }],
  links: [
    {
      rel: 'stylesheet',
      type: 'text/css',
      charset: 'utf-8',
      href: '//a.alicdn.com/common.css',
    },
  ],
  metas: [{ name: 'keywords', content: 'umi' }],
  styles: [
    '//g.alicdn.com/antd.css',
    { content: `.a{color: red};` },
    '.b{color: blue};',
  ],
  scripts: [
    '//g.alicdn.com/react.js',
    { content: `console.log(1);` },
    `console.log(2);`,
    { src: '/custom.js', crossOrigin: true },
  ],
  headScripts: ['//g.alicdn.com/ga.js', 'console.log(3)'],
} as IConfig;
