// Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/commands/help.js
import chalk from 'chalk';
import padEnd from 'string.prototype.padend';
import getPadLength from '../../utils/getPadLength';

export default api => {
  api.registerCommand('help', args => {
    const command = args._[0];
    if (!command) {
      logMainHelp();
    } else {
      logHelpForCommand(command, api.service.commands[command]);
    }
  });

  function logMainHelp() {
    console.log(`\n  Usage: umi <command> [options]\n` + `\n  Commands:\n`);
    const commands = api.service.commands;
    const padLength = getPadLength(commands);
    for (const name in commands) {
      if (name !== 'help') {
        const opts = commands[name].opts || {};
        console.log(
          `    ${chalk.green(padEnd(name, padLength))}${opts.description ||
            ''}`,
        );
      }
    }
    console.log(
      `\n  run ${chalk.blue(
        `umi help [command]`,
      )} for usage of a specific command.\n`,
    );
  }

  function logHelpForCommand(name, command) {
    if (!command) {
      console.log(chalk.red(`\n  command "${name}" does not exist.`));
    } else {
      const opts = command.opts || {};
      if (opts.usage) {
        console.log(`\n  Usage: ${opts.usage}`);
      }
      if (opts.options) {
        console.log(`\n  Options:\n`);
        const padLength = getPadLength(opts.options);
        for (const name in opts.options) {
          console.log(
            `    ${chalk.blue(padEnd(name, padLength))}${opts.options[name]}`,
          );
        }
      }
      if (opts.details) {
        console.log();
        console.log(
          opts.details
            .split('\n')
            .map(line => `  ${line}`)
            .join('\n'),
        );
      }
      console.log();
    }
  }
};
