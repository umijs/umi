var devAssetsPrefix = '//private-alipayobjects.alipay.com/alipay-rmsdeploy-image/s_dev/dev';
var prodAssetsPrefix = '//gw.alipayobjects.com/os/s/prod';
var h5ProdAssetsPrefix = '//gw.alipayobjects.com/os/h5/prod';
var versionDevPrefix = '//private-alipayobjects.alipay.com/alipay-rmsdeploy-image/s_dev';
var versionProdPrefix = '//gw.alipayobjects.com/os/h5';

var AppTypesEnum = {
  // local 代表本机启动, 无法通过 url 判断类型;
  LOCAL: 'local',
  SITE: 'site',
  H5: 'h5',
  KOI: 'koi',
  OFFLINE: 'offline',
  TBOFFLINE: 'tbOffline'
};

var EnvEnum = {
  LOCAL: 'local',
  DEV: 'dev',
  TEST: 'test',
  PRE: 'pre',
  PROD: 'prod',
  STABLE: 'stable'
};

function getEnv(hrefStr) {
  var href = hrefStr.split(/\?|#/)[0];

  var envRes = {
    // 默认选 site 应用;
    type: AppTypesEnum.SITE,
    env: EnvEnum.PROD
  };

  // 判断应用类型
  if (href.indexOf('p/h5') > -1) {
    envRes.type = AppTypesEnum.H5;
  } else if (href.indexOf('p/w') > -1) {
    envRes.type = AppTypesEnum.KOI;
  } else if (href.indexOf('h5app.alipay') > -1 || href.indexOf('h5app.test.alipay') > -1 || href.indexOf('h5app.dev.alipay') > -1) {
    envRes.type = AppTypesEnum.OFFLINE;
  } else if (href.indexOf('taobao.com') > -1) {
    envRes.type = AppTypesEnum.TBOFFLINE;
  } else if (href.indexOf('file:///') > -1) {
    envRes.type = AppTypesEnum.LOCAL;
    envRes.env = EnvEnum.LOCAL;
  }

  // 判断环境;
  if (href.indexOf('wapp.waptest.taobao.com') > -1) {
    // 淘宝离线
    envRes.env = EnvEnum.TEST;
  } else if (href.indexOf('h5.m.taobao.com') > -1) {
    // 淘宝离线
    envRes.env = EnvEnum.PROD;
  } else if (href.indexOf('test.h5app.alipay') > -1 || href.indexOf('h5app.test.alipay') > -1) {
    // 判断离线包环境
    envRes.env = EnvEnum.TEST;
  } else if (href.indexOf('h5app.alipay.net') > -1 || href.indexOf('dev.h5app.alipay') > -1 || href.indexOf('h5app.dev.alipay') > -1) {
    envRes.env = EnvEnum.DEV;
  } else if (href.indexOf('.alipay.com') > -1) {
    if (href.indexOf('pre') > -1) {
      envRes.env = EnvEnum.PRE;
    } else {
      envRes.env = EnvEnum.PROD;
    }
  } else if (href.indexOf('local.alipay.net') > -1 || href.indexOf('hpm.taobao.net') > -1 || /\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}/.test(href)) {
    envRes.type = AppTypesEnum.LOCAL;
    envRes.env = EnvEnum.LOCAL;
  } else if (/p\/.*?_test\//.test(href)) {
    envRes.env = EnvEnum.TEST;
  } else if (/p\/.*?_dev\//.test(href)) {
    envRes.env = EnvEnum.DEV;
  } else if (/stable.*?alipay[.]net/.test(href)) {
    envRes.env = EnvEnum.STABLE;
  } else if (href.indexOf('-dev.site.alipay.net') > -1) {
    // 判断自定义域名的 site 应用;
    envRes.env = EnvEnum.DEV;
  } else if (href.indexOf('-pre.site.alipay.net') > -1) {
    envRes.env = EnvEnum.PRE;
  }

  return envRes;
}

function getPublicPath(hrefStr, appName) {
  var version = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var localPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  var envInfo = getEnv(hrefStr);
  var devPublicPath = devAssetsPrefix + '/' + appName + '/';
  var prodPublicPath = prodAssetsPrefix + '/' + appName + '/';
  var veresionDevPublicPath = versionDevPrefix + '/' + appName;
  var veresionProdPublicPath = versionProdPrefix + '/' + appName;
  var h5ProdPublicPath = h5ProdAssetsPrefix + '/' + appName + '/';

  // 离线包统一返回为空, 全是相对路径;
  if (envInfo.type === AppTypesEnum.OFFLINE || envInfo.type === AppTypesEnum.TBOFFLINE) {
    return '';
  }

  if (envInfo.type === AppTypesEnum.H5 || envInfo.type === AppTypesEnum.KOI) {
    // h5的 versionMode 还有特殊处理;
    if (version) {
      if (envInfo.env === EnvEnum.PROD || envInfo.env === EnvEnum.STABLE) {
        return veresionProdPublicPath + '/' + version + '/';
      }
      return veresionDevPublicPath + '/' + version + '/';
    }

    if (envInfo.env === EnvEnum.PROD || envInfo.env === EnvEnum.STABLE || envInfo.env === EnvEnum.PRE) {
      return h5ProdPublicPath;
    }
  }

  // 非 H5 应用的返回
  switch (envInfo.env) {
    case EnvEnum.PROD:
    case EnvEnum.PRE:
      return prodPublicPath;
    case EnvEnum.DEV:
    case EnvEnum.TEST:
    case EnvEnum.STABLE:
      return devPublicPath;
    default:
      // 如果是 local 环境, 默认返回空
      return localPath;
  }
}
