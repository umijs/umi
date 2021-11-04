export default {
  // externals: {
  //   react: 'React',
  //   'react-dom': 'ReactDOM',
  // },
  chainWebpack(memo: any) {
    memo;
  },
  // fastRefresh: false,
  favicon: 'https://sivers.com/favicon.ico',
  headScripts: [`console.log('head script')`],
  scripts: [`console.log('script')`],
  npmClient: 'pnpm',
};
