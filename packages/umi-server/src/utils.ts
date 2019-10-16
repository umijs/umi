import { join } from 'path';
import ssrPolyfill from 'ssr-polyfill';
import { existsSync } from 'fs';

export const patchDoctype = (html: string) => {
  return /^<!DOCTYPE html>/.test(html) ? html : `<!DOCTYPE html>${html}`;
};

export const findFile = (baseDir, fileName) => {
  const absFilePath = join(baseDir, fileName);
  if (existsSync(absFilePath)) {
    return absFilePath;
  }
};

export const nodePolyfill = (enable = false) => (url, context): any => {
  const mountGlobal = ['document', 'location', 'navigator', 'Image', 'self'];
  let params = {};
  if (typeof context === 'object') {
    params = context;
  } else if (typeof context === 'function') {
    params = context();
  }

  const mockWin = ssrPolyfill({
    url,
    ...params,
  });

  if (!enable) {
    (global as any).window = {};
    mountGlobal.forEach(mount => {
      global[mount] = mockWin[mount];
    });
    return (global as any).window;
  }

  // mock first
  (global as any).window = mockWin;

  // mock global
  mountGlobal.forEach(mount => {
    global[mount] = mockWin[mount];
  });

  // merge user global params
  Object.keys(params).forEach(key => {
    // just mount global key (filter mountGlobal)
    // like { USER_BAR: "foo" }
    // => global.USER_BAR = "foo";
    // => global.window.USER_BAR = "foo";
    if (!mountGlobal.includes(key)) {
      global[key] = params[key];
    }
  });

  return mockWin;
};
