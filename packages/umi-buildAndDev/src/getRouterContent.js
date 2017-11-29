import { readFileSync as readFile, existsSync as exists } from 'fs';
import { join } from 'path';
import normalizeEntry from './normalizeEntry';
import winPath from './winPath';

export default function getRouterContent(opts = {}) {
  const {
    routeConfig,
    tplPath = join(__dirname, `../template/router.js`),
    libraryName = 'umi',
  } = opts;

  if (!exists(tplPath)) {
    throw new Error('tplPath 不存在');
  }
  const tpl = readFile(tplPath, 'utf-8');
  const routeComponents = getRouteComponents(routeConfig);
  return tpl
    .replace(/<%= routeComponents %>/g, routeComponents)
    .replace(/<%= libraryName %>/g, libraryName || 'umi');
}

function getRouteComponents(routeConfig) {
  if (routeConfig['/index.html']) {
    routeConfig['/'] = routeConfig['/index.html'];
  }
  const routerComponents = Object.keys(routeConfig).map(key => {
    const pageJSFile = winPath(join('..', routeConfig[key]));
    if (process.env.NODE_ENV === 'development') {
      return `    <Route exact path="${key}" component={require('${
        pageJSFile
      }').default}></Route>`;
    } else {
      return `    <Route exact path="${
        key
      }" component={dynamic(() => import(/* webpackChunkName: '${normalizeEntry(
        routeConfig[key],
      )}' */'${pageJSFile}'))}></Route>`;
    }
  });

  return `
<Router history={window.koi_history}>
  <Switch>
${routerComponents.join('\n')}
  </Switch>
</Router>
  `.trim();
}
