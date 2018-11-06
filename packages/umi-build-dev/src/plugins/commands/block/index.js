import assert from 'assert';
import chalk from 'chalk';
import { getPathWithUrl } from './download';

const debug = require('debug')('umi-build-dev:blockPlugin');

export default api => {
  const { log } = api;

  function generate(args = {}) {
    const url = args._[0];
    assert(
      url,
      `run ${chalk.cyan.underline('umi help block')} or ${chalk.cyan.underline(
        'umi help m',
      )} to checkout the usage`,
    );
    const MaterialGenerate = require('./block').default(api);
    debug(`get url ${url}`);
    const sourcePath = getPathWithUrl(url, log, args);
    const { name, npmClient } = args;
    debug(
      `get local sourcePath: ${sourcePath} and npmClient: ${npmClient} and name: ${name}`,
    );
    const generate = new MaterialGenerate(process.argv.slice(4), {
      sourcePath,
      npmClient,
      name,
      env: {
        cwd: api.cwd,
      },
      resolved: __dirname,
    });

    generate
      .run()
      .then(() => {
        log.success('');
      })
      .catch(e => {
        log.error(e);
      });
  }

  const details = `
Examples:

  ${chalk.gray('# get block `demo` which in umi official blocks')}
  umi block https://github.com/umijs/umi-blocks/tree/master/demo
  `.trim();

  api.registerCommand(
    'block',
    {
      description: 'get block',
      usage: 'umi block url',
      details,
    },
    generate,
  );
};
