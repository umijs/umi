import { join } from 'path';
import assert from 'assert';
import chalk from 'chalk';

export default function(api) {
  const {
    service: { generators },
    log,
  } = api;

  function generate(args = {}) {
    try {
      const name = args._[0];
      assert(
        name,
        `run ${chalk.cyan.underline(
          'umi help generate',
        )} to checkout the usage`,
      );
      assert(
        generators[name],
        `Generator ${chalk.cyan.underline(name)} not found`,
      );
      const { Generator, resolved } = generators[name];
      const generator = new Generator(process.argv.slice(4), {
        env: {
          cwd: api.cwd,
        },
        resolved: resolved || __dirname,
      });
      generator
        .run()
        .then(() => {
          log.success('');
        })
        .catch(e => {
          log.error(e);
        });
    } catch (e) {
      log.error(`Generate failed, ${e.message}`);
    }
  }

  const details = `
Examples:

  ${chalk.gray('# generate page users')}
  umi generate page users

  ${chalk.gray('# g is the alias for generate')}
  umi g page index
  `.trim();
  api.registerCommand(
    'g',
    {
      description: 'generate code snippets quickly (alias for generate)',
      usage: 'umi g name args',
      details,
    },
    generate,
  );
  api.registerCommand(
    'generate',
    {
      description: 'generate code snippets quickly',
      usage: 'umi generate name args',
      details,
    },
    generate,
  );

  api.registerGenerator('page', {
    Generator: require('./page').default(api),
    resolved: join(__dirname, './page'),
  });
}
