import { logger, portfinder } from '@umijs/utils';
import type { ChildProcess } from 'child_process';
import { fork } from 'child_process';

const usedPorts: number[] = [];

interface IOpts {
  scriptPath: string;
  onChild?: (child: ChildProcess) => void;
  isStopped?: () => boolean;
}

export default function start({ scriptPath, onChild, isStopped }: IOpts) {
  let currentChild: ChildProcess;
  let restarting = false;
  const stopped = () => isStopped?.() || false;

  function spawn() {
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

    const child = fork(scriptPath, process.argv.slice(2), { execArgv });
    currentChild = child;
    restarting = false;
    onChild?.(child);

    child.on('message', (data: any) => {
      const { type, payload } = data || {};
      if (
        type === 'RESTART' &&
        child === currentChild &&
        !restarting &&
        !stopped()
      ) {
        restarting = true;
        const restart = () => {
          if (stopped()) return;
          if (payload?.port) {
            utilPortValid(payload.port, 20, stopped, (err) => {
              if (stopped()) return;
              if (err) {
                logger.error(err);
                process.exit(1);
                return;
              }
              process.env.PORT = String(payload.port);
              spawn();
            });
          } else {
            spawn();
          }
        };
        // Wait for the previous server and its resources to finish shutting down.
        if (child.exitCode !== null || child.signalCode !== null) {
          restart();
        } else {
          child.once('exit', restart);
          child.kill();
        }
      }
      process.send?.(data);
    });

    return child;
  }

  return spawn();
}

function utilPortValid(
  port: number,
  totalTry: number,
  stopped: () => boolean,
  callback: (err?: Error | null) => void,
) {
  if (stopped()) return;
  portfinder.getPort({ port }, (err, findPort) => {
    if (stopped()) return;
    if (err) callback(err);
    else {
      if (findPort === port) {
        callback();
      } else {
        if (totalTry > 0) {
          setTimeout(() => {
            utilPortValid(port, totalTry - 1, stopped, callback);
          }, 100);
        } else {
          callback(new Error(`Port ${port} is occupied`));
        }
      }
    }
  });
}
