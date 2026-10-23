import fork from './fork';

export function dev() {
  const devProcess = fork({
    scriptPath: require.resolve('../../bin/forkedDev'),
  });
  let exiting = false;
  // wait for the current worker to exit so it does not outlive the parent
  const onSignal = (signal: NodeJS.Signals, exitCode: number) => {
    if (exiting) return;
    exiting = true;
    devProcess
      .stop(signal)
      .then(() => process.exit(devProcess.child.exitCode || exitCode));
  };
  // ref:
  // http://nodejs.cn/api/process/signal_events.html
  // https://lisk.io/blog/development/why-we-stopped-using-npm-start-child-processes
  // https://github.com/umijs/umi/issues/6009
  process.on('SIGINT', () => onSignal('SIGINT', 0));
  process.on('SIGTERM', () => onSignal('SIGTERM', 1));
}
