import { nodePolyfill, patchDoctype } from './utils';

export interface IConfig {
  cwd?: string;
  manifest?: string;
  filename?: string;
  /** default false */
  polyfill?: boolean;
  runInMockContext?: {};
  // use renderToStaticMarkup
  staticMarkup?: boolean;
  // htmlSuffix
  htmlSuffix?: boolean;
  // modify render html function
}

export interface IContext {
  req: {
    url: string;
  };
}

const server = (config: IConfig) => {
  const {
    cwd,
    manifest,
    filename = '',
    staticMarkup = false,
    runInMockContext = {},
    polyfill = false,
  } = config;
  nodePolyfill(polyfill)('http://localhost', runInMockContext);
  // eslint-disable-next-line import/no-dynamic-require
  const serverRender = require(filename);
  const { ReactDOMServer } = serverRender;

  return async (ctx: IContext) => {
    const {
      req: { url },
    } = ctx;

    const { htmlElement, rootContainer, matchPath } = await serverRender.default(ctx);
    const ssrHtml = patchDoctype(
      ReactDOMServer[staticMarkup ? 'renderToStaticMarkup' : 'renderToString'](htmlElement),
    );
    // enable render rootContainer
    // const ssrHtmlElement =
    return {
      ssrHtml,
      matchPath,
    };
  };
};

export { server as default };
