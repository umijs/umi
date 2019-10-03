
export default {
  ssr: true,
  plugins: [
    ['../../../../../umi-plugin-react/lib/index.js', {
      dva: false,
      dynamicImport: {
        webpackChunkName: true,
      },
    }],
  ]
}
