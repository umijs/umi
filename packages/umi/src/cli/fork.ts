import { portfinder } from '@umijs/utils';
import type { ChildProcess } from 'child_process';
import { fork } from 'child_process';

const usedPorts: number[] = [];

interface IOpts {
  scriptPath: string;
  onChild?: (child: ChildProcess) => void;
}

export default function start({ scriptPath, onChild }: IOpts) {
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
  onChild?.(child);
  let restarting = false;

  child.on('message', (data: any) => {
    const { type, payload } = data || {};
    if (type === 'RESTART' && !restarting) {
      restarting = true;
      // wait for the old server to release its port before starting a new one
      child.once('exit', () => {
        if (!payload?.port) return start({ scriptPath, onChild });
        utilPortValid(payload.port, 20, () => {
          process.env.PORT = payload.port;
          start({ scriptPath, onChild });
        });
      });
      child.kill();
    }
    process.send?.(data);
  });

  return child;
}

function utilPortValid(port: number, totalTry: number, callback: Function) {
  portfinder.getPort({ port }, (err, findPort) => {
    if (err) callback(err);
    else {
      if (findPort === port) {
        callback();
      } else {
        if (totalTry > 0) {
          setTimeout(() => {
            utilPortValid(port, totalTry - 1, callback);
          }, 100);
        } else {
          callback(new Error(`Port ${port} is occupied`));
        }
      }
    }
  });
}
