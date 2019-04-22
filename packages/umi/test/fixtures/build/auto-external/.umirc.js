export default {
  plugins: [
    ['../../../../../umi-plugin-auto-externals/lib/index.js', {
      packages: [ 'react', 'react-dom', 'moment', 'antd' ],
    }],
  ],
}
