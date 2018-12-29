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
      const generator = new Generator(args._.slice(1), {
        ...args,
        env: {
          cwd: api.cwd,
        },
        resolved: resolved || __dirname,
      });
      return generator
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

  function registerGenerateCommand(command, description) {
    const details = `
Examples:

  ${chalk.gray('# generate page users')}
  umi generate page users

  ${chalk.gray('# g is the alias for generate')}
  umi g page index
  `.trim();
    api.registerCommand(
      command,
      {
        description,
        usage: `umi ${command} name args`,
        details,
      },
      generate,
    );
  }

  registerGenerateCommand(
    'g',
    'generate code snippets quickly (alias for generate)',
  );
  registerGenerateCommand('generate', 'generate code snippets quickly');

  api.registerGenerator('page', {
    Generator: require('./page').default(api),
    resolved: join(__dirname, './page'),
  });
  api.registerGenerator('layout', {
    Generator: require('./layout').default(api),
    resolved: join(__dirname, './layout'),
  });
}
