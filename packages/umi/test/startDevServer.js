import { fork } from 'child_process';
import { join } from 'path';

const DEV_SCRIPT = join(__dirname, '../lib/scripts/dev.js');

export default function(opts = {}) {
  const { port, cwd } = opts;
  return new Promise(resolve => {
    const child = fork(DEV_SCRIPT, ['dev', '--port', port, '--cwd', cwd], {
      env: {
        CLEAR_CONSOLE: 'none',
        BROWSER: 'none',
      },
    });
    child.on('message', args => {
      if (args.type === 'DONE') {
        resolve(child);
      }
    });
  });
}
