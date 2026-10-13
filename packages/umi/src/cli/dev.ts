import type { ChildProcess } from 'child_process';
import fork from './fork';

export function dev() {
  let child: ChildProcess;
  fork({
    scriptPath: require.resolve('../../bin/forkedDev'),
    // keep a reference to the latest child across restarts
    onChild: (c) => (child = c),
  });
  // ref:
  // http://nodejs.cn/api/process/signal_events.html
  // https://lisk.io/blog/development/why-we-stopped-using-npm-start-child-processes
  process.on('SIGINT', () => {
    child.kill('SIGINT');
    // ref:
    // https://github.com/umijs/umi/issues/6009
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit(1);
  });
}
