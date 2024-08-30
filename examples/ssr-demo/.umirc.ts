export default {
  svgr: {},
  hash: true,
  mfsu: false,
  routePrefetch: {},
  manifest: {},
  clientLoader: {},
  // mako: {
  //   plugins: [
  //     {
  //       load: () => {},
  //     },
  //   ],
  // },
  ssr: {
    // builder: 'mako',
  },
  exportStatic: {},
  styles: [`body { color: red; }`],

  metas: [
    {
      name: 'test',
      content: 'content',
    },
  ],
};
