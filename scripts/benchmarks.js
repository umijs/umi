const path = require('path');

const Benchmark = require('benchmark');
const { glob } = require('@umijs/utils');
const buildExamples = require('./buildExamples');

// benchmarks entry
const bootstrap = async () => {
  const benchmarks = glob.sync('examples/*/benchmark.js', {
    dot: false,
    absolute: true,
    cwd: path.join(__dirname, '..'),
  });
  const projects = benchmarks.map((benchmark) => path.dirname(benchmark));
  await buildExamples(projects);
  const suite = new Benchmark.Suite();
  benchmarks.forEach((benchmark) => {
    const benchmarkFunc = require(benchmark);
    benchmarkFunc(suite);
  });

  suite
    .on('cycle', function (event) {
      console.log(String(event.target));
    })
    .on('complete', function () {
      console.log('');
      for (let index = 0; index < this.length; index++) {
        const benchmark = this[index];
        console.log(benchmark.name);
        console.log(
          `Mean:    ${Math.round(benchmark.stats.mean * 1000 * 1000)} ms`,
        );
        console.log('');
      }
    })
    // run async
    .run({ async: true });
};

bootstrap();
