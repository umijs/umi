import {
  getProdUtooPackConfig,
  getUtoopackRootDir,
  normalizeUtoopackPath,
} from './config';
import type { IOpts } from './types';

// rootDir is omitted on purpose: the bridge always computes it, mirroring
// build(), and ignores whatever the caller passes.
export interface IUtoopackAnalyzeOpts
  extends Omit<IOpts, 'onBuildComplete' | 'watch' | 'cache' | 'rootDir'> {}

export interface IUtoopackAnalyzeResult {
  /** Absolute path of the generated report directory */
  outputPath: string;
}

export interface IUtoopackAnalyzeServer {
  url: string;
  close(): Promise<void>;
}

// Report directory per upstream review: `.turbopack` instead of the
// runtime's default `.utoo`, relative to cwd.
const REPORT_OUTPUT_DIR = '.turbopack/analyze';

const REINSTALL_HINT =
  'Utoopack analyze requires @utoo/pack >= 1.6.0, please reinstall @umijs/bundler-utoopack';

export async function analyze(
  opts: IUtoopackAnalyzeOpts,
): Promise<IUtoopackAnalyzeResult> {
  const { analyze: utooPackAnalyze, findRootDir } = require('@utoo/pack');
  if (typeof utooPackAnalyze !== 'function') {
    throw new Error(REINSTALL_HINT);
  }
  const normalizedCwd = normalizeUtoopackPath(opts.cwd);
  const rootDir = getUtoopackRootDir(
    normalizedCwd,
    opts.config.utoopack,
    findRootDir,
  );
  const utooPackConfig = await getProdUtooPackConfig({
    ...opts,
    cwd: normalizedCwd,
    rootDir,
  });
  // The 4th analyzeOptions parameter pins the report dir to `.turbopack/analyze`;
  // the runtime resolves it against the normalized cwd.
  const result = await utooPackAnalyze(
    utooPackConfig,
    normalizedCwd,
    rootDir,
    { outputPath: REPORT_OUTPUT_DIR },
  );
  return { outputPath: result.outputPath };
}

export async function serveAnalyzeReport(
  reportPath: string,
  port?: number,
): Promise<IUtoopackAnalyzeServer> {
  const {
    serveAnalyzeReport: utooPackServeAnalyzeReport,
  } = require('@utoo/pack');
  if (typeof utooPackServeAnalyzeReport !== 'function') {
    throw new Error(REINSTALL_HINT);
  }
  return utooPackServeAnalyzeReport(reportPath, port);
}
