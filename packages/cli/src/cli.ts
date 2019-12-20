import { join } from 'path';
import { yParser, chalk } from '@umijs/utils';
import { Service } from '@umijs/core';

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

(async () => {
  try {
    switch (args._[0]) {
      default:
        await new Service({
          cwd,
          useBuiltIn: true,
        }).run({
          name: args._[0],
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
