export default {
  svgr: {},
  hash: true,
  mfsu: false,
  routePrefetch: {},
  manifest: {},
  clientLoader: {},
  mako: {},
  ssr: {
    builder: 'mako',
  },
  exportStatic: {},
  styles: [`body { color: red; }`],

  metas: [
    {
      name: 'test',
      content: 'content',
    },
  ],
  links: [{ href: '/foo.css', rel: 'preload' }],
};
