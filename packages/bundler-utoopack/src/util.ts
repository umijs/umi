import { chalk } from '@umijs/utils';
import type { WebpackConfig } from '@utoo/pack';

type IDevBannerOpts = {
  duration?: number;
  host?: string;
  ip?: string;
  packVersion?: string;
  port?: number;
  protocol: string;
};

type IBuildBannerOpts = {
  assetCount?: number;
  duration?: number;
  outputPath?: string;
  packVersion?: string;
};

function cleanVersionRange(version?: string) {
  return version?.replace(/^[^\d]*/, '');
}

export function getPackVersion(packVersion?: string) {
  if (packVersion) {
    return packVersion;
  }

  try {
    const pkgPath = require.resolve('@utoo/pack/package.json', {
      paths: [__dirname],
    });
    const pkg = require(pkgPath);
    if (pkg.version) {
      return pkg.version;
    }
  } catch {}

  try {
    const pkg = require('../package.json');
    return cleanVersionRange(pkg.dependencies?.['@utoo/pack']);
  } catch {
    return undefined;
  }
}

function formatDuration(duration?: number) {
  if (typeof duration !== 'number') {
    return undefined;
  }

  return `${Math.max(0, Math.round(duration))}ms`;
}

function normalizeUtoopackFilenameTemplate(filename: string) {
  return filename.replace(
    /\[(?:hash|chunkhash)(?::(\d+))?\]/g,
    (_, length) => `[contenthash${length ? `:${length}` : ''}]`,
  );
}

function getMiniCssExtractPluginOptions(
  webpackConfig: WebpackConfig,
): { filename?: string; chunkFilename?: string } | undefined {
  const plugin = webpackConfig.plugins?.find((p: any) => {
    return (
      p &&
      typeof p === 'object' &&
      p.constructor?.name === 'MiniCssExtractPlugin'
    );
  });

  return (plugin as any)?.options;
}

function getEntryCssFilename(
  entry: Record<string, string>,
  filenameTemplate: string,
  replaceName: boolean,
) {
  const normalizedFilenameTemplate =
    normalizeUtoopackFilenameTemplate(filenameTemplate);

  if (!replaceName) {
    return normalizedFilenameTemplate;
  }

  const entryNames = Object.keys(entry || {});

  if (entryNames.length !== 1) {
    return undefined;
  }

  return normalizedFilenameTemplate.replace(/\[name\]/g, entryNames[0]);
}

export function getCssOutputFilenames(opts: {
  entry: Record<string, string>;
  config: Record<string, any>;
  webpackConfig: WebpackConfig;
  useHash: boolean;
}) {
  const miniCssExtractOptions = getMiniCssExtractPluginOptions(
    opts.webpackConfig,
  );
  const hash = opts.useHash ? '.[contenthash:8]' : '';
  const cssFilenameTemplate =
    typeof miniCssExtractOptions?.filename === 'string'
      ? miniCssExtractOptions.filename
      : `[name]${hash}.css`;
  let cssChunkFilenameTemplate =
    typeof miniCssExtractOptions?.chunkFilename === 'string'
      ? miniCssExtractOptions.chunkFilename
      : undefined;

  if (!cssChunkFilenameTemplate) {
    cssChunkFilenameTemplate = opts.config.ssr
      ? `umi${hash}.css`
      : `[name]${hash}.chunk.css`;
  }

  const cssFilename = getEntryCssFilename(
    opts.entry,
    cssFilenameTemplate,
    !!opts.config.ssr,
  );

  return {
    ...(cssFilename ? { cssFilename } : {}),
    cssChunkFilename: normalizeUtoopackFilenameTemplate(
      cssChunkFilenameTemplate,
    ),
  };
}

export function getSSRCssSplitChunks(config: Record<string, any>) {
  if (!config.ssr) {
    return {};
  }

  return {
    splitChunks: {
      css: {
        minChunkSize: 100_000_000,
        maxChunkCountPerGroup: 1,
        maxMergeChunkSize: 100_000_000,
      },
    },
  };
}

export function getDevBanner({
  protocol,
  host,
  port,
  ip,
  packVersion,
  duration,
}: IDevBannerOpts) {
  const hostStr = !host || host === '0.0.0.0' ? 'localhost' : host;
  const resolvedPackVersion = getPackVersion(packVersion);
  const readyTime = formatDuration(duration);
  const header = [
    chalk.cyan.bold('utoo pack'),
    resolvedPackVersion ? chalk.blueBright(`v${resolvedPackVersion}`) : null,
    chalk.green('ready'),
    readyTime ? chalk.dim(`in ${readyTime}`) : null,
  ]
    .filter(Boolean)
    .join(' ');

  const messages = [
    '',
    `  ${header}`,
    '',
    `  ${chalk.green('➜')}  Local:   ${chalk.cyan(
      `${protocol}//${hostStr}:${port}`,
    )}`,
  ];

  if (ip && ip !== '0.0.0.0' && ip !== hostStr) {
    messages.push(
      `  ${chalk.green('➜')}  Network: ${chalk.cyan(
        `${protocol}//${ip}:${port}`,
      )}`,
    );
  }

  return messages.join('\n');
}

export function getBuildBanner({
  packVersion,
  duration,
  outputPath,
  assetCount,
}: IBuildBannerOpts) {
  const resolvedPackVersion = getPackVersion(packVersion);
  const builtTime = formatDuration(duration);
  const messages = [
    '',
    `  ${[
      chalk.cyan.bold('utoo pack'),
      resolvedPackVersion ? chalk.blueBright(`v${resolvedPackVersion}`) : null,
      chalk.green('built'),
      builtTime ? chalk.dim(`in ${builtTime}`) : null,
    ]
      .filter(Boolean)
      .join(' ')}`,
  ];

  if (outputPath || typeof assetCount === 'number') {
    messages.push('');
  }

  if (outputPath) {
    messages.push(`  ${chalk.green('➜')}  Output:  ${chalk.cyan(outputPath)}`);
  }

  if (typeof assetCount === 'number') {
    messages.push(
      `  ${chalk.green('➜')}  Assets:  ${chalk.cyan(
        `${assetCount} file${assetCount === 1 ? '' : 's'}`,
      )}`,
    );
  }

  return messages.join('\n');
}
