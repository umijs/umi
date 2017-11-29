import { sep, join, dirname, extname } from 'path';
import ejs from 'ejs';
import { sync as mkdirp } from 'mkdirp';
import assert from 'assert';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { applyPlugins } from 'umi-plugin';
import normalizeEntry from './normalizeEntry';
import { PAGES_PATH } from './constants';

const debug = require('debug')('umi-buildAndDev:generateHTML');

export default function generateHTML(opts = {}) {
  const {
    routeConfig,
    cwd,
    config,
    chunkToFilesMap,
    plugins,
    staticDirectory,
    libraryName,
  } = opts;
  const routes = Object.keys(routeConfig);
  const pagesConfig = normalizePageConfig(config.pages || {});
  routes.forEach(route => {
    const outputFilePath = join(cwd, 'dist', route.slice(1));
    const content = getHTMLContent({
      route,
      entry: routeConfig[route],
      pagesPath: join(cwd, PAGES_PATH),
      root: cwd,
      pageConfig: pagesConfig && pagesConfig[route],
      chunkToFilesMap,
      plugins,
      staticDirectory,
      libraryName,
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
  } = opts;
  const isDev = process.env.NODE_ENV === 'development';

  // 从模板生成 html
  const { document, context } = pageConfig;
  const tpl = getHTMLTpl(pagesPath, root, document);
  let html = ejs.render(tpl, context, {
    _with: false,
    localsName: 'context',
  });

  // 获取 configScript
  const resourceBaseUrl = `location.origin + window.routerBase + '${
    staticDirectory
  }/'`;
  let configScript = `
<script>
  window.routerBase = location.pathname.split('/').slice(0, -${
    entry.split('/').length
  }).concat('').join('/');
  window.resourceBaseUrl = ${resourceBaseUrl};
</script>
`;
  configScript = applyPlugins(plugins, 'getConfigScript', configScript, {
    entry,
  });

  // 生成 tailBodyReplace
  let relPath = new Array(route.slice(1).split(sep).length).join('../');
  relPath = relPath === '' ? './' : relPath;
  const koiCSSFileName = getFile(chunkToFilesMap, libraryName, '.css');
  const koiJSFileName = getFile(chunkToFilesMap, libraryName, '.js');
  const asyncJSFileName = getFile(
    chunkToFilesMap,
    normalizeEntry(entry),
    '.async.js',
  );
  const koiJSPath = `${relPath}${staticDirectory}/${koiJSFileName}`;
  const koiCSSPath = `${relPath}${staticDirectory}/${koiCSSFileName}`;
  const asyncJSPath = `${relPath}${staticDirectory}/${asyncJSFileName}`;
  let css = '';
  if (
    !isDev &&
    existsSync(join(root, `dist/${staticDirectory}/${koiCSSFileName}`))
  ) {
    css = `
<link rel="stylesheet" href="${koiCSSPath}" />
  `;
  }
  const js = `
<script src="${koiJSPath}"></script>
${isDev ? '' : `<script src="${asyncJSPath}"></script>`}
  `;

  let tailBodyReplace = `
${css.trim()}
${configScript.trim()}
${js.trim()}
</body>`.trim();
  tailBodyReplace = applyPlugins(
    plugins,
    'getTailBodyRepalce',
    tailBodyReplace,
    {
      root,
      outputPath: './dist',
      staticDirectory,
      koiCSSFileName,
      koiJSFileName,
      asyncJSFileName,
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
