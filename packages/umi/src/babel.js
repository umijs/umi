export default function(context, opts = {}) {
  const libraryName = opts.libraryName || 'umi';
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
            [`${libraryName}/dynamic`]: require.resolve('./dynamic'),
            [`${libraryName}/link`]: require.resolve('./link'),
            [`${libraryName}/router`]: require.resolve('./router'),
          },
        },
      ],
    ],
  };
}
