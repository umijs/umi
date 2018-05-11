import chalk from 'chalk';

const commands = {
  build: {
    name: 'build',
    description: 'Create a production build',
  },
  dev: {
    name: 'dev',
    description: 'Start a development server',
  },
  test: {
    name: 'test',
    description: 'Start a development server',
  },
  help: {
    name: 'help',
    description: 'show help',
    aliases: ['h'],
  },
  version: {
    name: '--version --v',
    description: 'Outputs Umi version.',
    aliases: ['v'],
  },
};

function help(aliasedScript) {
  let usage = `\nUsage: umi <command>\n`;
  let helpArea = '';
  for (let cmd in cmds) {
    helpArea += ' ' + cmd + Array(25 - cmd.length).join(' ') + cmds[cmd] + '\n';
  }
  console.log([usage, helpArea].join(`\nCommands:\n\n`));
  if (!['help', '-h', '--help'].includes(aliasedScript)) {
    console.log(`Unknown script ${chalk.cyan(aliasedScript)}.`);
  }
}

class Logger {
  info = message => {
    console.log(`${message}`);
  };

  error = message => {
    console.error(chalk.red(message));
  };

  success = message => {
    console.error(chalk.green(message));
  };
}

export default function(opts = {}) {
  const { type } = opts;
  const logger = new Logger();
  logger.info(`\nUsage: umi <command>\n`);
  if (!commands[type]) {
    logger.error(`Unknown script : ${chalk.cyan(type)}.`);
  }
  logger.info(`Available Commands:`);
  for (const key in commands) {
    if (commands.hasOwnProperty(key)) {
      const cmd = commands[key];
      logger.info(`  ${chalk.cyan(cmd.name)} ${cmd.description}`);
    }
  }
  // Support for subsequent extensions
  // logger.info(`\nFor more detailed help run "umi [command name] --help"`);
}
