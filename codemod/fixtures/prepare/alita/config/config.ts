const isCordova = false;
const outputPath = isCordova ? 'www' : 'dist';
const env = process.env.NODE_ENV;
// 这里需要对应服务器地址
const path = env === 'development' ? 'http://127.0.0.1:8000/' : outputPath;

export default {
  appType: isCordova ? 'cordova' : 'h5',
  mobileLayout: true,
  hash: false,
  outputPath: outputPath,
  publicPath: './',
  keepalive: [/list/],
  packageId: 'com.alita.demos',
  displayName: 'alita-demos',
  // mobile5: true,
  aconsole: {
    inspx: {},
    console: {},
  },
};
