const path = require('path');
const { fork } = require('child_process');

const Benchmark = require('benchmark');
const { glob } = require('@umijs/utils');

const UMI_SCRIPT = path.join(__dirname, '../packages/umi/bin/umi.js');

function build({ cwd }) {
  return new Promise((resolve) => {
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
        resolve();
        return;
      }
      process.exit(code);
    });
    process.on('exit', () => {
      child.kill('SIGINT');
    });
  });
}

const buildProjects = async () => {
  const projects = glob.sync('**/*/fixtures/*', {
    dot: false,
    absolute: true,
    cwd: __dirname,
  });
  await Promise.all(projects.map((project) => build({ cwd: project })));
};

// benchmarks entry
const bootstrap = async () => {
  await buildProjects();
  const suite = new Benchmark.Suite();
  const benchmarks = glob.sync('**/*.js', {
    dot: false,
    absolute: true,
    nodir: true,
    ignore: ['index.js', '**/*/fixtures/**/*'],
    cwd: __dirname,
  });
  benchmarks.forEach((benchmark) => {
    const benchmarkFunc = require(benchmark);
    benchmarkFunc(suite);
  });

  suite
    .on('cycle', function (event) {
      console.log(String(event.target));
    })
    .on('complete', function () {})
    // run async
    .run({ async: true });
};

bootstrap();
