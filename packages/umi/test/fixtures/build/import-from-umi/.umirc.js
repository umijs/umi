
export default {
  plugins: [
    ['../../../../../umi-plugin-react/lib/index.js', {
      dva: true,
    }],
    ['./plugin/index.js'],
  ]
}
