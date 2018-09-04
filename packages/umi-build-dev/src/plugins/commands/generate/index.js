import { join } from 'path';
import assert from 'assert';

export default function(api) {
  const { generators } = api.service;

  function generate(args = {}) {
    const name = args._[0];
    assert(name, `Invalid arguments, try to use *umi generate name {args}*`);
    assert(generators[name], `Generator ${name} not found`);
    const { Generator, resolved } = generators[name];
    const generator = new Generator(process.argv.slice(4), {
      env: {
        cwd: api.cwd,
      },
      resolved: resolved || __dirname,
    });
    generator.run(() => {
      console.log('Done');
    });
  }

  api.registerCommand(
    'g',
    {
      description: 'generate code snippets quickly (alias for generate)',
    },
    generate,
  );
  api.registerCommand(
    'generate',
    {
      description: 'generate code snippets quickly',
    },
    generate,
  );

  api.registerGenerator('page', {
    Generator: require('./page').default(api),
    resolved: join(__dirname, './page'),
  });
}
