const { spawn } = require('child_process');

module.exports = function exec(command, args, opts) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      command,
      args,
      Object.assign({ stdio: 'inherit', env: process.env }, opts),
    );
    child.once('error', err => {
      console.log(err);
      reject(err);
    });
    child.once('close', code => {
      if (code === 1) {
        process.exit(1);
      } else {
        resolve();
      }
    });
  });
};
