import { Readable } from 'stream';
import { IRoute } from '@umijs/types';
import { parse, UrlWithStringQuery } from 'url';
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

export class ReadableString extends Readable {
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

export { default as cheerio } from '@umijs/utils/lib/cheerio/cheerio'

export interface IHandleHTMLOpts {
  pageInitialProps: object;
  rootContainer: string;
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
 * handle html with rootContainer(rendered)
 * @param param
 */
export const handleHTML = async (opts: Partial<IHandleHTMLOpts> = {}) => {
  const { pageInitialProps, rootContainer, mountElementId, mode, forceInitial, removeWindowInitialProps, routesMatched, dynamicImport, manifest } = opts;
  let html = opts.html;
  if (typeof html !== 'string') {
    return '';
  }
  const windowInitialVars = {
    ...(pageInitialProps && !removeWindowInitialProps ? { 'window.g_initialProps': serialize(forceInitial ? null : pageInitialProps) } : {}),
  }
  // get chunks in `dynamicImport: {}`
  if (dynamicImport && Array.isArray(routesMatched)) {
    const chunks: string[] = routesMatched
      .reduce((prev, curr) => {
        const _chunkName = curr.route?._chunkName;
        return [...(prev || []), _chunkName].filter(Boolean);
      }, []);
    if (chunks?.length > 0) {
      // only load css chunks to avoid page flashing
      const cssChunkSet = new Set<string>();
      chunks.forEach(chunk => {
        Object.keys(manifest || {}).forEach(manifestChunk => {
          if (manifestChunk !== 'umi.css'
            && chunk
            && manifestChunk.startsWith(chunk)
            && manifest
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

  const rootHTML = `<div id="${mountElementId}"></div>`;
  const scriptsContent = `\n\t<script>
  window.g_useSSR = true;
  ${Object.keys(windowInitialVars || {}).map(name => `${name} = ${windowInitialVars[name]};`).join('\n')}\n\t</script>`;
  const newRootHTML = `<div id="${mountElementId}">${rootContainer}</div>${scriptsContent}`;

  if (mode === 'stream') {
    const [beforeRootContainer, afterRootContainer] = html.split(rootHTML);
    const streamQueue = [
      beforeRootContainer,
      `<div id="${mountElementId}">`,
      rootContainer,
      `</div>`,
      scriptsContent,
      afterRootContainer,
    ].map(item => typeof item === 'string' ? new ReadableString(item) : item) as Readable[];

    const htmlStream = mergeStream(streamQueue);
    return htmlStream;
  }
  return html
    .replace(
      rootHTML,
      newRootHTML
    )
}
