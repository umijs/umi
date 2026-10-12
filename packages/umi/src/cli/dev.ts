import type { ChildProcess } from 'child_process';
import fork from './fork';

export function dev() {
  let child: ChildProcess;
  let stopped = false;
  fork({
    scriptPath: require.resolve('../../bin/forkedDev'),
    onChild(nextChild) {
      child = nextChild;
    },
    isStopped: () => stopped,
  });
  // ref:
  // http://nodejs.cn/api/process/signal_events.html
  // https://lisk.io/blog/development/why-we-stopped-using-npm-start-child-processes
  process.on('SIGINT', () => {
    stopped = true;
    child.kill('SIGINT');
    // ref:
    // https://github.com/umijs/umi/issues/6009
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    stopped = true;
    child.kill('SIGTERM');
    process.exit(1);
  });
}
