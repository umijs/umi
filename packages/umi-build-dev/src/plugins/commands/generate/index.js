import { readdirSync } from 'fs';
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
      assert(name, `run ${chalk.cyan.underline('umi help generate')} to checkout the usage`);
      assert(generators[name], `Generator ${chalk.cyan.underline(name)} not found`);
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
      console.log(e);
    }
  }

  function registerCommand(command, description) {
    const details = `
Examples:

  ${chalk.gray('# generate page users')}
  umi generate page users

  ${chalk.gray('# g is the alias for generate')}
  umi g page index

  ${chalk.gray('# generate page with less file')}
  umi g page index --less
  `.trim();
    api.registerCommand(
      command,
      {
        description,
        usage: `umi ${command} type name [options]`,
        details,
      },
      generate,
    );
  }

  registerCommand('g', 'generate code snippets quickly (alias for generate)');
  registerCommand('generate', 'generate code snippets quickly');

  readdirSync(`${__dirname}/generators`)
    .filter(f => !f.startsWith('.'))
    .forEach(f => {
      api.registerGenerator(f, {
        // eslint-disable-next-line import/no-dynamic-require
        Generator: require(`./generators/${f}`).default(api),
        resolved: `${__dirname}/generators/${f}/index`,
      });
    });
}
