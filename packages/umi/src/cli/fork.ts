import { logger, portfinder } from '@umijs/utils';
import type { ChildProcess } from 'child_process';
import { fork } from 'child_process';

const usedPorts: number[] = [];

interface IOpts {
  scriptPath: string;
  onChild?: (child: ChildProcess) => void;
}

export default function start(opts: IOpts) {
  return createDevProcess(opts).child;
}

export function createDevProcess({ scriptPath, onChild }: IOpts) {
  let stopping = false;
  let restarting = false;
  let stopPromise: Promise<void> | undefined;
  let cancelPortWait: (() => void) | undefined;
  const exits = new WeakMap<ChildProcess, Promise<void>>();
  let child = forkChild();

  function forkChild() {
    const worker = fork(scriptPath, process.argv.slice(2), {
      execArgv: getExecArgv(),
    });
    onChild?.(worker);
    worker.on('message', (data: any) => {
      const { type, payload } = data || {};
      if (type === 'RESTART' && worker === child && !stopping && !restarting) {
        restarting = true;
        void restart(worker, payload?.port).catch((error) => {
          logger.error(error);
        });
      }
      process.send?.(data);
    });
    return worker;
  }

  function terminate(worker: ChildProcess, signal: NodeJS.Signals) {
    let exit = exits.get(worker);
    if (!exit) {
      exit = terminateChild(worker, signal);
      exits.set(worker, exit);
    }
    return exit;
  }

  async function restart(worker: ChildProcess, port?: number) {
    try {
      await terminate(worker, 'SIGTERM');
      if (stopping) return;
      if (port) {
        await waitForPort(port);
        if (stopping) return;
        process.env.PORT = String(port);
      }
      child = forkChild();
    } finally {
      restarting = false;
    }
  }

  function waitForPort(port: number) {
    return new Promise<void>((resolve) => {
      let finished = false;
      let timer: NodeJS.Timeout | undefined;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        cancelPortWait = undefined;
        resolve();
      };
      cancelPortWait = finish;
      const check = (totalTry: number) => {
        portfinder.getPort({ port }, (err, findPort) => {
          if (finished) return;
          // Preserve the existing fallback when probing fails or times out.
          if (err || findPort === port || totalTry === 0) {
            finish();
          } else {
            timer = setTimeout(() => check(totalTry - 1), 100);
          }
        });
      };
      check(20);
    });
  }

  return {
    get child() {
      return child;
    },
    stop(signal: NodeJS.Signals = 'SIGTERM') {
      if (!stopPromise) {
        stopping = true;
        cancelPortWait?.();
        stopPromise = terminate(child, signal);
      }
      return stopPromise;
    },
  };
}

function terminateChild(child: ChildProcess, signal: NodeJS.Signals) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      child.removeListener('exit', onExit);
      child.removeListener('error', onError);
    };
    const onExit = () => {
      cleanup();
      resolve();
    };
    const onError = (error: unknown) => {
      cleanup();
      reject(error);
    };
    // Register before signalling: kill() only confirms delivery, not exit.
    child.once('exit', onExit);
    child.once('error', onError);
    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch (error) {
        onError(error);
      }
    }, 5000);
    try {
      child.kill(signal);
    } catch (error) {
      onError(error);
    }
  });
}

function getExecArgv() {
  const execArgv = process.execArgv.slice(0);
  const inspectArgvIndex = execArgv.findIndex((argv) =>
    argv.includes('--inspect-brk'),
  );

  if (inspectArgvIndex > -1) {
    const inspectArgv = execArgv[inspectArgvIndex];
    execArgv.splice(
      inspectArgvIndex,
      1,
      inspectArgv.replace(/--inspect-brk=(.*)/, (_match, s1) => {
        let port;
        try {
          port = parseInt(s1) + 1;
        } catch (e) {
          port = 9230; // node default inspect port plus 1.
        }
        if (usedPorts.includes(port)) {
          port += 1;
        }
        usedPorts.push(port);
        return `--inspect-brk=${port}`;
      }),
    );
  }

  return execArgv;
}
