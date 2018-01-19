/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* List of projects/orgs using your project for the users page */
const users = [
  {
    caption: 'Alipay',
    image: 'https://gw.alipayobjects.com/zos/rmsportal/BGcxWbIWmgBlIChNOpqp.png',
    infoLink: 'https://www.alipay.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'UmiJS',
  tagline: 'Blazing-fast next.js-like framework for React apps.',
  url: 'https://umijs.org',
  baseUrl: '/',
  projectName: 'umijs-site',
  headerLinks: [
    {doc: 'getting-started', label: 'Docs'},
    {doc: 'api', label: 'API'},
    // {page: 'help', label: 'He
    // lp'},
    {blog: true, label: 'Blog'},
  ],
  users,
  /* path to images for header/footer */
  headerIcon: 'img/rice.svg',
  footerIcon: 'img/rice.svg',
  favicon: 'img/favicon.png',
  /* colors for website */
  colors: {
    primaryColor: '#1a2b34',
    secondaryColor: '#fbbf47',
  },
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright:
    'Copyright © ' +
    new Date().getFullYear() +
    ' ChenCheng(sorrycc@gmail.com)',
  // organizationName: 'deltice', // or set an env variable ORGANIZATION_NAME
  // projectName: 'test-site', // or set an env variable PROJECT_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },
  scripts: ['https://buttons.github.io/buttons.js'],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/umijs/umi',
};

module.exports = siteConfig;
