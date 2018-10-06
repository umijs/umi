var path = require('path');
var fs = require('fs');
var local = require('../lib/index');

var join = path.join;
var readFileSync = fs.readFileSync;
var unlinkSync = fs.unlinkSync;
var localePlugin = local.default;
var getLocaleFileList = local.getLocaleFileList;

const absSrcPath = join(__dirname, '../examples/base/src');

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

const fileList = localePlugin(api, {
  enable: true,
  baseNavigator: false,
  default: 'en-US',
});

const ret = readFileSync(wrapperFile, 'utf-8');
