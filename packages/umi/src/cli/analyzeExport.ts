import {
  ANALYZE_REPORT_DIR,
  writeAnalyzeReportJsonl,
} from '@umijs/bundler-utoopack/dist/analyzeReport';
import { logger, yParser } from '@umijs/utils';
import { fork } from 'child_process';
import { once } from 'events';
import { constants } from 'os';
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

export async function analyzeBuildExport(args: Record<string, unknown>) {
  try {
    const reportPath = await captureAnalyzeReport(args);
    if (reportPath) await writeAnalyzeReportJsonl(reportPath, process.stdout);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

async function captureAnalyzeReport(args: Record<string, unknown>) {
  // Keep the worker's logs, including writes to fd 1, out of the JSONL stream.
  const worker = fork(
    require.resolve('./analyzeBuildWorker'),
    process.argv.slice(2),
    {
      stdio: [0, 2, 2, 'ipc'],
    },
  );
  let reportPath: string | undefined;
  worker.on('message', (message: { reportPath?: string }) => {
    if (typeof message?.reportPath === 'string')
      reportPath = message.reportPath;
  });
  const forwardInterrupt = () => worker.kill('SIGINT');
  const forwardTermination = () => worker.kill('SIGTERM');
  process.on('SIGINT', forwardInterrupt);
  process.on('SIGTERM', forwardTermination);

  try {
    const closed = once(worker, 'close');
    worker.send(args);
    const [code, signal] = (await closed) as [
      number | null,
      NodeJS.Signals | null,
    ];
    if (code !== 0) {
      process.exitCode = code ?? (signal ? 128 + constants.signals[signal] : 1);
      return;
    }
    if (!reportPath) {
      throw new Error('Utoopack did not generate a bundle analysis report.');
    }
    return reportPath;
  } finally {
    process.off('SIGINT', forwardInterrupt);
    process.off('SIGTERM', forwardTermination);
    if (worker.exitCode === null && worker.signalCode === null) worker.kill();
  }
}
