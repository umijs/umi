export default {
  svgr: {},
  hash: true,
  mfsu: false,
  routePrefetch: {},
  manifest: {},
  clientLoader: {},
  title: '测试title',
  scripts: [`https://a.com/b.js`],
  ssr: {
    builder: 'webpack',
    hydrateRoot: 'html',
  },
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
