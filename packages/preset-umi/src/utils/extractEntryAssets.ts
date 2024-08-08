export type EntryAssets = {
  js: string[];
  css: string[];
  [key: string]: string[];
};

export function extractEntryAssets(entryPointFiles: string[]): EntryAssets {
  const assets: {
    js: string[];
    css: string[];
    [key: string]: string[];
  } = {
    // Will contain all js and mjs files
    js: [],
    // Will contain all css files
    css: [],
  };

  // Extract paths to .js, .mjs and .css files from the current compilation
  const entryPointPublicPathMap: Record<string, boolean> = {};
  const extensionRegexp = /\.(css|js|mjs)(\?|$)/;

  const UMI_ASSETS_REG = {
    js: /^umi(\..+)?\.js$/,
    css: /^umi(\..+)?\.css$/,
  };

  entryPointFiles.forEach((entryPointPublicPath) => {
    const extMatch = extensionRegexp.exec(entryPointPublicPath);
    // Skip if the public path is not a .css, .mjs or .js file
    if (!extMatch) {
      return;
    }

    if (entryPointPublicPath.includes('.hot-update')) {
      return;
    }

    // Skip if this file is already known
    // (e.g. because of common chunk optimizations)
    if (entryPointPublicPathMap[entryPointPublicPath]) {
      return;
    }

    // umi html 默认会注入 不做处理
    if (
      UMI_ASSETS_REG.js.test(entryPointPublicPath) ||
      UMI_ASSETS_REG.css.test(entryPointPublicPath)
    ) {
      return;
    }

    entryPointPublicPathMap[entryPointPublicPath] = true;
    // ext will contain .js or .css, because .mjs recognizes as .js
    const ext = extMatch[1] === 'mjs' ? 'js' : extMatch[1];
    assets[ext].push(entryPointPublicPath);
  });

  return assets;
}
