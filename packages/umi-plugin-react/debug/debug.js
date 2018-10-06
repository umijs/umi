var xxg = require('../lib/index').default;
var path = require('path');

const absSrcPath = path.join(__dirname, '../test');

let wrapperFile;

const api = {
  addRendererWrapperWithComponent(func) {
    wrapperFile = func();
  },
  addPageWatcher() {},
  onOptionChange() {},
  rebuildTmpFiles() {},
  modifyAFWebpackOpts() {},
  paths: {
    absSrcPath,
    absTmpDirPath: absSrcPath,
  },
  config: {
    singular: false,
  },
};

xxg(api, {
  antd: true,
  pwa: false,
  locale: {
    default: 'zh-CN',
    baseNavigator: false,
    localeFolders: true,
  },
});
