import { join } from 'path';
import { chalk, yParser } from '@umijs/utils';
import { existsSync } from 'fs';
import { Service } from './ServiceWithBuiltIn';
import fork from './utils/fork';
import getCwd from './utils/getCwd';
import getPkg from './utils/getPkg';

// process.argv: [node, umi.js, command, args]
const args = yParser(process.argv.slice(2), {
  alias: {
    version: ['v'],
    help: ['h'],
  },
  boolean: ['version'],
});

if (args.version && !args._[0]) {
  args._[0] = 'version';
  const local = existsSync(join(__dirname, '../.local'))
    ? chalk.cyan('@local')
    : '';
  console.log(`umi@${require('../package.json').version}${local}`);
} else if (!args._[0]) {
  args._[0] = 'help';
}

(async () => {
  try {
    switch (args._[0]) {
      case 'dev':
        const child = fork({
          scriptPath: require.resolve('./forkedDev'),
        });
        // ref:
        // http://nodejs.cn/api/process/signal_events.html
        process.on('SIGINT', () => {
          child.kill('SIGINT');
        });
        process.on('SIGTERM', () => {
          child.kill('SIGTERM');
        });
        break;
      default:
        const name = args._[0];
        if (name === 'build') {
          process.env.NODE_ENV = 'production';
        }
        await new Service({
          cwd: getCwd(),
          pkg: getPkg(process.cwd()),
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
