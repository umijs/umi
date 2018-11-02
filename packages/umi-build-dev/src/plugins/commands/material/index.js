import assert from 'assert';
import chalk from 'chalk';
import { getPathWithUrl } from './download';

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
    const MaterialGenerate = require('./material')(api);
    let codePath;
    try {
      codePath = getPathWithUrl(url, log);
    } catch (e) {
      log(chalk.red(e.message));
      log(
        chalk.red(`
Can't parse ${url}, please check your material url or network.
Url can be a npm package, like '@umi-material/demo'.
Or a github(gitlab) url, like https://github.com/umijs/umi-materials/tree/master/demo
Or a git repo url, like git@github.com:umijs/umi-materials.git.
      `),
      );
    }

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
