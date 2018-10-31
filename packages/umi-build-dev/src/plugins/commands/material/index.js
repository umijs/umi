import assert from 'assert';
import chalk from 'chalk';

export default api => {
  function generate(args = {}) {
    const url = args._[0];
    assert(
      url, // TODO check is a github url
      `run ${chalk.cyan.underline(
        'umi help material',
      )} or ${chalk.cyan.underline('umi help m')} to checkout the usage`,
    );
  }

  const details = `
Examples:

  ${chalk.gray('# get material `demo` which in umi official materials')}
  umi material https://github.com/umijs/umi-materials/demo

  ${chalk.gray('# m is the alias for material')}
  umi m https://github.com/umijs/umi-materials/demo
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
