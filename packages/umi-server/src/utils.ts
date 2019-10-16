import { join } from 'path';
import ssrPolyfill from 'ssr-polyfill';
import { parse } from 'url';
import { load } from 'cheerio';
import { existsSync } from 'fs';
import { IHandler } from './index';

export const _getDocumentHandler = (html: string, option: object = {}): ReturnType<typeof load> => {
  return load(html, {
    decodeEntities: false,
    recognizeSelfClosing: true,
    ...option,
  });
};

declare var global: {
  [key: string]: any;
};

export const injectChunkMaps: IHandler = (html, args) => {
  const { publicPath, chunkMap, load } = args;
  const { js, css } = chunkMap;
  const $ = load(html);
  // filter umi.css and umi.*.css, htmlMap have includes
  const styles = css.filter(style => !/^umi\.\w+\.css$/g.test(style)) || [];
  styles.forEach(style => {
    $('head').append(`<link rel="stylesheet" href="${publicPath}${style}" />`);
  });
  // filter umi.js and umi.*.js
  const scripts = js.filter(script => !/^umi([.\w]*)?\.js$/g.test(script)) || [];
  scripts.forEach(script => {
    $('head').append(`<link rel="preload" href="${publicPath}${script}" as="script"/>`);
  });

  return $.html();
};

export const patchDoctype = (html: string) => {
  return /^<!DOCTYPE html>/.test(html) ? html : `<!DOCTYPE html>${html}`;
};

export type INodePolyfillDecorator = (
  enable: boolean,
  url?: string,
) => (url?: string, context?: {}) => void;

export const nodePolyfillDecorator: INodePolyfillDecorator = (
  enable = false,
  origin = 'http://localhost',
) => {
  // init
  global.window = {};
  if (enable) {
    const mockWin = ssrPolyfill({
      url: origin,
    });
    const mountGlobal = ['document', 'location', 'navigator', 'Image', 'self'];
    mountGlobal.forEach(mount => {
      global[mount] = mockWin[mount];
    });

    global.window = mockWin;

    // using window.document, window.location to mock document, location
    mountGlobal.forEach(mount => {
      global[mount] = mockWin[mount];
    });

    // if use pathname to mock location.pathname
    return (url, context = {}) => {
      const { pathname, query } = parse(url);
      const urlObj = {
        ...parse(origin),
        pathname,
        query,
      };
      Object.defineProperty(window, 'location', {
        writable: true,
        value: urlObj,
      });
    };
  }
  return () => {
    // noop
  };
};
