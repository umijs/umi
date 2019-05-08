
export default {
  plugins: [
    [
      '../../../../../umi-plugin-react/lib/index.js',
      {
        antd: false,
        dva: false,
        dynamicImport: false,
        title: 'umi-examples',
        dll: false,
        routes: {
          exclude: [],
        },
        pwa: {
          // manifestOptions: {
          //   srcPath: join(__dirname, 'pages/manifest.json')
          // },
          // workboxOptions: {
          // }
        },
      },
    ],
  ],
};
