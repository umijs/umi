import { readFileSync as readFile, existsSync as exists } from 'fs';
import { join } from 'path';
import normalizeEntry from './normalizeEntry';
import winPath from './winPath';
import { getRequest } from './requestCache';

const debug = require('debug')('umi-build-dev:getRouterContent');
const isDev = process.env.NODE_ENV === 'development';

export default function getRouterContent(opts = {}) {
  const {
    routeConfig,
    tplPath = join(__dirname, `../template/router.js`),
    libraryName,
    config,
    paths,
  } = opts;

  if (!exists(tplPath)) {
    throw new Error('tplPath 不存在');
  }
  const tpl = readFile(tplPath, 'utf-8');
  const routeComponents = getRouteComponents(routeConfig, config, paths);
  return tpl
    .replace(/<%= routeComponents %>/g, routeComponents)
    .replace(/<%= libraryName %>/g, libraryName);
}

function getRouteComponents(routeConfig, config = {}, paths) {
  if (routeConfig['/index.html']) {
    routeConfig['/'] = routeConfig['/index.html'];
  }

  const { loading } = config;
  let loadingOpts = '';
  if (loading) {
    loadingOpts = `, loading: require('${join(paths.cwd, loading)}').default,`;
  }

  const routerComponents = Object.keys(routeConfig).map(key => {
    const pageJSFile = winPath(join('..', routeConfig[key]));
    debug(`${JSON.stringify(getRequest())}, key`);
    if (isDev && !process.env.DISABLE_COMPILE_ON_DEMAND) {
      const component = getRequest()[key]
        ? `require('${pageJSFile}').default`
        : '() => <div>Compiling...</div>';
      return `    <Route exact path="${key}" component={${component}}></Route>`;
    } else {
      return `    <Route exact path="${
        key
      }" component={dynamic(() => import(/* webpackChunkName: '${normalizeEntry(
        routeConfig[key],
      )}' */'${pageJSFile}'), { callback: (err) => callback('${key}', err)${
        loadingOpts
      } }) }></Route>`;
    }
  });

  return `
<Router history={window.g_history}>
  <Switch>
${routerComponents.join('\n')}
  </Switch>
</Router>
  `.trim();
}
