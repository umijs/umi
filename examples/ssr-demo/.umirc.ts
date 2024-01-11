export default {
  svgr: {},
  hash: true,
  routePrefetch: {},
  manifest: {},
  clientLoader: {},
  ssr: {
    serverBuildPath: './umi.server.js',
  },
  metas: [{ name: 'keywords', content: 'umi,ssr' }],
  scripts: [{ content: 'console.log("hello")' }],
};
