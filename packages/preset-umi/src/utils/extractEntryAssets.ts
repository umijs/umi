export type EntryAssets = {
  js: string[];
  css: string[];
  [key: string]: string[];
};

const UMI_ASSETS_REG = {
  js: /(?:^|[/\\])umi(\.[^/\\]+)?\.js$/,
  css: /(?:^|[/\\])umi(\.[^/\\]+)?\.css$/,
};

function isUmiEntryFile(file: string) {
  return (
    !file.includes('.hot-update') &&
    (UMI_ASSETS_REG.js.test(file) || UMI_ASSETS_REG.css.test(file))
  );
}

function getAssetName(asset: any) {
  return typeof asset === 'string' ? asset : asset?.name;
}

export function extractEntryPointFilesFromStats(
  stats: any,
  entryName = 'umi',
): string[] {
  const statsJson = stats?.toJson ? stats.toJson() : stats || {};
  const entrypoint = statsJson.entrypoints?.[entryName];
  const files = new Set<string>();

  for (const asset of entrypoint?.assets || []) {
    const name = getAssetName(asset);
    if (name) {
      files.add(name);
    }
  }

  for (const chunkId of entrypoint?.chunks || []) {
    const chunk = (statsJson.chunks || []).find((item: any) => {
      return item?.id === chunkId || item?.names?.includes?.(chunkId);
    });
    for (const file of chunk?.files || []) {
      if (file) {
        files.add(file);
      }
    }
  }

  return Array.from(files);
}

export function getUmiEntryFilesFromStats(stats: any): string[] {
  const realStats = stats.stats ? stats.stats[0] : stats;
  const compilation = realStats.compilation;
  const entrypoints = compilation?.entrypoints;
  let files: string[];

  if (typeof entrypoints?.get === 'function') {
    const entrypoint = entrypoints.get('umi');
    const entryChunk = entrypoint?.getEntrypointChunk?.();
    if (entryChunk?.files) {
      return Array.from<string>(entryChunk.files).filter(isUmiEntryFile);
    }
    files = entrypoint?.getFiles?.() || [];
  } else {
    const statsJson = entrypoints
      ? compilation
      : realStats.entrypoints
      ? realStats
      : realStats.toJson?.({ all: false, entrypoints: true, chunks: true });
    if (statsJson?.entrypoints) {
      const entrypoint = statsJson.entrypoints.umi;
      if (!entrypoint) return [];
      const entryChunk = (statsJson.chunks || []).find((chunk: any) => {
        return (
          (chunk.id === 'umi' || chunk.names?.includes('umi')) &&
          entrypoint.chunks?.some(
            (id: any) => id === chunk.id || chunk.names?.includes(id),
          )
        );
      });
      if (entryChunk?.files) {
        return Array.from<string>(entryChunk.files).filter(isUmiEntryFile);
      }
      files = extractEntryPointFilesFromStats(statsJson);
    } else {
      files = Object.keys(compilation?.assets || {});
    }
  }

  // Older stats may omit entry chunk metadata. Preserve flat entry names and
  // only infer a nested entry when there is a single candidate per extension.
  return Object.values(UMI_ASSETS_REG).flatMap((regexp) => {
    const candidates = files.filter(
      (file) => isUmiEntryFile(file) && regexp.test(file),
    );
    const flat = candidates.filter((file) => !/[/\\]/.test(file));
    return flat.length ? flat : candidates.length === 1 ? candidates : [];
  });
}

export function extractEntryAssets(
  entryPointFiles: string[],
  umiEntryFiles = entryPointFiles.filter(isUmiEntryFile),
): EntryAssets {
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

  const umiEntryFileSet = new Set(umiEntryFiles);

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
    if (umiEntryFileSet.has(entryPointPublicPath)) {
      return;
    }

    entryPointPublicPathMap[entryPointPublicPath] = true;
    // ext will contain .js or .css, because .mjs recognizes as .js
    const ext = extMatch[1] === 'mjs' ? 'js' : extMatch[1];
    assets[ext].push(entryPointPublicPath);
  });

  return assets;
}

// utoopack only need to deal css chunk file instead of js chunk.
export function extractUtooEntryAssets(entryPointFiles: string[]): EntryAssets {
  const assets: EntryAssets = {
    js: [],
    css: [],
  };

  const UMI_CSS_REG = /^umi(\..+)?\.css$/;
  const cssPublicPathMap: Record<string, boolean> = {};
  const cssExtensionRegexp = /\.(css)(\?|$)/;

  entryPointFiles.forEach((entryPointPublicPath) => {
    if (!cssExtensionRegexp.test(entryPointPublicPath)) {
      return;
    }

    // umi css 在 html 默认注入，不在这里重复处理
    if (UMI_CSS_REG.test(entryPointPublicPath)) {
      return;
    }

    if (cssPublicPathMap[entryPointPublicPath]) {
      return;
    }

    cssPublicPathMap[entryPointPublicPath] = true;
    assets.css.push(entryPointPublicPath);
  });

  return assets;
}
