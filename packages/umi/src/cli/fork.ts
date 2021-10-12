import { fork } from 'child_process';

const usedPorts: number[] = [];

interface IOpts {
  scriptPath: string;
}

export default function start({ scriptPath }: IOpts) {
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

  child.on('message', (data: any) => {
    const { type, payload } = data || {};
    if (type === 'RESTART') {
      child.kill();
      if (payload?.port) {
        process.env.PORT = payload.port;
      }
      start({ scriptPath });
    }
    process.send?.(data);
  });

  return child;
}
