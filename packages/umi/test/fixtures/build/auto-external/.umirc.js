export default {
  plugins: [
    [
      '../../../../../umi-plugin-react/lib/index.js',
      {
        antd: true,
      },
    ],
    [
      '../../../../../umi-plugin-auto-externals/lib/index.js',
      {
        packages: ['antd'],
      },
    ],
  ],
};
