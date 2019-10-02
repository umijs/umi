
export default {
  ssr: true,
  plugins: [
    ['../../../../../umi-plugin-react/lib/index.js', {
      dva: true,
      dynamicImport: {
        webpackChunkName: true,
      },
    }],
  ]
}
