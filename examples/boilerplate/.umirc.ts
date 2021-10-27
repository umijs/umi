export default {
  // externals: {
  //   react: 'React',
  //   'react-dom': 'ReactDOM',
  // },
  chainWebpack(memo: any) {
    memo;
  },
  plugins: [require.resolve('./plugin.ts')],
};
