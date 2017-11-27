import { fork } from 'child_process';
import send, { RESTART } from './send';

export default function start(devScriptPath) {
  const devProcess = fork(devScriptPath, process.argv.slice(2));

  devProcess.on('message', data => {
    const type = (data && data.type) || null;
    if (type === RESTART) {
      devProcess.kill('SIGINT');
      start(devScriptPath);
    }
    send(data);
  });
}
