import type {
  IUtoopackAnalyzeResult,
  IUtoopackAnalyzeServer,
} from '@umijs/bundler-utoopack';
import { checkVersion, logger } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi, webpack } from '../../types';
import {
  EntryAssets,
  extractEntryAssets,
  extractEntryPointFilesFromStats,
  getUmiEntryFilesFromStats,
} from '../../utils/extractEntryAssets';

function cleanVersionRange(version?: string) {
  return version?.replace(/^[^\d]*/, '');
}

export function getPackVersionFromBundler(bundlerEntry: string) {
  const resolvePaths = [dirname(bundlerEntry), bundlerEntry];

  for (const resolvePath of resolvePaths) {
    try {
      const pkgPath = require.resolve('@utoo/pack/package.json', {
        paths: [resolvePath],
      });
      const pkg = require(pkgPath);
      if (pkg.version) {
        return pkg.version;
      }
    } catch {}
  }

  const packageJsonCandidates = [
    join(dirname(bundlerEntry), '../package.json'),
    join(bundlerEntry, '../package.json'),
    join(bundlerEntry, 'package.json'),
  ];

  for (const packageJsonPath of packageJsonCandidates) {
    try {
      const pkg = require(packageJsonPath);
      return cleanVersionRange(pkg.dependencies?.['@utoo/pack']);
    } catch {}
  }

  return undefined;
}

export async function runBundleAnalyze(
  bundler: {
    analyze(opts: Record<string, any>): Promise<IUtoopackAnalyzeResult>;
    serveAnalyzeReport(
      reportPath: string,
      port?: number,
    ): Promise<IUtoopackAnalyzeServer>;
  },
  opts: Record<string, any>,
  logger: typeof import('@umijs/utils').logger,
  wait: () => Promise<never> = () => new Promise<never>(() => {}),
): Promise<void> {
  if (typeof bundler.analyze !== 'function') {
    logger.error(
      'Utoopack analyze requires @umijs/bundler-utoopack with analyze support, please align @umijs/preset-umi and @umijs/bundler-utoopack versions',
    );
    process.exit(1);
    return; // only reachable with a mocked process.exit (tests)
  }

  let server: IUtoopackAnalyzeServer | undefined;
  let outputPath: string | undefined;
  try {
    logger.event('Bundle analyzing...');
    ({ outputPath } = await bundler.analyze(opts));
    logger.event(`Analyzer report written to ${outputPath}`);
    if (!process.stdout.isTTY) {
      logger.ready(
        `Non-interactive terminal detected, skipping Analyzer UI server. Open ${outputPath}/index.html in a browser.`,
      );
      return;
    }
    const port = Number(process.env.ANALYZE_PORT) || 8888;
    server = await bundler.serveAnalyzeReport(outputPath, port);
    logger.ready(`Bundle Analyzer available at ${server.url}`);
    await wait();
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    if (outputPath) {
      logger.error(
        `Analyzer report written to ${outputPath} (open ${outputPath}/index.html directly)`,
      );
      logger.error(
        `Analyzer UI server failed: ${err.message}. A previous Analyzer process may still be running (Ctrl-C it in its terminal), or set ANALYZE_PORT to use another port.`,
      );
    } else {
      logger.error(err);
    }
    await server?.close().catch(() => {});
    process.exit(1);
  }
}

export default (api: IApi) => {
  api.describe({
    key: 'utoopack',
    config: {
      schema({ zod }) {
        return zod.union([
          zod.boolean(),
          zod
            .object({
              root: zod.string(),
              watch: zod
                .object({
                  pollIntervalMs: zod.number(),
                  ignored: zod.array(zod.string()),
                  nodeModulesRegexes: zod.array(zod.string()),
                })
                .partial(),
            })
            .partial(),
        ]);
      },
    },
    enableBy: () =>
      Boolean(api.userConfig.utoopack) || Boolean(process.env.FORCE_UTOOPACK),
  });

  api.onCheck(() => {
    // utoopack 仅支持 node 20+
    checkVersion(20, `Node 20 is required when using utoopack.`);
  });

  // html 处理逻辑
  let assets: EntryAssets = {
    // Will contain all js and mjs files
    js: [],
    // Will contain all css files
    css: [],
  };

  api.modifyAppData((memo) => {
    memo.bundler = 'utoopack';

    return memo;
  });

  api.modifyConfig((memo) => {
    // Only modify config if utoopack is explicitly enabled in userConfig
    if (!api.userConfig.utoopack) {
      return memo;
    }

    return {
      ...memo,
      mfsu: false,
      hmrGuardian: false,
      utoopack: {
        ...memo.utoopack,
      },
    };
  });

  api.onStart(() => {
    const bundlerEntry =
      process.env.UTOOPACK || require.resolve('@umijs/bundler-utoopack');

    process.env.UTOOPACK = bundlerEntry;

    const packVersion = getPackVersionFromBundler(bundlerEntry);
    if (packVersion) {
      process.env.UTOOPACK_VERSION = packVersion;
    } else {
      delete process.env.UTOOPACK_VERSION;
    }
  });

  const updateAssets = ({ stats }: { stats: webpack.StatsCompilation }) => {
    assets = extractEntryAssets(
      extractEntryPointFilesFromStats(stats),
      getUmiEntryFilesFromStats(stats),
    );
  };

  api.onDevCompileDone(updateAssets);
  api.onBuildComplete(({ stats }: { stats: webpack.StatsCompilation }) => {
    const entryAssets = extractEntryAssets(
      extractEntryPointFilesFromStats(stats),
      getUmiEntryFilesFromStats(stats),
    );
    Object.entries(entryAssets).forEach(([ext, files]) => {
      if (!Array.isArray(assets[ext])) {
        assets[ext] = [];
      }
      assets[ext].push(...files);
    });
  });

  api.onBuildHtmlComplete((args) => {
    if (!process.env.ANALYZE) return;
    const bundler = require(process.env.UTOOPACK!);
    return runBundleAnalyze(bundler, args, logger);
  });

  api.addHTMLStyles(() => {
    const { publicPath } = api.config;
    const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;
    return assets.css.map((css) => {
      return { src: `${displayPublicPath}${css}` };
    });
  });

  api.addHTMLHeadScripts(() => {
    const { publicPath } = api.config;
    const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;

    return assets.js.map((js) => {
      return { src: `${displayPublicPath}${js}` };
    });
  });
};
