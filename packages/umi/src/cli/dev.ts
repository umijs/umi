import { logger } from '@umijs/utils';
import { createDevProcess } from './fork';

export function dev() {
  const devProcess = createDevProcess({
    scriptPath: require.resolve('../../bin/forkedDev'),
  });
  // ref:
  // http://nodejs.cn/api/process/signal_events.html
  // https://lisk.io/blog/development/why-we-stopped-using-npm-start-child-processes
  let exiting = false;
  function onSignal(signal: NodeJS.Signals, exitCode: number) {
    if (exiting) return;
    exiting = true;
    void devProcess
      .stop(signal)
      .catch((error) => logger.error(error))
      .then(() => process.exit(exitCode));
  }
  // Preserve the existing signal exit codes (see umi/issues/6009).
  process.on('SIGINT', () => onSignal('SIGINT', 0));
  process.on('SIGTERM', () => onSignal('SIGTERM', 1));
}
