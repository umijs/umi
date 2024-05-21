export default {
  svgr: {},
  hash: true,
  mfsu: false,
  routePrefetch: {},
  manifest: {},
  clientLoader: {},
  mako: {},
  title: '测试title',
  scripts: [`https://a.com/b.js`],
  ssr: {
    builder: 'mako',
    renderFromRoot: false,
    __SPECIAL_HTML_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: false,
  },
  // exportStatic: {},
  styles: [`body { color: red; }`, `https://a.com/b.css`],

  metas: [
    {
      name: 'test',
      content: 'content',
    },
  ],
  links: [{ href: '/foo.css', rel: 'preload' }],

  headScripts: [
    {
      src: 'https://www.baidu.com',
    },
  ],
};
