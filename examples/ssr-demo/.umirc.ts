export default {
  svgr: {},
  hash: true,
  mfsu: false,
  routePrefetch: {},
  manifest: {},
  clientLoader: {},
  ssr: {
    builder: 'utoopack',
  },
  utoopack: {},
  exportStatic: {},
  styles: [`body { color: red; }`],
  metas: [
    {
      name: 'test',
      content: 'content',
    },
  ],
};
