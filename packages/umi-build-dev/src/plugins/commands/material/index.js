import assert from 'assert';
import chalk from 'chalk';
import { getPathWithUrl } from './download';

const debug = require('debug')('umi-build-dev:materialPlugin');

export default api => {
  const { log } = api;

  function generate(args = {}) {
    const url = args._[0];
    assert(
      url,
      `run ${chalk.cyan.underline(
        'umi help material',
      )} or ${chalk.cyan.underline('umi help m')} to checkout the usage`,
    );
    const MaterialGenerate = require('./material').default(api);
    debug(`get url ${url}`);
    const codePath = getPathWithUrl(url, log);
    debug(`get local codePath ${codePath}`);
    const generate = new MaterialGenerate({
      codePath,
    });

    generate.run(() => {});
  }

  const details = `
Examples:

  ${chalk.gray('# get material `demo` which in umi official materials')}
  umi material https://github.com/umijs/umi-materials/tree/master/demo

  ${chalk.gray('# m is the alias for material')}
  umi m https://github.com/umijs/umi-materials/tree/master/demo
  `.trim();

  api.registerCommand(
    'm',
    {
      description: 'get material (alias for material)',
      usage: 'umi m url',
      details,
    },
    generate,
  );

  api.registerCommand(
    'material',
    {
      description: 'get material',
      usage: 'umi material url',
      details,
    },
    generate,
  );
};
