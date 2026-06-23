const { spawn } = require('child_process');
const path = require('path');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const root = path.resolve(__dirname, '..');
let shuttingDown = false;

const apps = [
  {
    name: 'master',
    cwd: root,
  },
  {
    name: 'slave',
    cwd: path.resolve(root, '../with-utoopack-qiankun-slave'),
  },
];

const children = apps.map((app) => {
  const child = spawn(npm, ['run', 'preview'], {
    cwd: app.cwd,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    console.error(
      `${app.name} preview exited unexpectedly with ${signal || code}`,
    );
    shutdown(code || 1);
  });

  return child;
});

function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
