/* eslint-disable import/no-dynamic-require */
import { join } from 'path';
import { load } from 'cheerio';
import compose from './compose';
import { nodePolyfillDecorator, patchDoctype, injectChunkMaps, _getDocumentHandler } from './utils';

interface ICunkMap {
  js: string[];
  css: string[];
}
type IArgs = {
  chunkMap: ICunkMap;
  load: (html: string) => ReturnType<typeof load>;
} & Pick<IConfig, 'publicPath'>;
export type IHandler<T = string> = (html: string, args: IArgs) => T;
export interface IConfig {
  /** prefix path for `filename` and `manifest`, if both in the same directory */
  root: string;
  /** static assets publicPath */
  publicPath: string;
  /** ssr manifest, default: `${root}/ssr-client-mainifest.json` */
  manifest?: string;
  /** umi ssr server file, default: `${root}/umi.server.js` */
  filename?: string;
  /** default false */
  polyfill?: boolean;
  /** use renderToStaticMarkup  */
  staticMarkup?: boolean;
  /** handler function for user to modify render html */
  postProcessHtml?: IHandler;
  /** TODO: serverless */
  serverless?: boolean;
}
export interface IContext {
  req: {
    url: string;
  };
}
export interface IResult {
  ssrHtml: string;
  matchPath: string;
  chunkMap: ICunkMap;
}
type IServer = (config: IConfig) => (ctx: IContext) => Promise<IResult>;

const server: IServer = config => {
  const {
    root,
    manifest = join(root, 'ssr-client-mainifest.json'),
    filename = join(root, 'umi.server'),
    staticMarkup = false,
    polyfill = false,
    postProcessHtml = html => html,
    publicPath = '/',
  } = config;
  const nodePolyfill = nodePolyfillDecorator(!!polyfill, 'http://localhost');
  const serverRender = require(filename);
  const manifestFile = require(manifest);
  const { ReactDOMServer } = serverRender;

  return async ctx => {
    const {
      req: { url },
    } = ctx;
    // polyfill pathname
    nodePolyfill(url);
    const { htmlElement, matchPath } = await serverRender.default(ctx);
    const renderString = ReactDOMServer[staticMarkup ? 'renderToStaticMarkup' : 'renderToString'](
      htmlElement,
    );
    const chunkMap: ICunkMap = manifestFile[matchPath];

    const handlerOpts = {
      publicPath,
      chunkMap,
      load: _getDocumentHandler,
    };
    const composeRender = compose(
      injectChunkMaps,
      patchDoctype,
      // user define handler
      postProcessHtml,
    );
    // compose all html handlers
    const ssrHtml = composeRender(renderString, handlerOpts);

    // enable render rootContainer
    // const ssrHtmlElement =
    return {
      ssrHtml,
      matchPath,
      chunkMap,
    };
  };
};

export default server;
