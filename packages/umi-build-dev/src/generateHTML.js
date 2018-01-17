import { sep, join, dirname, extname, basename } from 'path';
import ejs from 'ejs';
import { sync as mkdirp } from 'mkdirp';
import assert from 'assert';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { applyPlugins } from 'umi-plugin';
import normalizeEntry from './normalizeEntry';
import { ROUTE_FILES } from './constants';

const debug = require('debug')('umi-build-dev:generateHTML');

export default function generateHTML(opts = {}) {
  const {
    routeConfig,
    cwd,
    config,
    chunkToFilesMap,
    plugins,
    staticDirectory,
    libraryName,
    paths,
    webpackConfig,
  } = opts;

  const routes = Object.keys(routeConfig);
  const pagesConfig = normalizePageConfig(config.pages || {});
  routes.forEach(route => {
    const outputFilePath = join(paths.absOutputPath, route.slice(1));
    const content = getHTMLContent({
      route,
      entry: routeConfig[route],
      pagesPath: paths.absPagesPath,
      root: cwd,
      pageConfig: pagesConfig && pagesConfig[route],
      chunkToFilesMap,
      plugins,
      staticDirectory,
      libraryName,
      paths,
      config,
      webpackConfig,
    });

    mkdirp(dirname(outputFilePath));
    writeFileSync(outputFilePath, content, 'utf-8');
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
  const tplPath = existsSync(customTplPath) ? customTplPath : defaultTplPath;
  return readFileSync(tplPath, 'utf-8');
}

function getFile(map, name, type) {
  if (!map) {
    return `${name}${type}`;
  }
  const files = map[name];
  assert(files, `name ${name} don't exists in map ${JSON.stringify(map)}`);
  for (const file of files) {
    if (extname(file) === type) {
      return file;
    }
  }
  throw new Error(
    `getFile failed:\nmap: ${JSON.stringify(map)}\nname: ${name}\ntype: ${
      type
    }`,
  );
}

function getJSFiles(opts = {}) {
  const { chunkToFilesMap, libraryName, entry } = opts;
  const files = [getFile(chunkToFilesMap, libraryName, '.js')];
  try {
    files.push(getFile(chunkToFilesMap, `__common-${libraryName}`, '.js'));
  } catch (e) {}
  try {
    files.push(getFile(chunkToFilesMap, normalizeEntry(entry), '.js'));
  } catch (e) {}
  return files;
}

function getCSSFiles(opts = {}) {
  const { chunkToFilesMap, libraryName, entry } = opts;
  const files = [];
  try {
    files.push(getFile(chunkToFilesMap, libraryName, '.css'));
  } catch (e) {}
  try {
    files.push(getFile(chunkToFilesMap, normalizeEntry(entry), '.css'));
  } catch (e) {}
  return files;
}

function getEntry(entry) {
  if (ROUTE_FILES.indexOf(basename(entry)) > -1) {
    return entry
      .split('/')
      .slice(0, -1)
      .join('/');
  } else {
    return entry;
  }
}

function stripFirstSlash(str) {
  return str.replace(/^\//, '');
}

function makeSureHaveLastSlash(str) {
  if (str.slice(-1) === '/') {
    return str;
  } else {
    return `${str}/`;
  }
}

export function getHTMLContent(opts = {}) {
  const {
    route,
    entry,
    pagesPath,
    root,
    pageConfig = {},
    chunkToFilesMap,
    plugins,
    staticDirectory,
    libraryName,
    paths,
    webpackConfig,
  } = opts;
  const isDev = process.env.NODE_ENV === 'development';

  // 从模板生成 html
  const { document, context } = pageConfig;
  const tpl = getHTMLTpl(pagesPath, root, document);
  let html = ejs.render(tpl, context, {
    _with: false,
    localsName: 'context',
  });

  // 生成 tailBodyReplace
  let relPath = new Array(route.slice(1).split(sep).length).join('../');
  relPath = relPath === '' ? './' : relPath;

  // set publicPath
  let publicPath = webpackConfig.output.publicPath;
  publicPath = makeSureHaveLastSlash(publicPath);
  let resourceBaseUrl = `'${publicPath}'`;
  let pathToScript = publicPath;
  if (
    !(
      publicPath.charAt(0) === '/' ||
      publicPath.indexOf('http://') === 0 ||
      publicPath.indexOf('https://') === 0 ||
      /* 变量 */ publicPath === '{{ publicPath }}'
    )
  ) {
    // 相对路径时需和 routerBase 匹配使用，否则子文件夹路由会出错
    resourceBaseUrl = `location.origin + window.routerBase + '${stripFirstSlash(
      publicPath,
    )}'`;
    pathToScript = `${relPath}${publicPath}`;
  }

  // 获取 configScript
  let configScript = `
<script>
  window.routerBase = location.pathname.split('/').slice(0, -${
    getEntry(entry).split('/').length
  }).concat('').join('/');
  window.resourceBaseUrl = ${resourceBaseUrl};
</script>
`;
  configScript = applyPlugins(plugins, 'getConfigScript', configScript, {
    entry,
    staticDirectory,
  });

  function getAssetsPath(file) {
    return `${pathToScript}${stripFirstSlash(file)}`;
  }

  const getFilesOpts = {
    entry,
    libraryName,
    chunkToFilesMap,
  };

  const cssFiles = isDev ? [] : getCSSFiles(getFilesOpts);
  const css = cssFiles
    .map(file => `<link rel="stylesheet" href="${getAssetsPath(file)}" />`)
    .join('\r\n');

  const jsFiles = getJSFiles(getFilesOpts);
  const js = `
<script src="${getAssetsPath(jsFiles[0])}"></script>
${
    isDev
      ? ''
      : jsFiles
          .slice(1)
          .map(script => `<script src="${getAssetsPath(script)}"></script>`)
          .join('\r\n')
  }
  `;

  let tailBodyReplace = `
${css.trim()}
${configScript.trim()}
${js.trim()}

</body>`.trim();
  tailBodyReplace = applyPlugins(
    plugins,
    'getTailBodyReplace',
    tailBodyReplace,
    {
      root,
      outputPath: paths.outputPath,
      staticDirectory,
      cssFiles,
      jsFiles,
      configScript,
    },
  );

  // 替换 </body>
  html = html.replace('</body>', tailBodyReplace);

  // 插件最后处理一遍 HTML
  html = applyPlugins(plugins, 'generateHTML', html, {
    route,
  });

  return `${html}\r\n`;
}
