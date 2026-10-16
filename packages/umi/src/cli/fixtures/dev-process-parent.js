const childProcess = require('child_process');
const path = require('path');

const fork = childProcess.fork;
let worker;

// Exercise the real dev supervisor, replacing only the expensive compiler worker.
childProcess.fork = (scriptPath, args, options) => {
  if (scriptPath !== require.resolve('../../../bin/forkedDev')) {
    throw new Error(`Unexpected worker: ${scriptPath}`);
  }
  worker = fork(path.join(__dirname, 'dev-process-worker.js'), args, options);
  process.send({ type: 'FIXTURE_SPAWN', pid: worker.pid });
  const pid = worker.pid;
  worker.once('exit', (code, signal) => {
    process.send({ type: 'FIXTURE_WORKER_EXIT', pid, code, signal });
  });
  return worker;
};

process.on('message', (message) => {
  worker.send(message);
});

require('../dev.ts').dev();
