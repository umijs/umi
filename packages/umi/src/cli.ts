import { chalk, yParser } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import initWebpack from './initWebpack';
import { Service } from './ServiceWithBuiltIn';
import fork from './utils/fork';
import getCwd from './utils/getCwd';
import getPkg from './utils/getPkg';

const v = process.version;

if (v && parseInt(v.slice(1)) < 10) {
  console.log(
    chalk.red(
      `Your node ${v} is not supported by umi, please upgrade to 10 or above.`,
    ),
  );
  process.exit(1);
}

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

// allow parent framework to modify the title
if (process.title === 'node') {
  process.title = 'umi';
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
        // https://lisk.io/blog/development/why-we-stopped-using-npm-start-child-processes
        process.on('SIGINT', () => {
          child.kill('SIGINT');
          // ref:
          // https://github.com/umijs/umi/issues/6009
          process.exit(0);
        });
        process.on('SIGTERM', () => {
          child.kill('SIGTERM');
          process.exit(1);
        });
        break;
      default:
        const name = args._[0];
        if (name === 'build') {
          process.env.NODE_ENV = 'production';
        }

        // Init webpack version determination and require hook for build command
        initWebpack();

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
