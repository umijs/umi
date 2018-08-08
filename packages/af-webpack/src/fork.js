import { fork } from 'child_process';
import send, { RESTART } from './send';

export default function start(scriptPath) {
  const child = fork(scriptPath, process.argv.slice(2));

  child.on('message', data => {
    const type = (data && data.type) || null;
    if (type === RESTART) {
      child.kill();
      start(scriptPath);
    }
    send(data);
  });

  return child;
}
