import {
  ANALYZE_REPORT_DIR,
  writeAnalyzeReportJsonl,
} from '@umijs/bundler-utoopack/dist/analyzeReport';
import { logger, yParser } from '@umijs/utils';
import { resolve } from 'path';
import { getCwd } from '../service/cwd';

export async function analyzeExport(argv: string[]) {
  const { help, report = ANALYZE_REPORT_DIR } = yParser(argv, {
    alias: { help: ['h'] },
    boolean: ['help'],
    string: ['report'],
  });
  if (help) {
    console.log(
      'Usage: umi analyze export [--report <directory>]\n' +
        `Default report directory: ${ANALYZE_REPORT_DIR}`,
    );
    return;
  }

  try {
    if (typeof report !== 'string' || !report) {
      throw new Error('--report requires a report directory.');
    }
    await writeAnalyzeReportJsonl(resolve(getCwd(), report), process.stdout);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
