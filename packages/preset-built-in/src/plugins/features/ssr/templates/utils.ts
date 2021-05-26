import { Readable } from 'stream';
import { EOL } from 'os';
import { IRoute } from '@umijs/types';
import { parse, UrlWithStringQuery } from 'url';
import mergeStream from '@umijs/deps/compiled/merge-stream';
import serialize from '@umijs/deps/compiled/serialize-javascript';
import { WRAPPERS_CHUNK_NAME } from '../constants';

function addLeadingSlash(path: string): string {
  return path.charAt(0) === '/' ? path : '/' + path;
}

// from react-router
export function stripBasename(
  basename: string,
  path: string,
): UrlWithStringQuery {
  const location = parse(path);
  if (!basename) return location;

  const base = addLeadingSlash(basename);

  if (location?.pathname?.indexOf(base) !== 0) return location;

  return {
    ...location,
    pathname: addLeadingSlash(location.pathname.substr(base.length)),
  };
}

export class ReadableString extends Readable {
  str: string;
  sent: boolean;

  constructor(str: string) {
    super();
    this.str = str;
    this.sent = false;
  }

  _read() {
    if (!this.sent) {
      this.push(Buffer.from(this.str));
      this.sent = true;
    } else {
      this.push(null);
    }
  }
}

export { default as cheerio } from '@umijs/utils/lib/cheerio/cheerio';

export interface IHandleHTMLOpts {
  pageInitialProps: object;
  rootContainer: string | NodeJS.ReadableStream;
  mountElementId: string;
  mode: 'stream' | 'string';
  forceInitial: boolean;
  removeWindowInitialProps: boolean;
  routesMatched: IRoute[];
  html: string;
  dynamicImport: boolean;
  manifest: object;
}

/**
 * get page chunks with routes
 *
 * @param routeMatched
 */
const getPageChunks = (
  routeMatched: IHandleHTMLOpts['routesMatched'],
): string[] => {
  const chunks: string[] = [];
  const recursive = (routes: any[]) => {
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      if (route?._chunkName && chunks.indexOf(route._chunkName) < 0) {
        chunks.push(route._chunkName);
      }
      if (
        Array.isArray(route?.wrappers) &&
        route?.wrappers.length > 0 &&
        chunks.indexOf(WRAPPERS_CHUNK_NAME) < 0
      ) {
        chunks.push(WRAPPERS_CHUNK_NAME);
      }
    }
  };
  recursive(routeMatched);
  return chunks;
};

/**
 * handle html with rootContainer(rendered)
 * @param param
 */
export const handleHTML = async (opts: Partial<IHandleHTMLOpts> = {}): Promise<string | NodeJS.ReadableStream> => {
  const {
    pageInitialProps,
    rootContainer,
    mountElementId,
    mode,
    forceInitial,
    removeWindowInitialProps,
    routesMatched,
    dynamicImport,
    manifest,
  } = opts;
  let html = opts.html;
  if (typeof html !== 'string') {
    return '';
  }
  const windowInitialVars = {
    ...(pageInitialProps && !removeWindowInitialProps
      ? {
          'window.g_initialProps': serialize(
            forceInitial ? null : pageInitialProps,
          ),
        }
      : {}),
  };
  // get chunks in `dynamicImport: {}`
  if (dynamicImport && Array.isArray(routesMatched)) {
    const chunks: string[] = getPageChunks(
      routesMatched.map((routeMatched) => routeMatched?.route),
    );
    // @ts-ignore
    const assets = manifest?._chunksMap;
    if (chunks?.length > 0) {
      // only load css chunks to avoid page flashing
      const cssChunkSet: string[] = [];
      chunks.forEach((chunk) => {
        if(!assets || !Array.isArray(assets[chunk])) return;

        assets[chunk].forEach((resource: string) => {
          if (/\.css$/.test(resource)) cssChunkSet.push(`<link rel="preload" href="${resource}" as="style" /><link rel="stylesheet" href="${resource}" />`);
        })
      });
      // avoid repeat
      html = html.replace('</head>', `${cssChunkSet.join(EOL)}${EOL}</head>`);
    }
  }

  const rootHTML = `<div id="${mountElementId}"></div>`;
  const scriptsContent = `\n\t<script>
  window.g_useSSR = true;
  ${Object.keys(windowInitialVars)
    .map((name) => `${name} = ${windowInitialVars[name]};`)
    .join('\n')}\n\t</script>`;

  if (mode === 'stream') {
    const [beforeRootContainer, afterRootContainer] = html.split(rootHTML);
    const streamQueue = [
      beforeRootContainer,
      `<div id="${mountElementId}">`,
      rootContainer,
      `</div>`,
      scriptsContent,
      afterRootContainer,
    ].map((item) =>
      typeof item === 'string' ? new ReadableString(item) : item,
    ) as Readable[];

    const htmlStream = mergeStream(streamQueue);
    return htmlStream;
  }

  // https://github.com/umijs/umi/issues/5840
  const newRootHTML = `<div id="${mountElementId}">${rootContainer}</div>${scriptsContent}`.replace(
    /\$/g,
    '$$$',
  );
  return html.replace(rootHTML, newRootHTML);
};
