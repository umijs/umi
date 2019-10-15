import { join } from 'path';
import ssrPolyfill from 'ssr-polyfill';
import { parse, format } from 'url';
import { existsSync } from 'fs';

declare var global: {
  [key: string]: any;
};

export const patchDoctype = (html: string) => {
  return /^<!DOCTYPE html>/.test(html) ? html : `<!DOCTYPE html>${html}`;
};

export const findFile = (baseDir, fileName) => {
  const absFilePath = join(baseDir, fileName);
  if (existsSync(absFilePath)) {
    return absFilePath;
  }
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
