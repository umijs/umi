import { Readable } from 'stream';
import { matchPath } from '@umijs/runtime';
import { parse, UrlWithStringQuery } from 'url';
import { routeToChunkName } from '@umijs/utils/lib/routes';
import mergeStream from 'merge-stream';
import serialize from 'serialize-javascript';

function addLeadingSlash(path: string): string {
  return path.charAt(0) === "/" ? path : "/" + path;
}

// from react-router
export function stripBasename(basename: string, path: string): UrlWithStringQuery {
  const location = parse(path);
  if (!basename) return location;

  const base = addLeadingSlash(basename);

  if (location?.pathname?.indexOf(base) !== 0) return location;

  return {
    ...location,
    pathname: addLeadingSlash(location.pathname.substr(base.length))
  };
}

export function findRoute(routes: any[], path: string, basename: string = '/'): any {
  const { pathname } = stripBasename(basename, path);
  for (const route of routes) {
    if (route.routes) {
      const routesMatch = findRoute(route.routes, path, basename);
      if (routesMatch) {
        return routesMatch;
      }
    } else if (matchPath(pathname || '', route)) {
      // for get params (/news/1 => { params: { id： 1 } })
      const match = matchPath(pathname || '', route) as any;
      return {
        ...route,
        match,
      };
    }
  }
}

class ReadableString extends Readable {
  str: string
  sent: boolean

  constructor (str: string) {
    super()
    this.str = str
    this.sent = false
  }

  _read () {
    if (!this.sent) {
      this.push(Buffer.from(this.str))
      this.sent = true
    } else {
      this.push(null)
    }
  }
}

// get displayName from Component
export const getComponentDisplayName = (Component: any, defaultName = 'Unknown') => typeof Component === 'string' ? Component : (Component.displayName || Component.name || defaultName)

export { default as cheerio } from '@umijs/utils/lib/cheerio/cheerio'

/**
 * handle html with rootContainer(rendered)
 * @param param
 */
export const handleHTML = async (opts: any) => {
  const { pageInitialProps, appInitialData, rootContainer, mountElementId, mode, forceInitial, routesMatched, dynamicImport, manifest } = opts;
  let html = opts.html;
  // get chunks in `dynamicImport: {}`

  const windowInitialVars = {
    ...(appInitialData && !forceInitial ? { 'window.g_initialData': serialize(appInitialData) } : {}),
    ...(pageInitialProps && !forceInitial ? { 'window.g_initialProps': serialize(pageInitialProps) } : {}),
  }
  if (dynamicImport) {
    const chunks = routesMatched
      .reduce((prev, curr) => {
        const chunk = routeToChunkName({
          route: curr.route,
        })
        return [...(prev || []), chunk];
      }, []);
    if (chunks?.length > 0) {
      // only load css chunks to avoid page flashing
      const cssChunkSet = new Set<string>();
      chunks.forEach(chunk => {
        Object.keys(manifest || {}).forEach(manifestChunk => {
          if (manifestChunk !== 'umi.css'
            && manifestChunk.indexOf(chunk) > -1
            && /\.css$/.test(manifest[manifestChunk])
          ) {
            cssChunkSet.add(`<link rel="stylesheet" href="${manifest[manifestChunk]}" />`)
          }
        })
      });
      // avoid repeat
      html = html.replace('</head>', `${Array.from(cssChunkSet).join('\n')}\n</head>`);
    }
  }
  html = html.replace(
    '</head>',
    `<script>
      window.g_useSSR = true;
      ${Object.keys(windowInitialVars || {}).map(name => `${name} = ${windowInitialVars[name]}`).concat('').join(';\n')}
    </script>
    </head>`
  );

  if (mode === 'stream') {
    const containerString = `<div id="${mountElementId}">`;
    const [beforeRootContainer, afterRootContainer] = html.split(containerString);

    const beforeRootContainerStream = new ReadableString(beforeRootContainer);
    const containerStream = new ReadableString(containerString);
    const afterRootContainerStream = new ReadableString(afterRootContainer);
    const htmlStream = mergeStream(beforeRootContainerStream, containerStream, rootContainer, afterRootContainerStream);
    return htmlStream;
  }
  return html
    .replace(
      `<div id="${mountElementId}"></div>`,
      `<div id="${mountElementId}">${rootContainer}</div>`
    )
}
