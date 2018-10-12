export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dynamicImport: true,
        routes: {
          exclude: [/stores\//],
        },
      },
    ],
    [
      'umi-plugin-mobx-state-tree',
      {
        // exclude: [/^\$/] //这里是以$开头的stores不会被引用
      },
    ],
  ],
  history: 'hash',
};
