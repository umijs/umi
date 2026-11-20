import { once } from 'events';
import type { Writable } from 'stream';

export const ANALYZE_REPORT_DIR = '.turbopack/analyze';

export async function writeAnalyzeReportJsonl(
  reportPath: string,
  output: Writable,
) {
  const { exportAnalyzeReport } = require('@utoo/pack/analyze');

  for await (const record of exportAnalyzeReport(reportPath)) {
    if (!output.write(JSON.stringify(record) + '\n')) {
      await once(output, 'drain');
    }
  }
}
