
export default {
  ssr: true,
  manifest: {},
  plugins:  [
    ['../../../../../umi-plugin-react/lib/index.js', {
      dva: true,
      title: {
        defaultTitle: 'my ssr app',
      },
    }],
    ['../../../../../umi-plugin-prerender/lib/index.js']
  ]
};
