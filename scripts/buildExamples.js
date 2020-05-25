const path = require('path');
const { fork } = require('child_process');

const { glob, signale } = require('@umijs/utils');

const UMI_SCRIPT = path.join(__dirname, '../packages/umi/bin/umi.js');

function build({ cwd }) {
  return new Promise((resolve) => {
    signale.pending(cwd);
    const child = fork(UMI_SCRIPT, ['build'], {
      env: {
        ...process.env,
        BABEL_CACHE: 'none',
        COMPRESS: 'none',
      },
      cwd,
      stdio: 'ignore',
    });
    child.on('exit', (code) => {
      if (code === 0) {
        signale.complete(`success build ${cwd}`);
        resolve();
        return;
      }
      signale.fatal(cwd);
      process.exit(code);
    });
    process.on('exit', () => {
      child.kill('SIGINT');
    });
  });
}

async function buildExamples(customProjectPaths) {
  const examples = glob.sync('examples/*', {
    dot: false,
    absolute: true,
    cwd: path.join(__dirname, '..'),
  });

  const projects =
    Array.isArray(customProjectPaths) && customProjectPaths.length > 0
      ? customProjectPaths
      : examples;
  await Promise.all(projects.map((project) => build({ cwd: project })));
}

module.exports = buildExamples;
