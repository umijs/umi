import { once } from 'events';
import type { Writable } from 'stream';

export async function* analyzeReportJsonl(reportPath: string) {
  const { exportAnalyzeReport } = require('@utoo/pack/analyze');

  for await (const record of exportAnalyzeReport(reportPath)) {
    yield JSON.stringify(record) + '\n';
  }
}

export async function writeAnalyzeReportJsonl(
  reportPath: string,
  output: Writable,
) {
  for await (const line of analyzeReportJsonl(reportPath)) {
    if (!output.write(line)) {
      await once(output, 'drain');
    }
  }
}
