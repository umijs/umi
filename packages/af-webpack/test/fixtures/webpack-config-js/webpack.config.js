
export default function (webpackConfig, { webpack }) {
  webpackConfig.plugins.push(new webpack.DefinePlugin({
    'ABC': JSON.stringify('cde')
  }));
  return webpackConfig;
};
