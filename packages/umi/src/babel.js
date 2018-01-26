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
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true,
        },
        'antd',
      ],
      [
        require.resolve('babel-plugin-import'),
        {
          libraryName: 'antd-mobile',
          libraryDirectory: 'es',
          style: true,
        },
        'antd-mobile',
      ],
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            fastclick: require.resolve('fastclick'),
            [`${libraryName}/dynamic`]: require.resolve('./dynamic'),
            [`${libraryName}/link`]: require.resolve('./link'),
            [`${libraryName}/router`]: require.resolve('./router'),
            [`${libraryName}/_createHistory`]: require.resolve(
              './createHistory',
            ),
          },
        },
      ],
    ],
  };
}
