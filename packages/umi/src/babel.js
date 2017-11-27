export default function(context, opts = {}) {
  const libName = opts.libName || 'umi';
  return {
    presets: [
      [
        require.resolve('babel-preset-umi'),
        {
          ...opts,
          preact: true,
        },
      ],
    ],
    plugins: [
      [
        require.resolve('babel-plugin-import'),
        {
          libraryName: 'antd-mobile',
          libraryDirectory: 'es',
          style: true,
        },
      ],
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            fastclick: require.resolve('fastclick'),
            'umi-router': require.resolve('umi-router'),
            'history/createBrowserHistory': require.resolve(
              'history/createBrowserHistory',
            ),
            [`${libName}/dynamic`]: require.resolve('./dynamic'),
            [`${libName}/link`]: require.resolve('./link'),
            [`${libName}/router`]: require.resolve('./router'),
          },
        },
      ],
    ],
  };
}
