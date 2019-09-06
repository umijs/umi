/* eslint-disable guard-for-in */
/* eslint-disable prefer-destructuring */
// Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/commands/help.js
import chalk from 'chalk';
import { padEnd } from 'lodash';
import getPadLength from '../../utils/getPadLength';

export default api => {
  api.registerCommand(
    'help',
    {
      hide: true,
    },
    args => {
      const helpInfo = api.applyPlugins('_modifyHelpInfo', {
        initialValue: {
          scriptName: 'umi',
          commands: api.service.commands,
        },
      });
      helpInfo.commands = {
        ui: {
          opts: {
            usage: 'umi ui',
            description: 'visual assist tool for umi project',
            options: {},
          },
        },
        ...helpInfo.commands,
      };
      const command = args._[0];
      if (!command) {
        logMainHelp(helpInfo);
      } else {
        logHelpForCommand(command, helpInfo.commands[command]);
      }
    },
  );

  function logMainHelp(helpInfo) {
    console.log(`\n  Usage: ${helpInfo.scriptName} <command> [options]\n`);
    console.log(`  Commands:\n`);
    const { commands } = helpInfo;
    const padLength = getPadLength(commands);
    for (const name in commands) {
      const opts = commands[name].opts || {};
      if (opts.hide !== true) {
        console.log(`    ${chalk.green(padEnd(name, padLength))}${opts.description || ''}`);
      }
    }
    console.log(
      `\n  run ${chalk.blue(
        `${helpInfo.scriptName} help [command]`,
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
          console.log(`    ${chalk.green(padEnd(name, padLength))}${opts.options[name]}`);
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
