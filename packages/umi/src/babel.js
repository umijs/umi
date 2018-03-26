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
    ],
  };
}
