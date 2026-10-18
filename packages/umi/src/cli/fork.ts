import { logger, portfinder } from '@umijs/utils';
import type { ChildProcess } from 'child_process';
import { fork } from 'child_process';

const usedPorts: number[] = [];

interface IOpts {
  scriptPath: string;
}

export default function start({ scriptPath }: IOpts) {
  let child: ChildProcess;
  let restarting = false;
  let stopping = false;

  function spawn() {
    const worker = fork(scriptPath, process.argv.slice(2), {
      execArgv: getExecArgv(),
    });
    child = worker;
    worker.on('message', (data: any) => {
      const { type, payload } = data || {};
      if (type === 'RESTART' && !restarting && !stopping) {
        restarting = true;
        // wait for the old worker to release its ports before starting a new one
        terminate(worker)
          .then(() => payload?.port && waitForPort(payload.port))
          .then(() => {
            if (stopping) return;
            if (payload?.port) process.env.PORT = payload.port;
            restarting = false;
            spawn();
          })
          .catch((err) => {
            logger.error(err);
            process.exit(1);
          });
      }
      process.send?.(data);
    });
  }

  spawn();

  return {
    get child() {
      return child;
    },
    stop(signal: NodeJS.Signals) {
      stopping = true;
      return terminate(child, signal);
    },
  };
}

function terminate(child: ChildProcess, signal: NodeJS.Signals = 'SIGTERM') {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    // force kill if the worker does not exit in time
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
    child.kill(signal);
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

function waitForPort(port: number, totalTry = 20): Promise<void> {
  return new Promise((resolve) => {
    portfinder.getPort({ port }, (err, findPort) => {
      // keep the existing fallback: start anyway if probing fails or times out
      if (err || findPort === port || totalTry <= 0) return resolve();
      setTimeout(() => waitForPort(port, totalTry - 1).then(resolve), 100);
    });
  });
}
