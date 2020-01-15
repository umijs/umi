import { join } from 'path';
import { yParser, chalk } from '@umijs/utils';
import { existsSync } from 'fs';
import { Service } from './Service';

// process.argv: [node, umi.js, command, args]
const args = yParser(process.argv.slice(2), {
  alias: {
    version: ['v'],
    help: ['h'],
  },
  boolean: ['version'],
});

let cwd = process.cwd();
if (process.env.APP_ROOT) {
  cwd = join(cwd, process.env.APP_ROOT);
}

if (args.version && !args._[0]) {
  args._[0] = 'version';
  const local = existsSync(join(__dirname, '../.local'))
    ? chalk.cyan('@local')
    : '';
  console.log(`umi@${require('../package.json').version}${local}`);
}

(async () => {
  try {
    switch (args._[0]) {
      default:
        const name = args._[0];
        if (name === 'build') {
          process.env.NODE_ENV = 'production';
        } else if (name === 'dev') {
          process.env.NODE_ENV = 'development';
        }
        await new Service({
          cwd,
        }).run({
          name,
          args,
        });
        break;
    }
  } catch (e) {
    console.error(chalk.red(e.message));
    console.error(e.stack);
    process.exit(1);
  }
})();
