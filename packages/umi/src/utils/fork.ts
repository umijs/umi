import { fork } from 'child_process';

const usedPorts: number[] = [];
let CURRENT_PORT: number | undefined;

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
      inspectArgv.replace(/--inspect-brk=(.*)/, (match, s1) => {
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

  // set port to env when current port has value
  if (CURRENT_PORT) {
    // @ts-ignore
    process.env.PORT = CURRENT_PORT;
  }

  const child = fork(scriptPath, process.argv.slice(2), { execArgv });

  child.on('message', (data: any) => {
    const type = (data && data.type) || null;
    if (type === 'RESTART') {
      child.kill();
      start({ scriptPath });
    } else if (type === 'UPDATE_PORT') {
      // set current used port
      CURRENT_PORT = data.port as number;
    }
    process.send?.(data);
  });

  return child;
}
