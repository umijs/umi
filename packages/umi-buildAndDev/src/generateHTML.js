import { sep, join, dirname, extname } from 'path';
import ejs from 'ejs';
import { sync as mkdirp } from 'mkdirp';
import assert from 'assert';
import {
  writeFileSync as writeFile,
  existsSync as exists,
  readFileSync as readFile,
} from 'fs';
import normalizeEntry from './normalizeEntry';
import { PAGES_PATH } from './constants';
import addBaconToHtml from './addBaconToHtml';
import addMetaInfoToHtml from './addMetaInfoToHtml';

const debug = require('debug')('koi-buildAndDev:generateHTML');

export default function generateHTML(
  routeConfig,
  { cwd, config, chunkToFilesMap },
) {
  const routes = Object.keys(routeConfig);
  const pagesConfig = normalizePageConfig(config.pages || {});
  routes.forEach(route => {
    const outputFilePath = join(cwd, 'dist', route.slice(1));
    const content = getHTMLContent(
      route,
      routeConfig[route],
      join(cwd, PAGES_PATH),
      cwd,
      pagesConfig && pagesConfig[route],
      chunkToFilesMap,
    );
    mkdirp(dirname(outputFilePath));
    writeFile(outputFilePath, content, 'utf-8');
  });
}

function normalizePageConfig(config) {
  return Object.keys(config).reduce((m, k) => {
    let newKey = k.replace(/^\.\//, '/');
    if (newKey.charAt(0) !== '/') {
      newKey = `/${newKey}`;
    }
    m[newKey] = config[k];
    return m;
  }, {});
}

function getHTMLTpl(pagesPath, rootPath, document) {
  const customTplPath = document
    ? join(rootPath, document)
    : join(pagesPath, 'document.ejs');
  const defaultTplPath = join(__dirname, '../template/document.ejs');
  const tplPath = exists(customTplPath) ? customTplPath : defaultTplPath;
  return readFile(tplPath, 'utf-8');
}

function getFile(map, name, type) {
  if (!map) {
    return `${name}${type}`;
  }
  const files = map[name];
  assert(files, `name ${name} don't exists in map ${JSON.stringify(map)}`);
  if (files.length === 1) {
    return files[0];
  }
  if (type) {
    for (const file of files) {
      if (extname(file) === type) {
        return file;
      }
    }
  }
  throw new Error(
    `getFile failed:\nmap: ${JSON.stringify(map)}\nname: ${name}\ntype: ${
      type
    }`,
  );
}

export function getHTMLContent(
  route,
  entry,
  pagesPath,
  rootPath,
  pageConfig = {},
  chunkToFilesMap,
) {
  const isRender = process.env.KOI_RENDER === 'true';
  const isTwa = process.env.IS_TWA === 'true';
  const { document, context } = pageConfig;
  const tpl = getHTMLTpl(pagesPath, rootPath, document);
  const html = ejs.render(tpl, context, {
    _with: false,
    localsName: 'koi',
  });

  let resourceBaseUrl = `location.origin + window.routerBase + '.koi/'`;
  if (isRender) {
    resourceBaseUrl = `'{{ publicPath }}'`;
  }

  // twa 模式的 resourceBaseUrl 放在 koi-twa.js 里设置
  let setBase;
  if (isTwa) {
    const pkgPath = join(process.cwd(), 'package.json');
    delete require.cache[require.resolve(pkgPath)];
    const pkg = require(pkgPath); // eslint-disable-line

    const twaRenderPath = readFile(
      join(__dirname, '../template/twaRenderPath.js'),
    );
    setBase = `
<script>
  ${twaRenderPath}

  var pkgName = '${pkg.name}';
  var pkgVersion = "${pkg.version || ''}" || null;

  // 这段后面要改成生成的
  var devDistPath = 'http://127.0.0.1:8001/dist/';
  
  window.routerBase = location.pathname.split('/').slice(0, -${
    entry.split('/').length
  }).concat('www', '').join('/');
  /**
   * 第一个参数是 location.href, 通过 href 自动判断当前是什么应用的什么环境, 会自动过滤 ?|# 后面的参数;
   * 第二个参数是应用名, 用于拼接 publicPath;
   * 第三个参数是版本号, 用于支持 H5 的 versionMode; 没有可以不传;
   * 第四个参数是本地开发的特殊 pubicPath, 比如 site 需要设置成 http://127.0.0.1:8001/dist/
   */
  window.resourceBaseUrl = getPublicPath(location.href, pkgName, pkgVersion, devDistPath) + '.koi/';
</script>    
    `;
  } else {
    setBase = `
<script>
  window.routerBase = location.pathname.split('/').slice(0, -${
    entry.split('/').length
  }).concat('').join('/');
  window.resourceBaseUrl = ${resourceBaseUrl};
</script>
`;
  }

  // TODO: inject CSS and JS with reshape
  let relPath = new Array(route.slice(1).split(sep).length).join('../');
  relPath = relPath === '' ? './' : relPath;

  // 给 render 用的 require 路径强制从根目录开始读
  if (isRender) {
    relPath = '';
  }

  const koiCSSFileName = getFile(chunkToFilesMap, 'koi', '.css');
  const koiJSFileName = getFile(chunkToFilesMap, 'koi', '.js');
  const asyncJSFileName = getFile(
    chunkToFilesMap,
    normalizeEntry(entry),
    '.async.js',
  );
  const koiJSPath = `${relPath}.koi/${koiJSFileName}`;
  const koiCSSPath = `${relPath}.koi/${koiCSSFileName}`;
  const asyncJSPath = `${relPath}.koi/${asyncJSFileName}`;

  const isDev = process.env.NODE_ENV === 'development';

  let css = '';
  if (exists(join(rootPath, `dist/.koi/${koiCSSFileName}`))) {
    css = isRender
      ? `
<link rel="stylesheet" href="{{ publicPath }}${koiCSSFileName}" />
`
      : `
<link rel="stylesheet" href="${koiCSSPath}" />
  `;
  }
  const js = isRender
    ? `
<script src="{{ publicPath }}${koiJSFileName}"></script>
<script src="{{ publicPath }}${asyncJSFileName}"></script>
    `
    : `
<script src="${koiJSPath}"></script>
${isDev ? '' : `<script src="${asyncJSPath}"></script>`}
  `;

  let ret = html.replace(
    '</body>',
    `
${css.trim()}
<script src="https://a.alipayobjects.com/g/h5-lib/alipayjsapi/3.0.6/alipayjsapi.inc.min.js"></script>
${setBase.trim()}
${js.trim()}
</body>
  `.trim(),
  );

  // 添加埋点信息和排查用的元信息
  if (isRender) {
    ret = addBaconToHtml(ret, route.slice(1));
    ret = addMetaInfoToHtml(ret);
  }

  return `${ret}\r\n`;
}
